import axios from "axios";
import dotenv from "dotenv";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { recipes } from "../database/schema/schemapg.ts"; 

dotenv.config();
//popunjavanje postgresql baze 

// Seed datas in PostgreSQL database
const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";

// Conecting to Database
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(client);

// remove hmtl tags from text 
function stripHtmlTags(text:any) {
  return text.replace(/<[^>]*>/g, ''); // uklanja sve HTML tagove
}

// take data from API
async function getRecipesBatch(offset: number, number: number = 100) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        apiKey: API_KEY,
        number,
        offset,
        addRecipeInformation: true, 
      },
    });

    return response.data.results.map((r: any) => ({
      title: r.title || "No title",
      description: stripHtmlTags(r.summary) || "No description", //funkcija koja cisti text od html tagova
      ingredients: r.extendedIngredients
        ? r.extendedIngredients.map((ing: any) => ing.original).join(", ")
        : "",
    }));
  } catch (error: any) {
    console.error("Greška prilikom dohvata recepata:", error.response?.data || error.message);
    return [];
  }
}

// Main function 
async function seedRecipes() {
  await client.connect();
  console.log("Connected to database");

  const totalRecipes = 300;
  const batchSize = 100;
  let allRecipes: any[] = [];

  for (let offset = 0; offset < totalRecipes; offset += batchSize) {
    console.log(`Fetching recipes batch ${offset}-${offset + batchSize}`);
    const batch = await getRecipesBatch(offset, batchSize);
    allRecipes.push(...batch);
  }

  console.log(`Inserting ${allRecipes.length} recipes into database...`);
  await db.insert(recipes).values(allRecipes);
  console.log("Done!");

  await client.end();
}

seedRecipes().catch((err) => {
  console.error(err);
  process.exit(1);
});
