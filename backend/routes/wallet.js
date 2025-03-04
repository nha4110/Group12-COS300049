const express = require("express");
const { ethers } = require("ethers");
const pool = require("../db"); // PostgreSQL connection
require("dotenv").config();

const router = express.Router();
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545"); // Ganache RPC

// ✅ Create Wallet for a New User
router.post("/create", async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

    try {
        // Generate a new Ethereum wallet
        const wallet = ethers.Wallet.createRandom();

        // Save wallet address and private key in the database
        const result = await pool.query(
            "UPDATE users SET wallet_address = $1, private_key = $2 WHERE accountID = $3 RETURNING wallet_address",
            [wallet.address, wallet.privateKey, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, walletAddress: wallet.address });
    } catch (error) {
        console.error("Error creating wallet:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Get Wallet for a User
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query("SELECT wallet_address FROM users WHERE accountID = $1", [userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, walletAddress: result.rows[0].wallet_address });
    } catch (error) {
        console.error("Error fetching wallet:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Get Wallet Balance
router.get("/balance/:walletAddress", async (req, res) => {
    const { walletAddress } = req.params;

    try {
        const balanceWei = await provider.getBalance(walletAddress);
        const balanceETH = ethers.formatEther(balanceWei);
        res.json({ success: true, balance: `${balanceETH} ETH` });
    } catch (error) {
        console.error("Error fetching balance:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
