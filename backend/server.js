require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { ethers } = require("ethers");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ PostgreSQL Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ✅ Validate and Load Funder Private Key
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
const funderPrivateKey = process.env.FUNDERS_PRIVATE_KEY?.trim();

if (!funderPrivateKey || funderPrivateKey.length !== 66) {
  console.error("❌ Invalid Funder Private Key! Please check your .env file.");
  process.exit(1);
}

let funderWallet;
try {
  funderWallet = new ethers.Wallet(funderPrivateKey, provider);
  console.log("✅ Funder Wallet Loaded:", funderWallet.address);
} catch (error) {
  console.error("❌ Error loading Funder Wallet:", error.message);
  process.exit(1);
}

// ✅ Authentication Middleware
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

// ✅ Signup Route (Creates a Wallet)
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

    // ✅ Create a new Ethereum Wallet (with 0 ETH)
    const wallet = ethers.Wallet.createRandom();

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save user & wallet to database
    await pool.query(
      "INSERT INTO users (username, email, password, wallet_address, private_key) VALUES ($1, $2, $3, $4, $5)",
      [username, email, hashedPassword, wallet.address, wallet.privateKey]
    );

    res.json({ success: true, message: "User registered successfully.", walletAddress: wallet.address });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Login Route (Returns Wallet Address)
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

    const token = jwt.sign(
      { userId: user.accountid, username: user.username, walletAddress: user.wallet_address },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "1h" }
    );

    res.json({ success: true, token, user });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Get Profile
app.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT accountID, username, email, wallet_address FROM users WHERE accountID = $1",
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

// ✅ Get Wallet Balance
app.get("/wallet/balance/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const balanceWei = await provider.getBalance(walletAddress);
    const balanceETH = ethers.formatEther(balanceWei);
    res.json({ success: true, balance: `${balanceETH} ETH` });
  } catch (error) {
    console.error("❌ Error fetching balance:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
