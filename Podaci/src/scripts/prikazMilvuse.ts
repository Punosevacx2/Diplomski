import { pipeline } from "@xenova/transformers";
import fs from "fs";

async function main() {
  console.log("🔄 Preuzimanje Xenova/e5-large-v2 modela...");
  const model = await pipeline("feature-extraction", "Xenova/e5-large-v2");
  
  // Model se može sačuvati lokalno
  const dir = "./src/models/e5-large-v2";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Sačuvaj tokenizer i config (primer)
  await model.save(dir);
  console.log(`✅ Model sačuvan u ${dir}`);
}

main();