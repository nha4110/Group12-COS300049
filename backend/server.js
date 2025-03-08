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

// ✅ Helper Function: Extract Pure Wallet Address
function extractAddress(wallet) {
  if (typeof wallet === "string") {
    return wallet;
  }
  if (wallet && wallet.address) {
    return wallet.address;
  }
  return null;
}

// ✅ Setup Admin Wallet
async function setupAdminWallet() {
  const storedWallet = loadAdminWallet();
  const accounts = await provider.listAccounts();

  if (accounts.length < 1) {
    console.error("❌ No accounts found in Ganache!");
    return;
  }

  const newAdminWallet = extractAddress(accounts[0]);

  if (!ethers.isAddress(newAdminWallet)) {
    console.error("❌ Invalid wallet address from Ganache:", newAdminWallet);
    return;
  }

  const dbResult = await pool.query("SELECT wallet_address FROM users WHERE accountid = 1");
  let currentDbWallet = dbResult.rows.length > 0 ? extractAddress(dbResult.rows[0].wallet_address) : null;

  if (!ethers.isAddress(currentDbWallet)) {
    console.warn(`⚠️ Fixing corrupted Admin wallet in DB: ${currentDbWallet}`);
    currentDbWallet = null;
  }

  if (currentDbWallet !== newAdminWallet) {
    console.log(`🔄 Updating Admin Wallet to: ${newAdminWallet}`);

    saveAdminWallet(newAdminWallet);

    await pool.query(
      "INSERT INTO users (accountid, username, email, password, wallet_address, created) VALUES ($1, $2, $3, $4, $5, NOW()) " +
      "ON CONFLICT (accountid) DO UPDATE SET wallet_address = EXCLUDED.wallet_address",
      [1, "admin", "admin@example.com", await bcrypt.hash("admin123", 10), newAdminWallet]
    );

    console.log(`✅ Admin wallet updated in DB: ${newAdminWallet}`);
  } else {
    console.log("✅ Admin wallet is already correct in DB.");
  }
}

// ✅ Check and Update Wallets for Users
async function checkAndUpdateWallets() {
  const accounts = await provider.listAccounts();
  const userAccounts = await pool.query("SELECT accountid, wallet_address FROM users WHERE accountid > 1 ORDER BY accountid ASC");

  for (let i = 0; i < userAccounts.rows.length; i++) {
    const user = userAccounts.rows[i];
    const expectedWallet = extractAddress(accounts[i + 1]); // Skip the first account (Admin)
    let currentWallet = extractAddress(user.wallet_address);

    if (!expectedWallet) {
      console.log(`⚠️ No more Ganache accounts available for accountid: ${user.accountid}`);
      break;
    }

    if (!ethers.isAddress(currentWallet)) {
      console.warn(`⚠️ Fixing corrupted wallet for user ${user.accountid}: ${currentWallet}`);
      currentWallet = null;
    }

    if (currentWallet !== expectedWallet) {
      console.log(`🔄 Updating wallet for accountid ${user.accountid}: ${currentWallet} -> ${expectedWallet}`);

      await pool.query(
        "UPDATE users SET wallet_address = $1 WHERE accountid = $2",
        [expectedWallet, user.accountid]
      );
    } else {
      console.log(`✅ Wallet for accountid ${user.accountid} is correct.`);
    }
  }
}

// ✅ Assign Next Available Wallet to New User
async function assignNextAvailableWallet() {
  const accounts = await provider.listAccounts();
  const userAccounts = await pool.query("SELECT COUNT(accountid) FROM users");

  const nextAccountIndex = parseInt(userAccounts.rows[0].count); // Next available accountid in DB
  const assignedWallet = extractAddress(accounts[nextAccountIndex]);

  if (!assignedWallet) {
    console.error("❌ No available wallets left in Ganache!");
    return null;
  }

  return assignedWallet;
}

// ✅ Signup Route (Assigns a Wallet)
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the username or email already exists
    const existingUser = await pool.query("SELECT accountid FROM users WHERE username = $1 OR email = $2", [username, email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Username or email already exists." });
    }

    // ✅ Assign next available wallet
    const assignedWallet = await assignNextAvailableWallet();
    if (!assignedWallet) {
      return res.status(500).json({ success: false, message: "No available wallets left in Ganache." });
    }

    console.log(`🎉 New wallet assigned for ${username}: ${assignedWallet}`);

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save user & wallet address to database
    await pool.query(
      "INSERT INTO users (username, email, password, wallet_address) VALUES ($1, $2, $3, $4)",
      [username, email, hashedPassword, assignedWallet]
    );

    res.json({ success: true, message: "User registered successfully.", walletAddress: assignedWallet });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Run Admin Wallet Setup and Check Users on Server Start
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
