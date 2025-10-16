import { Router } from 'express';
import { createMilvusCollection } from '../controllers/milvusController';

const router = Router();
// ruta za milvus
router.post('/create', createMilvusCollection);

export default router;
