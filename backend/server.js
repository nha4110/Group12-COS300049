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
const ADMIN_WALLET_FILE = "admin_wallet.json";

// ✅ Save Admin Wallet to File
function saveAdminWallet(walletAddress) {
  fs.writeFileSync(ADMIN_WALLET_FILE, JSON.stringify({ wallet_address: walletAddress }, null, 2));
}

// ✅ Load Admin Wallet from File
function loadAdminWallet() {
  if (fs.existsSync(ADMIN_WALLET_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ADMIN_WALLET_FILE, "utf8"));
      return data.wallet_address;
    } catch (error) {
      console.error("❌ Error reading admin_wallet.json, resetting...");
      saveAdminWallet(""); // Reset content instead of deleting
    }
  }
  return null;
}

// ✅ Setup Admin Wallet
async function setupAdminWallet() {
  let storedWallet = loadAdminWallet();

  try {
    const accounts = await provider.listAccounts();
    if (accounts.length < 1) {
      console.error("❌ No accounts found in Ganache!");
      return;
    }

    // ✅ Extract the correct wallet address format
    const newAdminWallet = accounts[0]?.address ? accounts[0].address : accounts[0];

    if (!ethers.isAddress(newAdminWallet)) {
      console.error("❌ Invalid wallet address from Ganache:", newAdminWallet);
      return;
    }

    // ✅ Check if Admin Exists in DB
    const dbResult = await pool.query("SELECT accountid, wallet_address FROM users WHERE accountid = 1");
    const adminExists = dbResult.rows.length > 0;

    console.log(`🔍 [DEBUG] Stored Wallet from File: ${storedWallet}`);
    console.log(`🔍 [DEBUG] New Wallet from Ganache: ${newAdminWallet}`);

    if (adminExists) {
      const currentDbWallet = dbResult.rows[0].wallet_address;
      console.log(`🔍 [DEBUG] Current Admin Wallet in DB: ${currentDbWallet}`);

      if (!currentDbWallet || currentDbWallet !== newAdminWallet) {
        console.log(`🔄 Admin Wallet Changed! Updating to: ${newAdminWallet}`);

        // ✅ Save new wallet address in file
        saveAdminWallet(newAdminWallet);

        // ✅ Update wallet address for accountid: 1
        const updateResult = await pool.query(
          "UPDATE users SET wallet_address = $1 WHERE accountid = 1",
          [newAdminWallet]
        );

        if (updateResult.rowCount > 0) {
          console.log(`✅ Admin wallet successfully updated in DB: ${newAdminWallet}`);
        } else {
          console.error("❌ [ERROR] Admin wallet update failed in DB.");
        }
      } else {
        console.log("✅ Admin wallet is already correct in DB.");
      }
    } else {
      console.log("⚠️ Admin account not found! Creating a new admin account...");

      await pool.query(
        "INSERT INTO users (accountid, username, email, password, wallet_address, created) VALUES ($1, $2, $3, $4, $5, NOW())",
        [1, "admin", "admin@example.com", await bcrypt.hash("admin123", 10), newAdminWallet]
      );

      saveAdminWallet(newAdminWallet);
      console.log(`✅ Admin account created with wallet: ${newAdminWallet}`);
    }
  } catch (error) {
    console.error("❌ Error setting up Admin Wallet:", error);
  }
}

// ✅ Run Admin Wallet Setup on Server Start
setupAdminWallet();

// ✅ Profile Route
app.get("/profile", async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await pool.query(
      "SELECT username, email, wallet_address FROM users WHERE accountid = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const user = result.rows[0];

    // ✅ Fetch ETH Balance from Ganache
    let ethBalance = "0 ETH";
    try {
      const balance = await provider.getBalance(user.wallet_address);
      ethBalance = `${ethers.formatEther(balance)} ETH`;
    } catch (err) {
      console.error("❌ Error fetching ETH balance:", err);
    }

    res.json({
      success: true,
      user: { username: user.username, email: user.email, wallet_address: user.wallet_address, eth_balance: ethBalance },
    });
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("🚀 API is running!");
});

// ✅ Balance Route
app.get("/wallet/balance/:address", async (req, res) => {
  const { address } = req.params;
  console.log(`Fetching balance for address: ${address}`);
  try {
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ success: false, message: "Invalid Ethereum address." });
    }

    const balanceWei = await provider.getBalance(address);
    console.log(`Balance in Wei: ${balanceWei.toString()}`);
    const balanceETH = ethers.formatEther(balanceWei);
    console.log(`Balance in ETH: ${balanceETH}`);
    res.json({ success: true, balance: balanceETH });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Signup Route (Assigns a Wallet)
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await pool.query("SELECT accountid FROM users WHERE username = $1 OR email = $2", [username, email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Username or email already exists." });
    }

    // ✅ Find an unused Ethereum Wallet from Ganache
    const accounts = await provider.listAccounts();
    let assignedWallet = null;

    for (const account of accounts.slice(1)) { // Skip admin account
      const user = await pool.query("SELECT * FROM users WHERE wallet_address = $1", [account]);
      if (user.rows.length === 0) {
        assignedWallet = account;
        break;
      }
    }

    if (!assignedWallet) {
      return res.status(500).json({ success: false, message: "No available wallets left in Ganache." });
    }

    console.log(`🎉 New wallet assigned for ${username}: ${assignedWallet}`);

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save user & wallet to database
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
