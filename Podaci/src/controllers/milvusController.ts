import type { Request, Response } from 'express';
import { milvusClient, collectionName,createCollection } from '../database/schema/shemamilvus.ts';
import { getLocalEmbedding } from "../embedding/localEmbedding.ts";
import { ConsistencyLevelEnum } from "@zilliz/milvus2-sdk-node";


export async function searchFullText(req: Request, res: Response) {
  try {
    const q = (req.query.q as string) || (req.body?.q as string);
    if (!q?.trim()) {
      return res.status(400).json({ error: "Query parameter 'q' is required." });
    }

    const k = req.query.k ? Number(req.query.k) : 5;
    const drop = req.query.drop ? Number(req.query.drop) : 0.2; // 0.0 = ne odbacuj
    const coll = (collectionName && collectionName.trim()) || "test";

    // učitaj kolekciju (posle starta procesa)
    await milvusClient.loadCollection({ collection_name: coll });

    // BM25 nad sparse poljem generisanim iz description
    const result = await milvusClient.search({
  collection_name: coll,
  data: [q],
  anns_field: "text_sparse",
  limit: k,
  params: { drop_ratio_search: 0.2 }, // KLJUČNO: Node očekuje "params" ovde
  output_fields: ["id", "title", "description"],
  consistency_level: ConsistencyLevelEnum.Strong,
});


    return res.json({
      collection: coll,
      query: q,
      count: result.results.length,
      results: result.results,
    });
  } catch (err: any) {
    console.error("fulltextSearch error:", err);
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
}



export const searchVectors = async (req: Request, res: Response) => {
  try {
    console.log("Pozvan je endpoint searchVector");
    const { text, topK = 5, collectionName="test" , metricType = "IP", indexParams = { nprobe: 128 } } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required in the body" });
    }

    // Generiši embedding iz teksta
    const vector = await getLocalEmbedding(text);

    await milvusClient.loadCollection({
  collection_name: collectionName,
});
    console.log(collectionName);
    // Pretraži Milvus kolekciju
    const result = await milvusClient.search({
      collection_name: collectionName,
      vectors: [vector], //embeding kad se napravi 
      search_params: {
        anns_field: "vector",
        topk: topK,
        metric_type: metricType,  // L2, IP, COSINE itd.
        params: JSON.stringify(indexParams),
      },
      output_fields: ["title", "description","id"],  
    });
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus search error" });
  }
};


type Hit = { id: number | string; title?: string; description?: string; score?: number };

function toHit(x: any): Hit {
  return {
    id: x.id ?? x.ID ?? x.pk ?? x.primary_key,
    title: x.title,
    description: x.description,
    score: x.score ?? x.distance ?? x._score,
  };
}

function rrfFuse(dense: Hit[], sparse: Hit[], k = 60, topK = 5): Hit[] {
  const scoreMap = new Map<string | number, number>();
  const metaMap = new Map<string | number, Hit>();

  dense.forEach((h, i) => {
    const add = 1 / (k + (i + 1));
    scoreMap.set(h.id, (scoreMap.get(h.id) || 0) + add);
    if (!metaMap.has(h.id)) metaMap.set(h.id, h);
  });
  sparse.forEach((h, i) => {
    const add = 1 / (k + (i + 1));
    scoreMap.set(h.id, (scoreMap.get(h.id) || 0) + add);
    if (!metaMap.has(h.id)) metaMap.set(h.id, h);
  });

  return Array.from(scoreMap.entries())
    .map(([id, s]) => ({ ...(metaMap.get(id) as Hit), id, score: s }))
    .sort((a, b) => (b.score! - a.score!))
    .slice(0, topK);
}

export async function searchHybrid(req: Request, res: Response) {
  try {
    const q = (req.body?.q ?? req.query?.q ?? "").toString().trim();
    if (!q) return res.status(400).json({ error: "Query 'q' is required." });

    const coll =
      (req.body?.collectionName as string)?.trim() ||
      (collectionName && collectionName.trim()) ||
      "test";

    const topK = Number(req.body?.topK ?? req.query?.k ?? 5);
    const metricType = (req.body?.metricType as "IP" | "COSINE" | "L2") || "IP";
    const nprobe = Number(req.body?.nprobe ?? 128);
    const dropRatio = Number(req.body?.dropRatio ?? 0.0);
    const rrfK = Number(req.body?.rrfK ?? 60);

    await milvusClient.loadCollection({ collection_name: coll });

    // 1) DENSE (vektorska)
    const qvec = await getLocalEmbedding(q); // dim mora odgovarati polju 'vector'
    const denseRes = await milvusClient.search({
      collection_name: coll,
      vectors: [qvec],
      params: { anns_field: "vector", topk: Math.max(topK, 50), metric_type: metricType, nprobe },
      output_fields: ["id", "title", "description"],
      consistency_level: ConsistencyLevelEnum.Strong,
    });
    const denseHits = (denseRes.results || []).map(toHit);

    // 2) SPARSE (BM25)
    const sparseRes = await milvusClient.search({
      collection_name: coll,
      data: [q],
      anns_field: "text_sparse",
      limit: Math.max(topK, 50),
      params: { drop_ratio_search: dropRatio }, // Node SDK: params na top-level
      output_fields: ["id", "title", "description"],
      consistency_level: ConsistencyLevelEnum.Strong,
    });
    const sparseHits = (sparseRes.results || []).map(toHit);

    // 3) RRF fuzija
    const fused = rrfFuse(denseHits, sparseHits, rrfK, topK);

    return res.json({
      collection: coll,
      query: q,
      counts: { dense: denseHits.length, sparse: sparseHits.length, fused: fused.length },
      results: fused,
    });
  } catch (err: any) {
    console.error("hybridSearch error:", err);
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
}




// Ubaci vektor u kolekciju
export const insertVector = async (req: Request, res: Response) => {
  try {
    const {description, title, collectionName} = req.body;
    const vector=await getLocalEmbedding(description);

    const result = await milvusClient.insert({
      collection_name: collectionName || collectionName,
      fields_data: [{ vector, title, description}],  // polja u milvus bazi 
    });
    console.log("Pozvano kreiranje recepta");
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus insert error" });
  }
};





export const queryFilterRoute = async (req: Request, res: Response) => {
  try {
    const { collectionName, filter = "id > 1000" } = req.body;

    if (!collectionName) {
      return res.status(400).json({ message: "collectionName is required in the body" });
    }
    const result = await milvusClient.query({
      collection_name: collectionName,
      expr: filter,
      output_fields: ["id", "title", "description"],
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus query error" });
  }
};

// Brisanje vektora
export const deleteVector = async (req: Request, res: Response) => {
  try {
      const { id, collectionName } = req.params;
      const result = await milvusClient.deleteEntities({
      collection_name: collectionName|| "Proba1",
      expr: `id == ${id}`,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus delete error" });
  }
};

export async function searchByIdRoute(req: Request, res: Response) {
  try {
    const { id, collectionName } = req.body;
    if (!id || !collectionName) {
      return res.status(400).json({ error: "Nedostaje id ili collectionName" });
    }

    // Logika je u funkciji
    const result = await searchById(id, collectionName);
    res.json({ data: result.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška u pretrazi po ID-u" });
  }
}

export async function searchById(id: number, collectionName: string) {
  return milvusClient.query({
    collection_name: collectionName,
    expr: `id == ${id}`,
    output_fields: ["id", "title", "description"]
  });
}