require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const { ethers } = require("ethers");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
});

// Ethereum Provider (Ganache on port 8545)
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Admin Wallet File
const ADMIN_WALLET_FILE = "admin_wallet.txt";

// External Routes
const authRoutes = require("./scripts/auth.js").router;
const walletRoutes = require("./routes/wallet");
const assetsRouter = require("./routes/assets")(pool);
const loginRoutes = require("./routes/login");
const transferRoutes = require("./routes/transfer");
const buyNFTRoutes = require("./routes/buy-nft");
const checkNFTOwnershipRoutes = require("./routes/check-nft-ownership");

// Save Admin Wallet to File
function saveAdminWallet(walletAddress) {
  fs.writeFileSync(ADMIN_WALLET_FILE, walletAddress);
}

// Load Admin Wallet from File
function loadAdminWallet() {
  return fs.existsSync(ADMIN_WALLET_FILE) ? fs.readFileSync(ADMIN_WALLET_FILE, "utf8").trim() : null;
}

// Helper Function: Extract Pure Wallet Address
function extractAddress(wallet) {
  if (typeof wallet === "string") return wallet;
  if (wallet && wallet.address) return wallet.address;
  return null;
}

// Assign Next Available Wallet (Moved here for reuse)
async function assignNextAvailableWallet() {
  const accounts = await provider.listAccounts();
  for (const account of accounts) {
    const address = extractAddress(account);
    const exists = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM users WHERE wallet_address = $1) AS exists",
      [address]
    );
    if (!exists.rows[0].exists) {
      return address;
    }
  }
  return null; // No available wallets
}

// Setup Admin Wallet
async function setupAdminWallet() {
  const storedWallet = loadAdminWallet();
  const accounts = await provider.listAccounts();
  if (accounts.length < 1) return console.error("❌ No Ganache accounts found!");

  const newAdminWallet = extractAddress(accounts[0]);
  const dbResult = await pool.query("SELECT wallet_address FROM users WHERE account_id = 1");
  const currentDbWallet = dbResult.rows.length ? extractAddress(dbResult.rows[0].wallet_address) : null;

  if (!currentDbWallet) {
    console.log(`🔄 Creating Admin Wallet: ${newAdminWallet}`);
    saveAdminWallet(newAdminWallet);
    await pool.query(
      `INSERT INTO users (account_id, username, email, password, wallet_address, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (account_id) DO NOTHING`,
      [1, "admin", "admin@example.com", await bcrypt.hash("admin123", 10), newAdminWallet]
    );
  } else if (currentDbWallet !== newAdminWallet) {
    console.log(`🔄 Updating Admin Wallet to: ${newAdminWallet}`);
    saveAdminWallet(newAdminWallet);
    await pool.query(
      `UPDATE users SET wallet_address = $1 WHERE account_id = 1`,
      [newAdminWallet]
    );
  } else {
    console.log("✅ Admin wallet is already correct.");
  }
}

// Check and Update Wallets for Users
async function checkAndUpdateWallets() {
  try {
    // Fetch all users without a wallet_address
    const result = await pool.query(
      "SELECT username FROM users WHERE wallet_address IS NULL OR wallet_address = ''"
    );
    const usersWithoutWallets = result.rows;

    if (usersWithoutWallets.length === 0) {
      console.log("✅ All users have wallet addresses.");
      return;
    }

    console.log(`🔍 Found ${usersWithoutWallets.length} users without wallet addresses.`);

    for (const user of usersWithoutWallets) {
      const assignedWallet = await assignNextAvailableWallet();
      if (!assignedWallet) {
        console.error("❌ No available wallets left in Ganache to assign.");
        break;
      }
      await pool.query(
        "UPDATE users SET wallet_address = $1 WHERE username = $2",
        [assignedWallet, user.username]
      );
      console.log(`🎉 Assigned wallet ${assignedWallet} to user ${user.username}`);
    }
  } catch (error) {
    console.error("❌ Error in checkAndUpdateWallets:", error);
  }
}

// Mount Routes with Dependencies
app.use("/auth", authRoutes);
app.use("/wallet", walletRoutes(pool, provider));
app.use("/login", loginRoutes(pool, bcrypt, jwt));
app.use("/transfer", transferRoutes(provider, ethers, pool));
app.use("/assets", assetsRouter);
app.use("/buy-nft", buyNFTRoutes(pool));
app.use("/check-nft-ownership", checkNFTOwnershipRoutes(pool));

// Signup Route (Moved to separate file, but included here for completeness)
app.post("/signup", require("./routes/signup")(pool, bcrypt, assignNextAvailableWallet));

// Run Admin Wallet Setup and Check Users on Server Start
async function initialize() {
  await setupAdminWallet();
  await checkAndUpdateWallets();
}

initialize();

// Start Server with Fixed Route Debugging
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
  console.log("Registered routes:", app._router.stack
    .filter(r => r.route || r.handle.stack)
    .flatMap(r => {
      if (r.route) {
        return [`${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`];
      }
      if (r.handle.stack) {
        const basePath = r.path || '';
        return r.handle.stack.map(sub => {
          const method = Object.keys(sub.route.methods)[0].toUpperCase();
          const subPath = sub.route.path === '/' ? '' : sub.route.path;
          return `${method} ${basePath}${subPath}`;
        });
      }
      return [];
    })
  );
});