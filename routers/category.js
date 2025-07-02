import express from 'express';
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/category.js';

const router = express.Router();
// Get all categories
router.get('/all-categories', getAllCategories);
router.get('/category/:id', getCategoryById);
router.post('/create-category', createCategory);
router.put('/update-category/:id', updateCategory);
router.delete('/delete-category/:id', deleteCategory);
export default router;