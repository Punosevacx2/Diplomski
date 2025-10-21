import { Router } from "express";
import {
  createMilvusCollection,
  insertVector,
  searchVectors,
  deleteVector,
} from "../controllers/milvusController.ts";

const router = Router();

router.post("/collection", createMilvusCollection);
router.post("/insert", insertVector);
router.post("/search", searchVectors);
router.delete("/delete/:id", deleteVector);


export default router;