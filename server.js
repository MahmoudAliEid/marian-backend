import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import userRoutes from './routers/user.js';
import categoryRoutes from './routers/category.js';
import productRoutes from './routers/product.js';
import { getAllProductsAndUpdateAllOfThem } from './controllers/product.js';
const app = express();
// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Increase payload limits for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Use user routes
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api',productRoutes );

// Test database connection endpoint
app.get('/test-db', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    res.json({ message: 'Database connection successful!' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the User Management API');
});
// getAllProductsAndUpdateAllOfThem(); // Only call this via API endpoint
// connect to port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
