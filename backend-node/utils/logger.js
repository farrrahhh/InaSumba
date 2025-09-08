/**
 * Simple Logger
 *
 * A serverless-friendly logger that doesn't attempt to write to the filesystem.
 * This version logs to console only, making it compatible with Vercel.
 */

const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

/**
 * Creates a log entry with timestamp and formatting
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 * @returns {string} Formatted log entry
 */
const createLogEntry = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const dataString = data ? JSON.stringify(data, null, 2) : "";

  return `[${timestamp}] [${level}] ${message}\n${dataString}`;
};

/**
 * Logger object with methods for different log levels
 */
export const logger = {
  /**
   * Log an error message
   * @param {string} message - Error message
   * @param {Object} data - Additional error data
   */
  error: (message, data = {}) => {
    const entry = createLogEntry(LOG_LEVELS.ERROR, message, data);
    console.error(entry);
  },

  /**
   * Log a warning message
   * @param {string} message - Warning message
   * @param {Object} data - Additional warning data
   */
  warn: (message, data = {}) => {
    const entry = createLogEntry(LOG_LEVELS.WARN, message, data);
    console.warn(entry);
  },

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {Object} data - Additional info data
   */
  info: (message, data = {}) => {
    const entry = createLogEntry(LOG_LEVELS.INFO, message, data);
    console.log(entry);
  },

  /**
   * Log a debug message (only in development)
   * @param {string} message - Debug message
   * @param {Object} data - Additional debug data
   */
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV !== "production") {
      const entry = createLogEntry(LOG_LEVELS.DEBUG, message, data);
      console.log(entry);
    }
  },

  /**
   * Log an API request
   * @param {Object} req - Express request object
   */
  apiRequest: (req) => {
    try {
      const user_id =
        (req.user && req.user.id) ||
        req.body.user_id ||
        (req.params && req.params.user_id) ||
        "Not provided";

      const clientIp =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        "Unknown";

      const entry = `[API REQUEST] [${new Date().toISOString()}]
Method: ${req.method}
URL: ${req.originalUrl}
Body: ${JSON.stringify(req.body, null, 2)}
User ID: ${user_id}
IP: ${clientIp}`;

      console.log(entry);
    } catch (error) {
      console.error(`Error logging API request: ${error.message}`);
    }
  },
};
