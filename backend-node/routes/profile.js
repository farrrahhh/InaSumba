import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/models.js";
import flexibleAuth from "../middleware/flexible-auth.js";

const router = express.Router();

/**
 * @route GET /profile
 * @desc Get current user profile
 * @access Public
 */
router.get("/", flexibleAuth, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { user_id: req.user.id },
      attributes: { exclude: ["password"] }, // Exclude password from response
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route PUT /profile
 * @desc Update user profile
 * @access Public
 */
router.put("/", flexibleAuth, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Find user
    const user = await User.findOne({ where: { user_id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (email) {
      // Check if email is already in use by another user
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.user_id !== req.user.id) {
        return res.status(400).json({ error: "Email already in use" });
      }
      user.email = email;
    }

    // Save changes
    await user.save();

    // Return updated user
    res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route PUT /profile/password
 * @desc Update user password
 * @access Public
 */
router.put("/password", flexibleAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check required fields
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Please provide current and new password" });
    }

    // Find user
    const user = await User.findOne({ where: { user_id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Save changes
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
