import express from "express";
import { Client } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
client.connect();

// ✅ Signup Endpoint
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await client.query("SELECT id FROM users WHERE username = $1 OR email = $2", [username, email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Username or email already exists." });
    }

    await client.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", [username, email, hashedPassword]);
    res.json({ success: true, message: "User registered successfully." });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Login Endpoint
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await client.query("SELECT * FROM users WHERE username = $1", [username]);

    if (result.rows.length === 0) return res.status(401).json({ success: false, message: "Invalid username or password." });

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ success: false, message: "Invalid username or password." });

    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ success: true, token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Authentication Helpers
export const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const getCurrentUser = async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const result = await client.query("SELECT id, username, email FROM users WHERE id = $1", [req.user.userId]);

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Get Current User Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
};

export const logout = (res) => {
  res.json({ success: true, message: "Logged out successfully." });
};

// ✅ Export router
export default router;
