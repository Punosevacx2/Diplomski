import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

export const milvusClient = new MilvusClient({ address: process.env.MILVUS_HOST || '127.0.0.1:19530' });

// Funkcija za kreiranje kolekcije u milvusu 
export async function createCollection(collectionName: string) {
  const createRes = await milvusClient.createCollection({
    collection_name: collectionName,
    fields: [
      { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: true },
      { name: 'vector', data_type: DataType.FloatVector, dim: 8 },
      { name: 'name', data_type: DataType.VarChar, max_length: 128 },
    ],
  });
  return createRes;
}