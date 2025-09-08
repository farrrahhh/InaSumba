/**
 * API Logger Middleware
 * Logs details of all incoming API requests for debugging purposes
 */
import { logger } from "../utils/logger.js";

export const apiLogger = (req, res, next) => {
  try {
    // Log the API request using our advanced logger
    logger.apiRequest(req);

    // Continue with the request
    next();
  } catch (error) {
    logger.error("Error in API Logger middleware", { error: error.message });
    next(); // Continue even if logging fails
  }
};
