import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcryptjs";

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
