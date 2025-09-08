import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// API key for direct access
const API_KEY = process.env.API_KEY || "inasumba-api-key";

/**
 * Middleware to verify API key
 */
export const authMiddleware = (req, res, next) => {
  // Get API key from header
  const apiKey = req.header("x-api-key");

  // Check if API key exists and matches
  if (!apiKey) {
    return res.status(401).json({ error: "No API key, authorization denied" });
  }

  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  // Add a default user to request object
  req.user = {
    id: process.env.DEFAULT_USER_ID || "APIUSER",
    name: "API User",
    role: "api",
  };

  next();
};

/**
 * Generate API key for client
 * @returns {string} The API key
 */
export const generateApiKey = () => {
  return API_KEY;
};

export default {
  authMiddleware,
  generateApiKey,
  API_KEY,
};
