const express = require("express");
const { ethers } = require("ethers");

const router = express.Router();

module.exports = (pool, provider) => {
  router.get("/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
      const result = await pool.query("SELECT wallet_address FROM users WHERE account_id = $1", [userId]);
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({ success: true, walletAddress: result.rows[0].wallet_address });
    } catch (error) {
      console.error("Error fetching wallet:", error);
      if (error.code === "ECONNREFUSED") {
        return res.status(500).json({ success: false, message: "Failed to connect to database" });
      }
      res.status(500).json({ success: false, message: "Server error", details: error.message });
    }
  });

  router.get("/balance/:walletAddress", async (req, res) => {
    const { walletAddress } = req.params;
    console.log(`🔍 Fetching balance for: ${walletAddress}`);
    try {
      const balanceWei = await provider.getBalance(walletAddress, "latest"); // Force latest block
      const balanceEth = ethers.formatEther(balanceWei);
      console.log(`Backend balance for ${walletAddress}: ${balanceEth} ETH`);
      res.json({ success: true, balance: balanceEth });
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ success: false, message: "Failed to fetch balance" });
    }
  });

  router.get("/address/:walletAddress", async (req, res) => {
    const { walletAddress } = req.params;

    try {
      const result = await pool.query("SELECT account_id FROM users WHERE wallet_address = $1", [walletAddress]);
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({ success: true, accountId: result.rows[0].account_id });
    } catch (error) {
      console.error("Error fetching account ID by wallet address:", error);
      res.status(500).json({ success: false, message: "Server error", details: error.message });
    }
  });

  return router;
};