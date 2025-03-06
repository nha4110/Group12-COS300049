const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { ethers } = require("ethers");

dotenv.config();

const router = express.Router();

// ✅ PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
});

// ✅ Signup Endpoint (Generates Wallet Address)
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // ✅ Check if user exists
    const existingUser = await pool.query(
      "SELECT accountid FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Username or email already exists." });
    }

    // ✅ Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate Ethereum Wallet
    const wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address;
    const privateKey = wallet.privateKey;

    // ✅ Insert New User (with Wallet)
    const result = await pool.query(
      "INSERT INTO users (username, email, password, wallet_address, private_key) VALUES ($1, $2, $3, $4, $5) RETURNING accountid",
      [username, email, hashedPassword, walletAddress, privateKey]
    );

    res.json({ success: true, message: "User registered successfully.", walletAddress });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// ✅ Login Endpoint (Returns JWT)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid username or password." });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid username or password." });
    }

    // ✅ Create JWT Token
    const token = jwt.sign(
      { userId: user.accountid, username: user.username, walletAddress: user.wallet_address },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      user: { username: user.username, email: user.email, wallet_address: user.wallet_address },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// ✅ Middleware: Check Authentication
const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ Attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ✅ Get Current User Info
const getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const result = await pool.query(
      "SELECT accountid, username, email, wallet_address FROM users WHERE accountid = $1",
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("❌ Get Current User Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ✅ Export Routes & Middleware (CommonJS)
module.exports = { router, isAuthenticated, getCurrentUser };
