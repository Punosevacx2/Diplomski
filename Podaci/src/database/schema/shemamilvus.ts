import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

export const milvusClient = new MilvusClient({ 
                  address: `${process.env.MILVUS_HOST || '127.0.0.1'}:${process.env.MILVUS_PORT || 19530}`,
});

// Kolekcija koju koristim 
export const collectionName = "Proba1";


export async function createCollection(collectionName: string) {
// TODO: ako kolekcija postoji ne kreirar je !
const exists = await milvusClient.hasCollection({ collection_name: collectionName });
  if (exists.value) {
    console.log(`Collection ${collectionName} već postoji`);
    return;
  }

  const createRes = await milvusClient.createCollection({
    collection_name: collectionName,
    fields: [
      { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: true },
      { name: 'vector', data_type: DataType.FloatVector, dim: 384 },
      { name: 'title', data_type: DataType.VarChar, max_length: 128 },
      { name: 'description', data_type: DataType.VarChar, max_length: 10000 },
    ],
  });
  return createRes;
}