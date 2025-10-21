import type { Request, Response } from 'express';
import { milvusClient, collectionName,createCollection } from '../database/schema/shemamilvus.ts';
import { getLocalEmbedding } from "../embedding/localEmbedding.ts";


// collectionName mi je u shemamilvus.ts

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
    //vector ne treba iz body nego da se pravi ovde 
    const { id, vector, name } = req.body;
    const result = await milvusClient.insert({
      collection_name: collectionName,
      fields_data: [{ id, vector, name }],  // polja u milvus bazi 
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus insert error" });
  }
};


export const searchVectors = async (req: Request, res: Response) => {
  try {
    const { text, topK = 5, collectionName , metricType = "L2", indexParams = { nprobe: 10 } } = req.body;
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
      output_fields: ["name", "id"],
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus search error" });
  }
};


// Brisanje vektora
export const deleteVector = async (req: Request, res: Response) => {
  try {
      const { id } = req.params;
      const result = await milvusClient.deleteEntities({
      collection_name: collectionName,
      expr: `id == 5`,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus delete error" });
  }
};
