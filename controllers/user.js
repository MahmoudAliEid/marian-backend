const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// Create a new user
router.post('/login', async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email, password },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});
