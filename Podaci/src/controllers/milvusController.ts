import type { Request, Response } from 'express';
import { milvusClient, collectionName,createCollection } from '../database/schema/shemamilvus.ts';
import { getLocalEmbedding } from "../embedding/localEmbedding.ts";


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

export const searchVectors = async (req: Request, res: Response) => {
  try {
    console.log("Pozvan je endpoint searchVector");
    const { text, topK = 5, collectionName , metricType = "L2", indexParams = { nprobe: 128 } } = req.body;
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


export const searchVectorshybrid = async (req: Request, res: Response) => {
  try {
    const { text, topK = 5, collectionName , metricType = "L2", indexParams = { nprobe: 128 }, filter="id > 1000" } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required in the body" });
    } 
    // Generiši embedding iz teksta
    const vector = await getLocalEmbedding(text);

    // Pretraži Milvus kolekciju
   const result = await milvusClient.search({
  collection_name: collectionName,
  vector: vector,
  filter: filter,  // ⬅️ scalar filter deo
  output_fields: ["title", "description","id"],  
  metric_type: metricType,       // polja koja želiš da dobiješ
  limit: topK,                                       // broj rezultata
  params: { nprobe: 128 },                         // parametri pretrage
});

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus search error" });
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