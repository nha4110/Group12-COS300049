const express = require("express");
const router = express.Router();

module.exports = (provider, ethers, pool) => {
  router.post("/", async (req, res) => {
    try {
      console.log("Received request body:", req.body);
      const { sender_address, recipient_address, amount_eth, tx_hash } = req.body;
      const walletAddress = req.user.walletAddress;

      if (sender_address.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(403).json({ success: false, message: "Unauthorized: Sender must match logged-in user." });
      }

      if (!ethers.isAddress(sender_address) || !ethers.isAddress(recipient_address)) {
        console.log("Validation failed - Sender:", sender_address, "Recipient:", recipient_address);
        return res.status(400).json({ success: false, message: "Invalid sender or recipient address." });
      }

      // Convert amount_eth to a number for DECIMAL compatibility
      const amountEthNum = parseFloat(amount_eth);
      if (isNaN(amountEthNum)) {
        return res.status(400).json({ success: false, message: "Invalid amount_eth value." });
      }

      const userResult = await pool.query("SELECT account_id FROM users WHERE wallet_address = $1", [walletAddress]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "User not found for wallet address." });
      }
      const accountId = userResult.rows[0].account_id;

      const result = await pool.query(
        `INSERT INTO transactions (account_id, sender_address, recipient_address, token_id, nft_name, 
                                  amount_eth, transaction_type, contract_address, tx_hash, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         RETURNING transaction_id`,
        [
          accountId,
          sender_address,
          recipient_address,
          null,
          null,
          amountEthNum,
          "ETH Transfer",
          "0x0000000000000000000000000000000000000000",
          tx_hash,
        ]
      );

      res.json({
        success: true,
        message: "Transaction logged successfully",
        transactionId: result.rows[0].transaction_id,
        txHash: tx_hash,
      });
    } catch (error) {
      console.error("❌ Transfer Logging Error:", error.message, error.stack);
      res.status(500).json({ success: false, message: `Failed to log transaction: ${error.message}` });
    }
  });

  return router;
};