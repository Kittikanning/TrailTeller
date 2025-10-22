import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getRecommendations,
  createRecommendation,
  generateRecommendations,
  deleteRecommendation
} from '../controllers/recommendationController.js';

const router = express.Router();

router.get('/', protect, getRecommendations);
router.post('/', protect, createRecommendation);
router.post('/generate', protect, generateRecommendations);
router.delete('/:id', protect, deleteRecommendation);

export default router;