const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  router.post("/", async (req, res) => {
    try {
      console.log("Received transfer request:", req.body);
      const { sender_address, recipient_address, amount_eth, tx_hash } = req.body;
      const walletAddress = req.user?.walletAddress;

      if (!walletAddress) {
        return res.status(401).json({ success: false, message: "No wallet address found" });
      }
      if (sender_address.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(403).json({ success: false, message: "Unauthorized sender" });
      }
      if (!sender_address || !recipient_address || !amount_eth || !tx_hash) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      const amountEthNum = parseFloat(amount_eth);
      if (isNaN(amountEthNum) || amountEthNum <= 0) {
        return res.status(400).json({ success: false, message: "Invalid amount" });
      }

      const userResult = await pool.query("SELECT account_id FROM users WHERE wallet_address = $1", [walletAddress]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const accountId = userResult.rows[0].account_id;

      // Explicitly set contract_address to an empty string for ETH transfers
      await pool.query(
        `INSERT INTO transactions (account_id, sender_address, recipient_address, amount_eth, transaction_type, tx_hash, created_at, contract_address)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
        [accountId, sender_address, recipient_address, amountEthNum, "ETH Transfer", tx_hash, '']
      );

      res.json({ success: true, message: "Transaction logged", txHash: tx_hash });
    } catch (error) {
      console.error("Transfer error:", error);
      res.status(500).json({ success: false, message: `Failed to log: ${error.message}` });
    }
  });

  return router;
};