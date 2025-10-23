import type { Request, Response } from 'express';
import { milvusClient, collectionName,createCollection } from '../database/schema/shemamilvus.ts';
import { getLocalEmbedding } from "../embedding/localEmbedding.ts";

// Kreiraj kolekciju
export const createMilvusCollection = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const result = await createCollection(name || collectionName);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus error" });
  }
};

// Ubaci vektor u kolekciju
export const insertVector = async (req: Request, res: Response) => {
  try {
    const { id,description, title } = req.body;
    const vector=await getLocalEmbedding(description);

    const result = await milvusClient.insert({
      collection_name: collectionName,
      fields_data: [{ id, vector, title, description}],  // polja u milvus bazi 
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus insert error" });
  }
};


export const searchVectors = async (req: Request, res: Response) => {
  try {
    const { text, topK = 5, collectionName , metricType = "L2", indexParams = { nprobe: 128 } } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required in the body" });
    }

    // Generiši embedding iz teksta
    const vector = await getLocalEmbedding(text);

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
      output_fields: ["title", "description"],  
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus search error" });
  }
};


export const searchVectorshybrid = async (req: Request, res: Response) => {
  try {
    const { text, topK = 5, collectionName , metricType = "L2", indexParams = { nprobe: 128 }, filter="id>1000" } = req.body;
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
  output_fields: ["title", "description"],  
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
    const { collectionName, filter = "id>1000" } = req.body;

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
      const { id } = req.params;
      const result = await milvusClient.deleteEntities({
      collection_name: collectionName,
      expr: `id == ${id}`,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus delete error" });
  }
};

export  const createMilvusIndex = async (req: Request, res: Response) =>  {
  try {
    const { fieldName, indexName, collectionName , metricType = "L2", indexType="IVF_FLAT" } = req.body;
    const result = await milvusClient.createIndex({
      collection_name: collectionName || "Proba1",
      field_name: fieldName,
      index_name: indexName,
      index_type: indexType,   // npr. "IVF_FLAT"
      metric_type: metricType, 
      params: { nlist: 1024 },
      }
      );

    console.log(`✅ Index "${indexName}" created for collection "${collectionName}"`);

    res.json(result);

  } catch (err) {
    console.error("❌ Failed to create index:", err);
    throw err;
  }
}

export const listMilvusIndexes = async (req: Request, res: Response) => {
  try {
    const { collectionName, fieldName } = req.body;

    if (!collectionName || !fieldName) {
      return res.status(400).json({ message: "collectionName i fieldName su obavezni" });
    }

    // Poziv Milvus SDK da dobije informacije o indeksu za polje
    const result = await milvusClient.describeIndex({
      collection_name: collectionName,
      field_name: fieldName,
    });

    // result sadrži informacije o indeksu polja
    res.json({ collection: collectionName, field: fieldName, index: result });
  } catch (err) {
    console.error("❌ Failed to list indexes:", err);
    res.status(500).json({ message: "Failed to list indexes", error: err });
  }
};



export const dropMilvusIndex = async (req: Request, res: Response) => {
  try {
    const { collectionName, indexName } = req.body;

    if (!collectionName || !indexName) {
      return res.status(400).json({ message: "collectionName i indexName su obavezni" });
    }

    const result = await milvusClient.dropIndex({
      collection_name: collectionName,
      index_name: indexName,
    });

    console.log(`✅ Index "${indexName}" deleted from collection "${collectionName}"`);
    res.json({ message: `Index "${indexName}" deleted successfully`, result });
  } catch (err) {
    console.error("❌ Failed to delete index:", err);
    res.status(500).json({ message: "Failed to delete index", error: err });
  }
};

// 📋 Lista kolekcija
export const  listCollections= async (req: Request, res: Response)=> {
  try {
    const result = await milvusClient.listCollections();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// 🔍 Detalji kolekcije
export const describeCollection = async (req: Request, res: Response)=>{
  try {
    const name = req.params.name;
    const result = await milvusClient.describeCollection({ collection_name: name || collectionName});
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// 🗑️ Brisanje kolekcije
export const dropCollection = async(req: Request, res: Response)=> {
  try {
    const name = req.params.name;
    const result = await milvusClient.dropCollection({ collection_name: name || collectionName });
    res.json({ message: `Kolekcija '${name}' obrisana.`, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}