const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

module.exports = (pool) => {
  router.post("/", async (req, res) => {
    const { walletAddress, nftId, nftName, price, tokenID, contractAddress, imageUrl, category, txHash } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!walletAddress || !tokenID || !contractAddress || !txHash) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
      let accountId;

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
          accountId = decoded.accountId;
          const userResult = await pool.query("SELECT wallet_address FROM users WHERE account_id = $1", [accountId]);

          if (userResult.rowCount === 0) {
            return res.status(401).json({ success: false, message: "User not found" });
          }

          const userWallet = userResult.rows[0].wallet_address;
          if (userWallet.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(403).json({ success: false, message: "Wallet address does not match logged-in user" });
          }
        } catch (jwtError) {
          console.warn("Invalid JWT token, falling back to wallet address:", jwtError.message);
        }
      }

      if (!accountId) {
        let userResult = await pool.query("SELECT account_id FROM users WHERE wallet_address = $1", [walletAddress]);
        if (userResult.rowCount === 0) {
          return res.status(401).json({ success: false, message: "User not authenticated and wallet not registered" });
        }
        accountId = userResult.rows[0].account_id;
      }

      const tokenCheck = await pool.query("SELECT asset_id FROM assets WHERE token_id = $1", [tokenID]);
      if (tokenCheck.rowCount > 0) {
        return res.status(400).json({ success: false, message: "NFT with this token ID already exists" });
      }

      const insertAsset = await pool.query(
        `INSERT INTO assets (account_id, wallet_address, token_id, nft_name, price_eth, contract_address, image_url, category, tx_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [accountId, walletAddress, tokenID, nftName || "Unnamed NFT", price || "0", contractAddress, imageUrl, category || "Art", txHash]
      );

      await pool.query(
        `INSERT INTO transactions (account_id, sender_address, recipient_address, token_id, nft_name, amount_eth, transaction_type, contract_address, tx_hash, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [accountId, walletAddress, contractAddress, tokenID, nftName || "Unnamed NFT", price || "0", "Purchase", contractAddress, txHash]
      );

      res.json({ success: true, message: "NFT purchased successfully", asset: insertAsset.rows[0] });
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      if (error.code === "23505") {
        const isAssetDuplicate = error.constraint === "assets_token_id_key";
        const isTxDuplicate = error.constraint === "transactions_tx_hash_key";
        return res.status(400).json({
          success: false,
          message: isAssetDuplicate ? "NFT already owned" : isTxDuplicate ? "Transaction already recorded" : "Duplicate entry",
          details: error.detail,
        });
      }
      res.status(500).json({ success: false, message: "Failed to purchase NFT", details: error.message });
    }
  });

  return router;
};