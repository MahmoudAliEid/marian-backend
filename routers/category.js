const express = require("express");
const router = express.Router();

const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require("../controllers/category");
// Get all categories
router.get("/all-categories", getAllCategories);
router.get("/category/:id", getCategoryById);
router.post("/create-category", createCategory);
router.put("/update-category/:id", updateCategory);
router.delete("/delete-category/:id", deleteCategory);
module.exports = router;