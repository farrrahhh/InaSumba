import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Default user ID for requests
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || "DEFAULT_USER";

/**
 * Open authentication middleware that allows all access
 */
export const flexibleAuth = (req, res, next) => {
  // Set a default user for compatibility with routes that expect req.user
  req.user = {
    id: DEFAULT_USER_ID,
    name: "Default User",
    role: "user",
  };

  // Always allow access
  next();
};

export default flexibleAuth;
