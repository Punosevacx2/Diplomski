import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// Spoonacular API_KEY
const API_KEY = process.env.SPOONACULAR_API_KEY; 

// Funkcija za preuzimanje recepata
async function fetchRecipes(query = "pasta", number = 5) {
    let a=0;
  const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=${number}&addRecipeInformation=true&apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Greška prilikom preuzimanja recepata:", error);
  }
}

fetchRecipes("pasta", 5);
