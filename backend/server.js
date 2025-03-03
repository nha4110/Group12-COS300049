require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ✅ Authentication Middleware (Moved to the Top)
const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("🚀 API is running!");
});

// ✅ Signup Route (Fixed `accountID` reference)
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT accountID FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Username or email already exists." });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );

    res.json({ success: true, message: "User registered successfully." });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Login Route (Fixed `accountID`)
app.post("/login", async (req, res) => {
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

    // ✅ Fix: Generate JWT with `accountID`
    const token = jwt.sign(
      { userId: user.accountid, username: user.username },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "1h" }
    );

    res.json({ success: true, token });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Get Current User (Fixed `accountID`)
app.get("/user", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT accountID, username, email FROM users WHERE accountID = $1",
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("❌ Get Current User Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Get All Users (Fixed `accountID`)
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT accountID, username, email FROM users");
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error("❌ Get Users Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Get Profile (Fixed `accountID`)
app.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT accountID, username, email FROM users WHERE accountID = $1",
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error("❌ Get Profile Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Logout Route
app.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully." });
});

// ✅ Get NFT Collections (Ensures Unique Categories)
app.get("/collections", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category, MIN(img) AS first_image
      FROM assets
      GROUP BY category;
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No categories found." });
    }

    res.json({ success: true, collections: result.rows });
  } catch (error) {
    console.error("❌ Fetch Collections Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Get NFTs by Category (No Changes Needed)
app.get("/nfts/:category", async (req, res) => {
  const { category } = req.params;

  try {
    const result = await pool.query(
      "SELECT assetID AS assetid, name, img, price FROM assets WHERE category = $1",
      [category]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No NFTs found." });
    }

    res.json({ success: true, nfts: result.rows });
  } catch (error) {
    console.error("❌ Fetch NFTs by Category Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
