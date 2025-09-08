import fs from "fs";
import path from "path";
import { createGzip } from "zlib";

// Constants
const LOG_DIR = path.join(process.cwd(), "logs");
const MAX_LOG_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Log files
const API_LOG_FILE = path.join(LOG_DIR, "api_requests.log");
const ERROR_LOG_FILE = path.join(LOG_DIR, "errors.log");
const SERVER_LOG_FILE = path.join(LOG_DIR, "server.log");

/**
 * Rotates a log file if it exceeds the maximum size
 * @param {string} logFile - Path to the log file
 */
const rotateLogFileIfNeeded = (logFile) => {
  try {
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);

      if (stats.size > MAX_LOG_SIZE_BYTES) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const rotatedFile = `${logFile}.${timestamp}`;
        const gzipFile = `${rotatedFile}.gz`;

        // Create gzip stream
        const gzip = createGzip();
        const source = fs.createReadStream(logFile);
        const destination = fs.createWriteStream(gzipFile);

        // Pipe the log file to gzip
        source.pipe(gzip).pipe(destination);

        // When compression is complete, truncate the original log file
        destination.on("finish", () => {
          fs.truncateSync(logFile, 0);
          console.log(`Log file rotated and compressed: ${gzipFile}`);
        });
      }
    }
  } catch (error) {
    console.error(`Error rotating log file: ${error.message}`);
  }
};

/**
 * Writes a log entry to a file
 * @param {string} logFile - Path to the log file
 * @param {string} entry - Log entry to write
 */
const writeToLog = (logFile, entry) => {
  try {
    // Rotate log file if needed
    rotateLogFileIfNeeded(logFile);

    // Write to log file
    fs.appendFileSync(logFile, `${entry}\n\n`);
  } catch (error) {
    console.error(`Error writing to log: ${error.message}`);
  }
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
    writeToLog(ERROR_LOG_FILE, entry);
    writeToLog(SERVER_LOG_FILE, entry);
  },

  /**
   * Log a warning message
   * @param {string} message - Warning message
   * @param {Object} data - Additional warning data
   */
  warn: (message, data = {}) => {
    const entry = createLogEntry(LOG_LEVELS.WARN, message, data);
    console.warn(entry);
    writeToLog(SERVER_LOG_FILE, entry);
  },

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {Object} data - Additional info data
   */
  info: (message, data = {}) => {
    const entry = createLogEntry(LOG_LEVELS.INFO, message, data);
    console.log(entry);
    writeToLog(SERVER_LOG_FILE, entry);
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
      writeToLog(SERVER_LOG_FILE, entry);
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
      writeToLog(API_LOG_FILE, entry);
    } catch (error) {
      console.error(`Error logging API request: ${error.message}`);
    }
  },
};
