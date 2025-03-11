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

// ✅ Ethereum Provider (Ganache on port 8545)
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
  if (accounts.length < 1) return console.error("❌ No Ganache accounts found!");

  const newAdminWallet = extractAddress(accounts[0]);
  const dbResult = await pool.query("SELECT wallet_address FROM users WHERE accountid = 1");
  const currentDbWallet = dbResult.rows.length ? extractAddress(dbResult.rows[0].wallet_address) : null;

  if (currentDbWallet !== newAdminWallet) {
    console.log(`🔄 Updating Admin Wallet to: ${newAdminWallet}`);
    saveAdminWallet(newAdminWallet);
    await pool.query(
      `INSERT INTO users (accountid, username, email, password, wallet_address, created)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (accountid) DO UPDATE SET wallet_address = EXCLUDED.wallet_address`,
      [1, "admin", "admin@example.com", await bcrypt.hash("admin123", 10), newAdminWallet]
    );
  } else {
    console.log("✅ Admin wallet is already correct.");
  }
}

// ✅ Check and Update Wallets for Users
async function checkAndUpdateWallets() {
  const accounts = await provider.listAccounts();
  const userWallets = await pool.query("SELECT accountid, wallet_address FROM users WHERE accountid > 1 ORDER BY accountid ASC");

  const updates = [];
  for (let i = 0; i < userWallets.rows.length; i++) {
    const expectedWallet = extractAddress(accounts[i + 1]); // Skip Admin
    const currentWallet = extractAddress(userWallets.rows[i].wallet_address);

    if (expectedWallet && currentWallet !== expectedWallet) {
      updates.push(`WHEN accountid = <span class="math-inline">\{userWallets\.rows\[i\]\.accountid\} THEN '</span>{expectedWallet}'`);
    }
  }

  if (updates.length > 0) {
    await pool.query(`UPDATE users SET wallet_address = CASE ${updates.join(" ")} ELSE wallet_address END`);
    console.log("✅ Batch wallet updates completed.");
  } else {
    console.log("✅ All user wallets are correct.");
  }
}

// ✅ Assign Next Available Wallet to New User
async function assignNextAvailableWallet() {
  const accounts = await provider.listAccounts();
  const userAccounts = await pool.query("SELECT COUNT(accountid) FROM users");

  const nextAccountIndex = Math.min(parseInt(userAccounts.rows[0].count), 9);
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
    const existingUser = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 OR email = $2) AS exists",
      [username, email]
    );
    if (existingUser.rows[0].exists) {
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

// ✅ ETH Transfer Route (using smart contract)
app.post("/transfer", async (req, res) => {
  try {
      console.log("Received request body:", req.body);
      const { sender, recipient, amount } = req.body;

      // 1️⃣ Validate addresses
      if (!ethers.isAddress(sender) || !ethers.isAddress(recipient)) {
          return res.status(400).json({ success: false, message: "Invalid sender or recipient address." });
      }

      // 2️⃣ Check if sender is a known account in Ganache
      const accounts = await provider.listAccounts();
      console.log("Ganache accounts:", accounts);

      const senderIndex = accounts.indexOf(sender);
      if (senderIndex === -1 || senderIndex > 9) {
          return res.status(400).json({ success: false, message: "Sender not found in Ganache accounts 0-9." });
      }

      // 3️⃣ Retrieve sender's private key from Ganache (manually defined in your setup)
      const ganachePrivateKeys = [
          "0x1cb3246968a681fd65f47b2d13e1eacb5f8a7c7c848e1170a9b5739f74aea725",  // Admin
          "0x6b7307c8e786709c8223a1a23eec199b814231efb30544ecab09c95881e33fb8",  // User 1
          "0x1abf0de66cc41c23cc33b09286111ffc8e137249d22447f82f5989a4b10eaf9a",  // User 2
          "0x94f257ed5393e1967c967eb4a9fecb816faecb3f63f66b228c94ff2c6eb2fb46",  // User 3
          "0x4c135916a6dfe140f2c52c64e1abf48616d153da74f7b40672d7c03202e0377c",  // User 4
          "0x9b853a96370b0ee2d2e2f1eeb593f7ae9b4e4d98df8370f21e227375ce562697",  // User 5
          "0x23f78ca4acb114873960f06ce23777eeb06383e2957a08169eae3ca48dd7ee2f",  // User 6
          "0x408699a41ff8bde59c808973ffd7e973cf1f830dc83f3d41bb78b605a62326c9",  // User 7
          "0xa715224c64ba8c389dc4db0105992ddc387092d7c7ca148f3d7029cd627a5b27",  // User 8
          "0x4d967ab424136e55d9d4ce7b7411b5c4f396d04234dd3966a46ff9df04f2ea79"   // User 9
      ];

      const senderPrivateKey = ganachePrivateKeys[senderIndex]; // Get correct private key
      if (!senderPrivateKey) {
          return res.status(500).json({ success: false, message: "Private key for sender not found." });
      }

      // 4️⃣ Create wallet with sender's private key
      const senderWallet = new ethers.Wallet(senderPrivateKey, provider);
      console.log(`🔑 Sender's wallet address: ${senderWallet.address}`);

      // 5️⃣ Check balance before transfer
      const balance = await provider.getBalance(senderWallet.address);
      if (balance.lt(ethers.parseEther(amount))) {
          return res.status(400).json({ success: false, message: "Insufficient balance." });
      }

      // 6️⃣ Send ETH using sender's wallet
      const tx = await senderWallet.sendTransaction({
          to: recipient,
          value: ethers.parseEther(amount),
          gasLimit: 500000,
      });

      console.log(`✅ Transaction sent: ${tx.hash}`);
      await tx.wait(); // Wait for transaction confirmation

      // 7️⃣ Save transaction details in PostgreSQL
      const timestamp = new Date();
      await pool.query(
          "INSERT INTO transactions (sender, recipient, amount, tx_hash, timestamp) VALUES ($1, $2, $3, $4, $5)",
          [sender, recipient, amount, tx.hash, timestamp]
      );

      res.json({ success: true, message: "Transfer successful", txHash: tx.hash });
  } catch (error) {
      console.error("❌ Transfer Error:", error.message);
      res.status(500).json({ success: false, message: "Transfer failed." });
  }
});

app.post("/buy-nft", async (req, res) => {
  const { userId, nftId, nftName, price, tokenID, contractAddress, imageUrl, category } = req.body;
  
  try {
      // Check if user exists
      const userCheck = await pool.query("SELECT * FROM users WHERE accountid = $1", [userId]);
      if (userCheck.rows.length === 0) {
          return res.status(404).json({ error: "User not found" });
      }

      // Insert into assets table
      const insertAsset = await pool.query(
          "INSERT INTO assets (name, owner, img, price, tokenID, contract_address, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
          [nftName, userId, imageUrl, price, tokenID, contractAddress, category]
      );

      // Insert into transactions table
      await pool.query(
          "INSERT INTO transactions (accountID, name, price, mode, date, tokenID) VALUES ($1, $2, $3, 'Purchase', NOW(), $4)",
          [userId, nftName, price, tokenID]
      );

      res.json({ success: true, message: "NFT purchased successfully", asset: insertAsset.rows[0] });
  } catch (error) {
      console.error("Error purchasing NFT:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
