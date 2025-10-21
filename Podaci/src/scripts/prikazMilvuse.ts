import { milvusClient, collectionName } from "../database/schema/shemamilvus.ts";

const prikazMilvuse = async () => {

  try {
    console.log(`📦 Učitavam kolekciju: ${collectionName}...`);
    await milvusClient.loadCollectionSync({ collection_name: collectionName });
    console.log(`✅ Kolekcija je učitana.`);

    const result = await milvusClient.query({
      collection_name: collectionName,
      output_fields: ["id", "title", "description"], // polja koja želiš
      expr: "id>10", // ili neki filter, npr. "id < 10"
      limit: 10, // OBAVEZNO, jer expr je prazan
    });

    console.log("🔍 Podaci iz kolekcije:", result);
  } catch (err) {
    console.error("❌ Greška pri prikazu:", err);
  }
};

prikazMilvuse();
