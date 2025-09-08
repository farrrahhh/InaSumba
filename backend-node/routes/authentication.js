import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/models.js";
import { generateApiKey, authMiddleware } from "../middleware/auth.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router = express.Router();

/**
 * Generate a unique 8-character user ID
 * @returns {string} The generated user ID
 */
function generateUserId() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Generate user ID
    let userId = generateUserId();
    let userWithId = await User.findOne({ where: { user_id: userId } });

    // Ensure user ID is unique
    while (userWithId) {
      userId = generateUserId();
      userWithId = await User.findOne({ where: { user_id: userId } });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      user_id: userId,
      name,
      email,
      password: hashedPassword,
    });

    // Return user data (excluding password)
    res.status(201).json({
      user_id: newUser.user_id,
      name: newUser.name,
      email: newUser.email,
      api_key: generateApiKey(),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route POST /auth/login
 * @desc Login user
 * @access Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Return user data (excluding password)
    res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      api_key: generateApiKey(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
