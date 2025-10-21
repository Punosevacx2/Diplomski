import { pipeline } from "@xenova/transformers";

// Singleton pattern da se model ne učitava više puta
let embedder: any = null;

export async function getLocalEmbedding(text: string): Promise<number[]> {
  if (!embedder) {
    console.log("🔄 Učitavanje lokalnog embedding modela...");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("✅ Model učitan!");
  }

  // Generiši embedding
  const output = await embedder(text , { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

