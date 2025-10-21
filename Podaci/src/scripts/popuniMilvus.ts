import axios from "axios";
import dotenv from "dotenv";
import { milvusClient, collectionName , createCollection} from "../database/schema/shemamilvus.ts";
import { getLocalEmbedding } from "../embedding/localEmbedding.ts";
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { recipes } from '../database/schema/schemapg.ts';

dotenv.config();

const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";

function stripHtmlTags(text: string) {
  return text.replace(/<[^>]*>/g, '');
}



export async function seedFromPostgres() {
  // Konektuj se na PostgreSQL
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  const db = drizzle(client);

  // Dohvati sve recepte iz baze
  const allRecipes = await db.select().from(recipes);

  console.log(`Učitano ${allRecipes.length} recepata iz PostgreSQL baze`);

  for (const recipe of allRecipes) {
    // Generiši embedding samo za description
    const vector = await getLocalEmbedding(recipe.description);

    // Ubaci u Milvus
    await milvusClient.insert({
      collection_name: collectionName,
      fields_data: [
        {                 // ako autoID: true, možeš i da preskočiš id
          title: recipe.title,
          description: recipe.description,
          vector,
        },
      ],
    });
  }

  console.log('Svi recepti ubačeni u Milvus!');
  await client.end();
}
createCollection(collectionName);
seedFromPostgres().catch((err) => {
  console.error(err);
  process.exit(1);
});
