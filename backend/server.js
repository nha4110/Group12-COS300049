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

// ✅ Smart Contract Setup
const contractABI = require("./build/contracts/EthTransfer.json");

// Read the latest deployed contract address
const contractAddress = contractABI.networks
  ? Object.values(contractABI.networks).pop().address
  : null;

if (!contractAddress) {
  console.error("❌ No deployed contract found. Run `truffle migrate --reset` first.");
  process.exit(1); // Exit to prevent errors
}

const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
console.log(`✅ Smart contract loaded at: ${contractAddress}`);

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
      if (!ethers.utils.isAddress(sender) || !ethers.utils.isAddress(recipient)) {
          return res.status(400).json({ success: false, message: "Invalid sender or recipient address." });
      }

      // 2️⃣ Check if sender and recipient are in Ganache accounts 0-9
      const accounts = await provider.listAccounts();
      console.log("Ganache accounts:", accounts); // Log Ganache accounts
      const senderIndex = accounts.indexOf(sender);
      const recipientIndex = accounts.indexOf(recipient);

      if (senderIndex === -1 || senderIndex > 9 || recipientIndex === -1 || recipientIndex > 9) {
          return res.status(400).json({ success: false, message: "Sender or recipient not found in Ganache accounts 0-9." });
      }

      // 3️⃣ Get contract instance
      // const contractAddress = "0x..."; // Replace with your deployed contract address
      // const contract = new Contract(contractAddress, EthTransfer.abi, provider);
      const contract = new ethers.Contract(contractAddress, contractABI.abi, provider); // Use contractABI.abi

      // 4️⃣ Create a temporary wallet for signing
      const tempWallet = Wallet.createRandom().connect(provider);
      console.log("Temporary wallet address:", tempWallet.address); // Log temporary wallet address

      // 5️⃣ Transfer ETH using the temporary wallet
      const tx = await contract.connect(tempWallet).transferETH(recipient, ethers.utils.parseEther(amount), {
          value: ethers.utils.parseEther(amount),
          gasLimit: 500000,
      });
      await tx.wait();

      // 6️⃣ Save transaction details
      const timestamp = new Date();
      const query = `
          INSERT INTO transactions (sender, recipient, amount, tx_hash, timestamp)
          VALUES ($1, $2, $3, $4, $5)
      `;
      await pool.query(query, [sender, recipient, amount, tx.hash, timestamp]);

      res.json({ success: true, message: "Transfer successful", txHash: tx.hash });
  } catch (error) {
      console.error("❌ Transfer Error:", error.message);
      console.error("Error stack trace:", error.stack); // Log the stack trace
      res.status(500).json({ success: false, message: "Transfer failed." });
  }
});
// ✅ Start Server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
