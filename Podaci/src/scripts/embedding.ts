import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateEmbedding(text: string) {
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  
  console.log("Embedding length:", response.data[0]?.embedding.length);
  return response.data[0]?.embedding;
}

(async () => {
  await generateEmbedding("Ovo je test embedding za Milvus projekat.");
})();
