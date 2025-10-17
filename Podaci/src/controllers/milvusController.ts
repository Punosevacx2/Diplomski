import type { Request, Response } from 'express';
import { milvusClient, collectionName,createCollection } from '../database/schema/shemamilvus.ts';


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

// Pretraga vektora
export const searchVectors = async (req: Request, res: Response) => {
  try {
    const { vector, topK = 5 } = req.body;
    const result = await milvusClient.search({
      collection_name: collectionName,
      vectors: [vector],
      search_params: {
        anns_field: "vector",
        topk: topK,
        metric_type: "L2",  // Indeks koji imam u bazi 
        params: JSON.stringify({ nprobe: 10 }),
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
