import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// API key for direct access
const API_KEY = process.env.API_KEY || "inasumba-api-key";
// Default user ID for API requests
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || "APIUSER";

/**
 * Simplified authentication middleware using only API key
 */
export const flexibleAuth = (req, res, next) => {
  // Get API key from header
  const apiKey = req.header("x-api-key");

  // Check if API key exists and matches
  if (apiKey && apiKey === API_KEY) {
    // Set a default user
    req.user = {
      id: DEFAULT_USER_ID,
      name: "API User",
      role: "api",
    };
    return next();
  }

  // If authentication fails
  return res.status(401).json({
    error: "Authentication failed. Provide valid API key.",
  });
};

export default flexibleAuth;
