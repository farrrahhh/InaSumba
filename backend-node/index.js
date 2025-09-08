import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";
import sequelize from "./config/database.js";
import authRoutes from "./routes/authentication.js";
import profileRoutes from "./routes/profile.js";
import chatRoutes from "./routes/chat.js";
import translatorRoutes from "./routes/translator.js";
import classifierRoutes from "./routes/classifier.js";
import ecommerceRoutes from "./routes/ecommerce.js";
import initializeDatabase from "./config/initialize-db.js";

// Initialize Express
const app = express();

// Configure CORS
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://inasumba.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Additional CORS headers middleware for edge cases
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token, x-api-key"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// PostgreSQL connection pool
const pool = new pg.Pool({
  user: "postgres",
  host: "turntable.proxy.rlwy.net",
  database: "railway",
  password: "apnUrfnbMlLhHMnQvkCuZsIvLxSbwlDA",
  port: 10797,
  ssl: {
    rejectUnauthorized: false, // for Railway connection
  },
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("API is running");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Handle preflight OPTIONS requests explicitly
app.options("*", cors(corsOptions));

// Register routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/chat", chatRoutes);
app.use("/translator", translatorRoutes);
app.use("/classifier", classifierRoutes);
app.use("/ecommerce", ecommerceRoutes);

// Database connection check endpoint
app.get("/db-check", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "Database connected", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Sync database
sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("Database synchronized successfully");
    // Initialize database with default data
    initializeDatabase();
  })
  .catch((error) => {
    console.error("Failed to sync database:", error);
  });

// For local development only (not used in Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the Express app for Vercel
export default app;
