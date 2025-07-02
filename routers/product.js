import express from 'express';
import upload from '../lib/upload.js';
import { getProductById, getAllProducts, getAllProductsAndUpdateAllOfThem, createProduct, updateProduct, deleteProduct } from '../controllers/product.js';

const router = express.Router();

router.get('/all-products', getAllProducts);
router.get('/getAllProductsAndUpdateAllOfThem', getAllProductsAndUpdateAllOfThem);
router.get('/product/:id', getProductById);
router.post('/create-product', upload, createProduct);
router.put('/update-product/:id', upload, updateProduct);
router.delete('/delete-product/:id', deleteProduct);

// Test upload endpoint
router.post('/test-upload', (req, res, next) => {
  console.log('=== REQUEST DEBUG INFO ===');
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Headers:', req.headers);
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Body (before upload):', req.body);
  next();
}, upload, (req, res) => {
  try {
    console.log("Test upload endpoint hit");
    console.log("Request body:", req.body);
    console.log("Files:", req.files);
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const fileInfo = req.files.map(file => ({
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    }));
    res.status(200).json({ 
      message: 'Upload test successful', 
      files: fileInfo 
    });
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({ error: 'Test upload failed', details: error.message });
  }
});

export default router;