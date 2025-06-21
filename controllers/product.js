
const express = require('express');
const upload = require('../lib/upload');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/upload', upload, (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  res.status(200).json({ message: 'File uploaded successfully', files: req.files });
});

router.post('/create-product', upload, async (req, res) => {
  const { name, description } = req.body;
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No images uploaded' });
  }

  if (!name || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  

  const newProduct = await prisma.product.create({
    data: { name, description, price, category, images: { create: files.map(file => ({ url: file.path })) } },
  });

  res.status(201).json({ message: 'Product created successfully', product: { name, description, images: newProduct.images } });
});

router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { images: true },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
});
router.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { images: true },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error fetching product' });
  }
}); 
router.put('/products/:id', upload, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const files = req.files;

  if (!name || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        images: {
          create: files.map(file => ({ url: file.path })),
        },
      },
      include: { images: true },
    });
    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
});
router.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
});
