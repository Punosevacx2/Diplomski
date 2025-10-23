import { Router } from "express";
import {
  createMilvusCollection,
  insertVector,
  searchVectors,
  deleteVector,
  createMilvusIndex,
  listCollections,
  describeCollection,
  dropCollection,
  searchVectorshybrid,
  queryFilterRoute,
  dropMilvusIndex,
  listMilvusIndexes
} from "../controllers/milvusController.ts";

const router = Router();


router.post("/insert", insertVector);
router.post("/search", searchVectors);
router.post("/query", queryFilterRoute);
router.post("/hybrid-search",searchVectorshybrid);
router.delete("/delete/:id", deleteVector);

router.post("/collection", createMilvusCollection);
router.get("/collections", listCollections);
router.get("/collections/:name", describeCollection);
router.delete("/collections/:name", dropCollection);

router.post("/index",createMilvusIndex );
router.delete("/index",dropMilvusIndex);
router.post("/indexes", listMilvusIndexes);




export default router;