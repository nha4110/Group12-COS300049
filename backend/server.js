require("dotenv").config();
const { ethers } = require("ethers");
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
});

// ✅ Ethereum Provider (Ganache)
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

// ✅ Admin Wallet Setup
async function setupAdminWallet() {
  try {
    const accounts = await provider.listAccounts();
    if (accounts.length < 10) {
      console.error("❌ Not enough accounts in Ganache!");
      return;
    }

    // ✅ Set Admin Wallet (First Account)
    const adminWalletAddress = accounts[0];
    console.log(`💰 Admin Wallet Address: ${adminWalletAddress}`);

    // ✅ Check Admin Balance
    const adminBalance = await provider.getBalance(adminWalletAddress);
    console.log(`💰 Admin Balance: ${ethers.formatEther(adminBalance)} ETH`);
    
    if (adminBalance < ethers.parseEther("100")) {
      console.log(`🟢 Adding 100 ETH to Admin wallet...`);
      const signer = await provider.getSigner(0);
      const tx = await signer.sendTransaction({
        to: adminWalletAddress,
        value: ethers.parseEther("100"),
      });
      await tx.wait();
      console.log(`✅ Admin wallet funded with 100 ETH`);
    }

    // ✅ Store Admin in Database
    const adminEmail = "admin@example.com";
    const adminPassword = "adminpass";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await pool.query(
      `INSERT INTO users (username, email, password, wallet_address)
       VALUES ('Admin', $1, $2, $3)
       ON CONFLICT (username) DO UPDATE 
       SET email = EXCLUDED.email, 
           password = EXCLUDED.password, 
           wallet_address = EXCLUDED.wallet_address`,
      [adminEmail, hashedPassword, adminWalletAddress]
    );

    console.log("✅ Admin wallet stored in database.");

  } catch (error) {
    console.error("❌ Error setting up Admin wallet:", error);
  }
}

// ✅ Run Admin Wallet Setup on Server Start
setupAdminWallet();

// ✅ Authentication Middleware
const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret_key"
    );
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
      return res
        .status(400)
        .json({ success: false, message: "Username or email already exists." });
    }

    // ✅ Find an unused Ethereum Wallet from Ganache
    const accounts = await provider.listAccounts();
    let availableWallet = null;

    for (let i = 1; i < accounts.length; i++) {
      const user = await pool.query(
        "SELECT * FROM users WHERE wallet_address = $1",
        [accounts[i]]
      );
      if (user.rows.length === 0) {
        availableWallet = accounts[i];
        break;
      }
    }

    if (!availableWallet) {
      return res.status(500).json({
        success: false,
        message: "No available wallets left in Ganache.",
      });
    }

    console.log(`🎉 New wallet assigned for ${username}: ${availableWallet}`);

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save user & wallet to database
    await pool.query(
      "INSERT INTO users (username, email, password, wallet_address) VALUES ($1, $2, $3, $4)",
      [username, email, hashedPassword, availableWallet]
    );

    res.json({
      success: true,
      message: "User registered successfully.",
      walletAddress: availableWallet,
    });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});

// ✅ Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password." });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password." });
    }

    console.log(
      `🔑 User logged in: ${user.username}, Wallet: ${user.wallet_address}`
    );

    const token = jwt.sign(
      {
        userId: user.accountid,
        username: user.username,
        walletAddress: user.wallet_address,
      },
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

// ✅ Get Wallet Balance
app.get("/wallet/balance/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;

  try {
    console.log(`📡 Fetching balance for: ${walletAddress}`);
    const balanceWei = await provider.getBalance(walletAddress);
    const balanceETH = ethers.formatEther(balanceWei);
    console.log(`💰 Balance: ${balanceETH} ETH`);

    res.json({ success: true, balance: `${balanceETH} ETH` });
  } catch (error) {
    console.error("❌ Error fetching balance:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
