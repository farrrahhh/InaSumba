import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcryptjs";
import sequelize from "./config/database.js";
import * as models from "./models/models.js";
import authRoutes from "./routes/authentication.js";
import profileRoutes from "./routes/profile.js";

// Inisialisasi Express
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
    rejectUnauthorized: false, // biar konek ke Railway
  },
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("API is running");
});

// Register routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

// Contoh endpoint: cek koneksi database
app.get("/db-check", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "Database connected", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Port (default 3000 untuk lokal, Vercel pakai process.env.PORT)
const PORT = process.env.PORT || 3000;

// Sync database and start server
const initializeDatabase = async () => {
  try {
    // Sync all models with database
    await sequelize.sync({ alter: false });
    console.log("Database synchronized successfully");

    // Start server after database sync
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to sync database:", error);
  }
};

// Initialize the database and start the server
initializeDatabase();
