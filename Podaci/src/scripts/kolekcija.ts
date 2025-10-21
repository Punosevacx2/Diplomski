import { milvusClient, collectionName , createCollection} from "../database/schema/shemamilvus.ts";

const collections = await milvusClient.showCollections();
console.log(collections);
