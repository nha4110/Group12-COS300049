const express = require("express");
const { ethers } = require("ethers");

const router = express.Router();

module.exports = (pool, provider) => {
  // Get Wallet for a User by accountID
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
      if (error.code === "ECONNREFUSED") {
        return res.status(500).json({ success: false, message: "Failed to connect to database" });
      }
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Get Wallet Balance
  router.get("/balance/:walletAddress", async (req, res) => {
    const { walletAddress } = req.params;

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ success: false, message: "Invalid wallet address" });
    }

    try {
      const balanceWei = await provider.getBalance(walletAddress);
      const balanceETH = ethers.formatEther(balanceWei);
      res.json({ success: true, balance: balanceETH });
    } catch (error) {
      console.error(`Error fetching balance for ${walletAddress}:`, error.message, error.stack);
      if (error.code === "NETWORK_ERROR" || error.code === "SERVER_ERROR") {
        return res.status(503).json({ success: false, message: "Blockchain network unavailable" });
      }
      res.status(500).json({ success: false, message: "Server error", details: error.message });
    }
  });

  // Get accountID by wallet address
  router.get("/address/:walletAddress", async (req, res) => {
    const { walletAddress } = req.params;

    try {
      const result = await pool.query("SELECT accountID FROM users WHERE wallet_address = $1", [walletAddress]);
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({ success: true, accountId: result.rows[0].accountid });
    } catch (error) {
      console.error("Error fetching account ID by wallet address:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  return router;
};