const express = require('express');
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const router = express.Router();

// Create a new user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: "Error logging in user" });
  }
};

// Register a new user
const registerUser = async (req, res) => {
  console.log("Registering user", req.body);
  if (!req.body.email || !req.body.password || !req.body.name) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const { email, password, name } = req.body;
    console.log("Email:", email);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    console.log("New user created:", newUser);
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user 🎶🎶🎶" });
  }
};

module.exports = {
  loginUser,
  registerUser,
};

