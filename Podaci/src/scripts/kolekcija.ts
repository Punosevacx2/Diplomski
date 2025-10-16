import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

(async () => {
  try {
    // 1. Povezivanje
    const milvusClient = new MilvusClient({ address: "127.0.0.1:19530" });

    let attempts = 0;
    while (milvusClient.connectStatus !== 1 && attempts < 10) {
      console.log("Waiting for Milvus connection...");
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }
    if (milvusClient.connectStatus !== 1) {
      console.error("Cannot connect to Milvus!");
      process.exit(1);
    }
    console.log("Connected to Milvus!");

    // 2. Kreiranje kolekcije
    const collectionName = "test1";
    const createCollection = await milvusClient.createCollection({
      collection_name: collectionName,
      fields: [
        {
          name: "id",
          description: "ID polje",
          data_type: DataType.Int64,
          is_primary_key: true,
          autoID: true,
        },
        {
          name: "vector",
          description: "Vektorsko polje",
          data_type: DataType.FloatVector,
          dim: 8,
        },
        {
          name: "name",
          description: "Naziv",
          data_type: DataType.VarChar,
          max_length: 128,
        },
      ],
    });
    console.log("Collection created:", createCollection);

    // 3. Ubacivanje podataka
    const vectorsData = [
      { vector: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8], name: "first" },
      { vector: [0.5, 0.4, 0.3, 0.2, 0.1, 0.6, 0.7, 0.8], name: "second" },
    ];

    const insert = await milvusClient.insert({
      collection_name: collectionName,
      fields_data: vectorsData,
    });
    console.log("Inserted data:", insert);

    // 4. Kreiranje indeksa
    const index = await milvusClient.createIndex({
      collection_name: collectionName,
      field_name: "vector",
      index_name: "vector_idx",
      index_type: "IVF_FLAT",
      metric_type: "L2",
      params: { nlist: 128 },
    });
    console.log("Index created:", index);

    // 5. Učitavanje kolekcije
    await milvusClient.loadCollectionSync({ collection_name: collectionName });
    console.log("Collection loaded.");

    // 6. Pretraga vektora
    const searchResult = await milvusClient.search({
      collection_name: collectionName,
      vectors: [[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]],
      search_params: { anns_field: "vector", topk: 2, metric_type: "L2", params: JSON.stringify({ nprobe: 10 }) },
      output_fields: ["name"],
    });
    console.log("Search result:", searchResult);

  } catch (err) {
    console.error("Error:", err);
  }
})();
