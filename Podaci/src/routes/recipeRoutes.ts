import { Router } from "express";
import { getAllRecipes, addRecipe, getRecipeById } from "../controllers/recipeController.ts";

const router = Router();
//ruta za postgresql bazu 
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);
router.post("/", addRecipe);

export default router;
