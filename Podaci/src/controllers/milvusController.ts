import type { Request, Response } from 'express';
import { milvusClient, createCollection } from '../database/schema/shemamilvus.ts';

//endpoint za kreiranje colekcije u milvusu 
export const createMilvusCollection = async (req: Request, res: Response) => {
  const { collectionName } = req.body;
  try {
    const result = await createCollection(collectionName);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Milvus error' });
  }
};

// ostatak endpointa za milvus
