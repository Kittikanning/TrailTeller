import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  getDestinations
} from '../controllers/tripController.js';

const router = express.Router();

router.get('/destinations', protect, getDestinations);

router.route('/')
  .get(protect, getTrips)
  .post(protect, createTrip);

router.route('/:id')
  .get(protect, getTrip)
  .put(protect, updateTrip)
  .delete(protect, deleteTrip);

export default router;