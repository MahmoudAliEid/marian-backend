const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error fetching product' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

const createProduct = async (req, res) => {
  console.log("=== CREATE PRODUCT ENDPOINT HIT ===");
  const { name, description, userId, categoryId } = req.body;
  console.log("Request body:", req.body);
  console.log("Files uploaded:", req.files);

  if (!name || !description) {
    console.log("Missing required fields");
    return res.status(400).json({ error: 'Name and description are required' });
  }
  
  const files = req.files;
  if (!files || files.length === 0) {
    console.log("No files uploaded");
    return res.status(400).json({ error: 'No images uploaded' });
  }

  // Validate ObjectIds if provided
  const isValidObjectId = (id) => {
    return id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
  };

  const validatedUserId = userId && userId.trim() !== '' ? 
    (isValidObjectId(userId) ? userId : null) : null;
  
  const validatedCategoryId = categoryId && categoryId.trim() !== '' ? 
    (isValidObjectId(categoryId) ? categoryId : null) : null;

  if (userId && userId.trim() !== '' && !validatedUserId) {
    return res.status(400).json({ 
      error: 'Invalid userId format. Must be a valid MongoDB ObjectId (24 hex characters)' 
    });
  }

  if (categoryId && categoryId.trim() !== '' && !validatedCategoryId) {
    return res.status(400).json({ 
      error: 'Invalid categoryId format. Must be a valid MongoDB ObjectId (24 hex characters)' 
    });
  }

  try {
    console.log("Extracting image URLs...");
    // Extract image URLs from uploaded files
    const imageUrls = files.map(file => {
      console.log("File path:", file.path);
      return file.path;
    });
    
    console.log("Image URLs:", imageUrls);
    console.log("Creating product with data:", {
      name, 
      description, 
      images: imageUrls,
      userId: validatedUserId,
      categoryId: validatedCategoryId
    });
    
    const newProduct = await prisma.product.create({
      data: { 
        name, 
        description, 
        images: imageUrls,
        userId: validatedUserId,
        categoryId: validatedCategoryId
      },
      include: { 
        user: validatedUserId ? {
          select: {
            id: true,
            name: true,
            email: true
          }
        } : false,
        category: validatedCategoryId ? {
          select: {
            id: true,
            name: true
          }
        } : false
      }
    });

    console.log("Product created successfully:", newProduct);
    res.status(201).json({ 
      message: 'Product created successfully', 
      product: newProduct 
    });
  } catch (error) {
    console.error('=== ERROR CREATING PRODUCT ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    res.status(500).json({ error: 'Error creating product', details: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, userId, categoryId } = req.body;
  const files = req.files;
 
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }

  try {
    const updateData = {
      name,
      description,
      userId: userId || null,
      categoryId: categoryId || null
    };

    // If new images are uploaded, add them to the update data
    if (files && files.length > 0) {
      updateData.images = files.map(file => file.path);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product', details: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id },
    });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product', details: error.message });
  }
};

module.exports = {
  getProductById,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

