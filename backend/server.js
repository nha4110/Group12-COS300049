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

    if (adminExists) {
      const currentDbWallet = dbResult.rows[0].wallet_address;

      if (currentDbWallet !== newAdminWallet) {
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

// ✅ Check and Update Wallets for Users
async function checkAndUpdateWallets() {
  try {
    // Fetch all users excluding the admin (accountid = 1)
    const users = await pool.query("SELECT accountid, wallet_address FROM users WHERE accountid > 1");

    // Fetch all wallet addresses from Ganache
    const ganacheWallets = await provider.listAccounts();

    // Define the fixed wallet address to assign to non-admin users
    const fixedWalletAddress = "0xD153ABF6DEDf7768e040c7a4e388e7E3aFc7C2d2";

    for (let i = 0; i < users.rows.length; i++) {
      const user = users.rows[i];
      const currentWallet = user.wallet_address;

      // Check if the current wallet is in Ganache
      if (!ganacheWallets.includes(currentWallet)) {
        console.log(`Wallet address ${currentWallet} for user ${user.accountid} no longer exists in Ganache. Updating...`);

        // If the wallet doesn't exist in Ganache, assign the fixed wallet address
        console.log(`Assigning new wallet ${fixedWalletAddress} to user ${user.accountid}`);

        // Clear the old wallet address and update with the fixed wallet address
        await pool.query(
          "UPDATE users SET wallet_address = $1 WHERE accountid = $2",
          [fixedWalletAddress, user.accountid]
        );
      } else {
        console.log(`Wallet address for user ${user.accountid} is valid: ${currentWallet}`);
      }
    }
  } catch (error) {
    console.error("❌ Error updating wallets:", error);
  }
}

// ✅ Call this function on server startup
checkAndUpdateWallets();

// ✅ Run Setup for Admin Wallet and Check Wallets for Users
async function initialize() {
  await setupAdminWallet();
  await checkAndUpdateWallets();
}

// ✅ Run Initialization on Server Start
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
