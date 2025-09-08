import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Open middleware that allows all access
 * Sets a default user ID for compatibility
 */
export const authMiddleware = (req, res, next) => {
  // Set a default user for compatibility with routes that expect req.user
  req.user = {
    id: process.env.DEFAULT_USER_ID || "DEFAULT_USER",
    name: "Default User",
    role: "user",
  };

  next();
};

/**
 * No-op function for compatibility
 */
export const generateApiKey = () => {
  return "NO_AUTH_REQUIRED";
};

export default {
  authMiddleware,
  generateApiKey,
};
