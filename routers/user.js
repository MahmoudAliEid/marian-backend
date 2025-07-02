import express from 'express';
import { loginUser, registerUser } from '../controllers/user.js';

const router = express.Router();

// Route to register a new user
router.post('/register', registerUser);
// Route to login an existing user
router.post('/login', loginUser);

export default router;
