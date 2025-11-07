// src/scripts/milvus_version.ts
import "dotenv/config";
import { milvusClient } from "../database/schema/shemamilvus.ts";

(async () => {
  const v = await milvusClient.getVersion();
  console.log("Milvus version:", v);
})();