import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcryptjs";
import sequelize from "./config/database.js";
import * as models from "./models/models.js";
import authRoutes from "./routes/authentication.js";
import profileRoutes from "./routes/profile.js";

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

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

// Register routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

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
