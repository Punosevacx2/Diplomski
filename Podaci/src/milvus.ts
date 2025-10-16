import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

(async () => {
  try {
    const milvusClient = new MilvusClient({ address: "127.0.0.1:19530" });

    // čekamo konekciju
    let attempts = 0;
    while (milvusClient.connectStatus !== 1 && attempts < 10) {
      console.log("Waiting for Milvus connection...");
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }

    if (milvusClient.connectStatus !== 1) {
      throw new Error("Cannot connect to Milvus!");
    }

    console.log("Connected to Milvus!");

    // koristi bazu my_db
    await milvusClient.use({ db_name: "my_db" });

    // kreiranje kolekcije
    await milvusClient.createCollection({
      collection_name: "proba",
      fields: [
        { name: "id", data_type: DataType.Int64, is_primary_key: true, autoID: true, description: "ID" },
        { name: "vector", data_type: DataType.FloatVector, dim: 8, description: "Vector" },
        { name: "name", data_type: DataType.VarChar, max_length: 128, description: "Name" },
        { name: "height", data_type: DataType.Int64, description: "Height" },
      ],
    });

    console.log("Collection created!");

    // ubacivanje podataka
    const vectorsData = [
      { vector: [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8], name: "Alice", height: 170 },
      { vector: [0.5,0.4,0.3,0.2,0.1,0.9,0.8,0.7], name: "Bob", height: 180 },
    ];

    const insertRes = await milvusClient.insert({
      collection_name: "proba",
      fields_data: vectorsData,
    });

    console.log("Inserted data:", insertRes);

    await milvusClient.flushSync({ collection_names: ["proba"] });

    const allData = await milvusClient.query({
      collection_name: "proba",
      expr: "",
      output_fields: ["*"],
      limit: 10,
    });

    console.log("Data in collection:", allData.data);

  } catch (err) {
    console.error("Error occurred:", err);
  }
})();
