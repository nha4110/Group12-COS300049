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
    await pool.query(`UPDATE users SET wallet_address = $1 WHERE account_id = 1`, [newAdminWallet]);
  } else {
    console.log("✅ Admin wallet is already correct.");
  }
}

// Check and Update Wallets for Users
async function checkAndUpdateWallets() {
  console.log("✅ All user wallets are assumed correct (managed client-side).");
}

// Mount Routes with Dependencies
app.use("/auth", authRoutes);
app.use("/wallet", walletRoutes(pool, provider));
app.use("/login", loginRoutes(pool, bcrypt, jwt));
app.use("/transfer", transferRoutes(provider, ethers, pool));
app.use("/assets", assetsRouter);
app.use("/buy-nft", buyNFTRoutes(pool));
app.use("/check-nft-ownership", checkNFTOwnershipRoutes(pool));

// Signup Route (Inline)
app.post("/signup", async (req, res) => {
  const { username, email, password, walletAddress } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 OR email = $2 OR wallet_address = $3) AS exists",
      [username, email, walletAddress]
    );
    if (existingUser.rows[0].exists) {
      return res.status(400).json({ success: false, message: "Username, email, or wallet address already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, email, password, wallet_address) VALUES ($1, $2, $3, $4)",
      [username, email, hashedPassword, walletAddress]
    );

    res.json({ success: true, message: "User registered successfully.", walletAddress });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// Collections Routes
app.get("/api/collections", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM collections");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

app.get("/api/collections/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const result = await pool.query("SELECT * FROM collections WHERE category = $1", [category]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching collection:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

app.post("/api/collections", async (req, res) => {
  const { category, creator, tokenIdStart, baseCid, nftCount } = req.body;
  try {
    await pool.query(
      "INSERT INTO collections (category, creator, token_id_start, base_cid, nft_count) VALUES ($1, $2, $3, $4, $5)",
      [category, creator, tokenIdStart, baseCid, nftCount]
    );
    res.json({ success: true, message: "Collection created" });
  } catch (error) {
    console.error("Error creating collection:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// Run Admin Wallet Setup and Check Users on Server Start
async function initialize() {
  await setupAdminWallet();
  await checkAndUpdateWallets();
}

initialize();

// Start Server with Route Debugging
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
  console.log(
    "Registered routes:",
    app._router.stack
      .filter((r) => r.route || r.handle.stack)
      .flatMap((r) => {
        if (r.route) {
          return [`${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`];
        }
        if (r.handle.stack) {
          const basePath = r.path || "";
          return r.handle.stack.map((sub) => {
            const method = Object.keys(sub.route.methods)[0].toUpperCase();
            const subPath = sub.route.path === "/" ? "" : sub.route.path;
            return `${method} ${basePath}${subPath}`;
          });
        }
        return [];
      })
  );
});