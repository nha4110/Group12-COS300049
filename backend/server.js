require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const { ethers } = require("ethers");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authRoutes = require("./scripts/auth.js").router;
const walletRoutes = require("./routes/wallet");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/wallet", walletRoutes);

// ✅ PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
});

// ✅ Ethereum Provider (Ganache)
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// ✅ Admin Wallet File
const ADMIN_WALLET_FILE = "admin_wallet.txt";

// ✅ Save Admin Wallet to File
function saveAdminWallet(walletAddress) {
  fs.writeFileSync(ADMIN_WALLET_FILE, walletAddress);
}

// ✅ Load Admin Wallet from File
function loadAdminWallet() {
  return fs.existsSync(ADMIN_WALLET_FILE) ? fs.readFileSync(ADMIN_WALLET_FILE, "utf8").trim() : null;
}

// ✅ Setup Admin Wallet
async function setupAdminWallet() {
  const accounts = await provider.listAccounts();
  if (accounts.length < 1) {
    console.error("❌ No accounts found in Ganache!");
    return;
  }

  const newAdminWallet = accounts[0]; // First account is Admin
  if (!ethers.isAddress(newAdminWallet)) {
    console.error("❌ Invalid Admin wallet address:", newAdminWallet);
    return;
  }

  // ✅ Ensure Admin account exists in DB
  await pool.query(
    `INSERT INTO users (accountid, username, email, password, wallet_address, created)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (accountid) DO UPDATE SET wallet_address = EXCLUDED.wallet_address`,
    [1, "admin", "admin@example.com", await bcrypt.hash("admin123", 10), newAdminWallet]
  );

  saveAdminWallet(newAdminWallet);
  console.log(`✅ Admin wallet set to: ${newAdminWallet}`);
}

// ✅ Check and Fix Wallets for All Users
async function checkAndUpdateWallets() {
  const accounts = await provider.listAccounts();
  const result = await pool.query("SELECT accountid, wallet_address FROM users WHERE accountid > 1 ORDER BY accountid ASC");

  for (const user of result.rows) {
    const { accountid, wallet_address } = user;

    // ✅ Validate stored wallet
    if (!wallet_address || !ethers.isAddress(wallet_address) || !accounts.includes(wallet_address)) {
      console.log(`❌ Invalid wallet for user ${accountid}: ${wallet_address}. Assigning new one...`);

      const newWallet = accounts.find(acc => !result.rows.some(user => user.wallet_address === acc));
      if (!newWallet) {
        console.error("❌ No available wallets left in Ganache!");
        continue;
      }

      await pool.query("UPDATE users SET wallet_address = $1 WHERE accountid = $2", [newWallet, accountid]);
      console.log(`✅ New wallet assigned to user ${accountid}: ${newWallet}`);
    } else {
      console.log(`✅ Wallet for user ${accountid} is correct.`);
    }
  }
}

// ✅ Assign Next Available Wallet to New User
async function assignNextAvailableWallet() {
  const accounts = await provider.listAccounts();
  const usedWallets = (await pool.query("SELECT wallet_address FROM users")).rows.map(u => u.wallet_address);

  // ✅ Find first unused wallet
  const availableWallet = accounts.find(acc => !usedWallets.includes(acc));
  if (!availableWallet) {
    console.error("❌ No available wallets left in Ganache!");
    return null;
  }

  return availableWallet;
}

// ✅ Signup Route (Assigns a Wallet)
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // ✅ Check if username/email exists
    const existingUser = await pool.query("SELECT accountid FROM users WHERE username = $1 OR email = $2", [username, email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Username or email already exists." });
    }

    // ✅ Assign a wallet
    const assignedWallet = await assignNextAvailableWallet();
    if (!assignedWallet) {
      return res.status(500).json({ success: false, message: "No available wallets left in Ganache." });
    }

    console.log(`🎉 New wallet assigned for ${username}: ${assignedWallet}`);

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert new user into database
    await pool.query(
      "INSERT INTO users (username, email, password, wallet_address, created) VALUES ($1, $2, $3, $4, NOW())",
      [username, email, hashedPassword, assignedWallet]
    );

    res.json({ success: true, message: "User registered successfully.", walletAddress: assignedWallet });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Run Setup on Server Start
async function initialize() {
  await setupAdminWallet();
  await checkAndUpdateWallets();
}

initialize();

// ✅ Login Route
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

    console.log(`🔑 User logged in: ${user.username}, Wallet: ${user.wallet_address}`);

    const token = jwt.sign(
      { userId: user.accountid, username: user.username, walletAddress: user.wallet_address },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      user: {
        accountID: user.accountid,
        username: user.username,
        email: user.email,
        wallet_address: user.wallet_address,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
