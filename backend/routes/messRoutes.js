import express from 'express';
import { addMeal, getAllMeals, deleteMeal } from '../controllers/messController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/all', getAllMeals);
router.post('/add', protect, authorize('merchant', 'admin'), addMeal);
router.delete('/:id', protect, authorize('merchant', 'admin'), deleteMeal);

export default router;