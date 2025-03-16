{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
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
const buyNFTRoutes = require("./routes/buy-nft");
const checkNFTOwnershipRoutes = require("./routes/check-nft-ownership");
const transferRoutes = require("./routes/transfer");

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

// Assign Next Available Wallet from Ganache
async function assignNextAvailableWallet() {
  const accounts = await provider.listAccounts();
  const usedWallets = (await pool.query("SELECT wallet_address FROM users")).rows.map(row => row.wallet_address.toLowerCase());
  
  for (const account of accounts.slice(1)) { // Skip admin (index 0)
    const address = extractAddress(account);
    if (address && !usedWallets.includes(address.toLowerCase())) {
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
  const dbResult = await pool.query("SELECT wallet_address FROM users WHERE username = $1", ["admin"]);
  const currentDbWallet = dbResult.rows.length ? extractAddress(dbResult.rows[0].wallet_address) : null;

  if (!currentDbWallet) {
    console.log(`🔄 Creating Admin Wallet: ${newAdminWallet}`);
    saveAdminWallet(newAdminWallet);
    await pool.query(
      `INSERT INTO users (username, email, password, wallet_address, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (username) DO NOTHING`,
      ["admin", "admin@example.com", await bcrypt.hash("admin123", 10), newAdminWallet]
    );
  } else if (currentDbWallet !== newAdminWallet) {
    console.log(`🔄 Updating Admin Wallet to: ${newAdminWallet}`);
    saveAdminWallet(newAdminWallet);
    await pool.query(`UPDATE users SET wallet_address = $1 WHERE username = $2`, [newAdminWallet, "admin"]);
  } else {
    console.log("✅ Admin wallet is already correct.");
  }
}

// Check and Update Wallets for Users
async function checkAndUpdateWallets() {
  console.log("✅ All user wallets are assumed correct (managed client-side).");
}

// Middleware for JWT Authentication
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Authorization header:", req.headers.authorization);
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    console.log("Decoded JWT:", JSON.stringify(decoded, null, 2));
    req.user = {
      accountId: decoded.account_id || decoded.id,
      username: decoded.username,
      walletAddress: decoded.wallet_address || decoded.walletAddress || decoded.wallet || null
    };
    if (!req.user.walletAddress) {
      console.warn("Wallet address not found in JWT payload:", decoded);
    }
    console.log("req.user set to:", JSON.stringify(req.user, null, 2));
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.name, error.message, error.stack);
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ success: false, message: "Token expired. Please log in again." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ success: false, message: "Invalid token format." });
    }
    res.status(403).json({ success: false, message: "Invalid token" });
  }
};

// Mount Routes with Dependencies
app.use("/auth", authRoutes);
app.use("/wallet", walletRoutes(pool, provider));
app.use("/login", loginRoutes(pool, bcrypt, jwt));
app.use("/assets", assetsRouter);
app.use("/buy-nft", buyNFTRoutes(pool));
app.use("/check-nft-ownership", checkNFTOwnershipRoutes(pool));
app.use("/transfer", transferRoutes(provider, ethers, pool));
// Signup Route
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 OR email = $2) AS exists",
      [username, email]
    );
    if (existingUser.rows[0].exists) {
      return res.status(400).json({ success: false, message: "Username or email already exists." });
    }

    const walletAddress = await assignNextAvailableWallet();
    if (!walletAddress) {
      return res.status(500).json({ success: false, message: "No available wallets left in Ganache." });
    }

    console.log(`🎉 New wallet assigned for ${username}: ${walletAddress}`);
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, email, password, wallet_address, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING account_id",
      [username, email, hashedPassword, walletAddress]
    );

    const token = jwt.sign(
      { account_id: result.rows[0].account_id, username, wallet_address: walletAddress },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    res.json({ success: true, message: "User registered successfully.", walletAddress, token });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// Collections Routes
app.get("/api/collections", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT "id", "category", "creator", "token_id_start", "base_cid", "nft_count", "created_at"
       FROM "collections"
       ORDER BY "id"
       LIMIT 50`
    );
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

// NFT Transactions Route
app.get("/api/nft-transactions", authenticateToken, async (req, res) => {
  try {
    console.log("Starting /api/nft-transactions endpoint");
    const walletAddress = req.user.walletAddress;
    const { category, contractAddress } = req.query; // Add optional filters
    if (!walletAddress) {
      console.log("Wallet address missing in req.user:", req.user);
      return res.status(400).json({ success: false, message: "Wallet address not provided in token" });
    }
    const normalizedWalletAddress = walletAddress.toLowerCase();
    console.log(`Fetching NFT transactions for wallet: ${normalizedWalletAddress}`);

    let query = `
      SELECT 
        transaction_id,
        account_id,
        sender_address AS "from",
        recipient_address AS "to",
        token_id,
        nft_name,
        amount_eth AS amount,
        transaction_type,
        contract_address,
        category,
        tx_hash,
        created_at AS date
      FROM transactions
      WHERE (sender_address = $1 OR recipient_address = $1)
        AND token_id IS NOT NULL`;
    const values = [normalizedWalletAddress];

    if (category) {
      query += " AND category = $2";
      values.push(category);
    }
    if (contractAddress) {
      query += " AND contract_address = $3";
      values.push(contractAddress);
    }
    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, values);
    console.log(`NFT transactions fetched: ${result.rows.length} records`, JSON.stringify(result.rows, null, 2));
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching NFT transactions:", error.message, error.stack);
    res.status(500).json({ success: false, message: `Database error: ${error.message}` });
  }
});

// Run Admin Wallet Setup and Check Users on Server Start
async function initialize() {
  await setupAdminWallet();
  await checkAndUpdateWallets();
}

initialize();
// Add this after other route definitions in server.js

// Get all users for recipient selection
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT username, wallet_address 
       FROM users 
       WHERE wallet_address IS NOT NULL 
       ORDER BY username`
    );
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

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