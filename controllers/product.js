
import { PrismaClient } from '@prisma/client';
import { translate } from '@vitalets/google-translate-api';
import { HttpProxyAgent } from 'http-proxy-agent';
const prisma = new PrismaClient();
// remove image from cloudinary
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      
     
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
      
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

const createProduct = async (req, res) => {
  console.log("=== CREATE PRODUCT ENDPOINT HIT ===");
  const { name, description, userId, categoryId ,ar_description, ar_name} = req.body;
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
        ar_description,
        ar_name,
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
  const { name, description, userId, categoryId ,ar_name, ar_description} = req.body;
  const files = req.files;
 
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }

  try {
    const updateData = {
      name,
      description,
      userId: userId || null,
      categoryId: categoryId || null,
      ar_name, 
      ar_description
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

const getAllProductsAndUpdateAllOfThem = async (req, res) => {
  const products = await prisma.product.findMany();
  const results = [];
  // Only process products 81 to 109 (1-based index)
  // Proxy list (add more proxies for better reliability)
  const proxies = [
    'http://103.152.112.162:80',
    'http://103.180.113.193:8080',
    'http://103.172.70.50:3127',
    'http://103.155.54.26:83',
    'http://103.156.17.94:8080',
    'http://103.169.255.38:8080',
    'http://103.174.81.9:8080',
    'http://103.178.43.170:8181',
    'http://103.179.109.38:8080',
    'http://103.180.113.193:8080',
    'http://103.172.70.50:3127',
    'http://103.155.54.26:83',
    'http://103.156.17.94:8080',
    'http://103.169.255.38:8080',
    'http://103.174.81.9:8080',
    'http://103.178.43.170:8181',
    'http://103.179.109.38:8080',
    // Add more proxies here if needed
  ];
  let proxyIndex = 0;
  for (let i = 80; i < 109 && i < products.length; i++) {
    const product = products[i];
    let arName = null;
    let arDescription = null;
    let success = false;
    let lastError = null;
    let triedProxies = new Set();
    for (let attempt = 0; attempt < proxies.length; attempt++) {
      if (triedProxies.size === proxies.length) break; // All proxies tried
      const agent = new HttpProxyAgent(proxies[proxyIndex]);
      triedProxies.add(proxyIndex);
      try {
        arName = (await translate(product.name, { to: 'ar', fetchOptions: { agent } })).text;
        arDescription = (await translate(product.description, { to: 'ar', fetchOptions: { agent } })).text;
        success = true;
        break;
      } catch (error) {
        lastError = error;
        // On any error, rotate to next proxy
        proxyIndex = (proxyIndex + 1) % proxies.length;
        continue;
      }
    }
    if (success) {
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            ar_name: arName,
            ar_description: arDescription,
          },
        });
        results.push({
          name: product.name,
          ar_name: arName,
          ar_description: arDescription,
          status: 'updated'
        });
        console.log(`✅ Updated ${product.name}`);
        console.log(`Arabic Name: ${arName}`);
        console.log(`Arabic Description: ${arDescription}`);
      } catch (error) {
        results.push({
          name: product.name,
          error: error.message,
          status: 'failed-db'
        });
        console.error(`❌ Failed to update DB for ${product.name}`, error);
      }
    } else {
      results.push({
        name: product.name,
        error: lastError ? lastError.message : 'Unknown error',
        status: 'failed-translate'
      });
      console.error(`❌ Failed to translate ${product.name}`, lastError);
    }
  }
  res.status(200).json({
    message: 'Products 81 to 109 processed',
    results
  });
};


/**
 * Removes an image from Cloudinary given its URL.
 * @param {string} imageUrl - The full URL of the image to remove.
 * @returns {Promise<void>}
 */
const removeImageFromCloudinary = async (imageUrl) => {
  if (!imageUrl) {
    console.error('No imageUrl provided to removeImageFromCloudinary');
    return;
  }
  try {
    // Extract publicId from the image URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg
    // publicId: image/upload/v1234567890/sample (without extension)
    const matches = imageUrl.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    const publicId = matches ? matches[1] : null;
    if (!publicId) {
      throw new Error('Could not extract publicId from imageUrl');
    }
    await cloudinary.v2.uploader.destroy(publicId);
    console.log(`Image ${imageUrl} (publicId: ${publicId}) removed successfully`);
  } catch (error) {
    console.error(`Error removing image ${imageUrl}:`, error.message);
  }
};



export {
  getProductById,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAndUpdateAllOfThem,
  removeImageFromCloudinary
};

