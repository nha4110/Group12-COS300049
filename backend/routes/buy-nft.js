const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

module.exports = (pool) => {
  router.post("/", async (req, res) => {
    const { walletAddress, nftId, nftName, price, tokenID, contractAddress, imageUrl, category, txHash } = req.body;
    const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer <token>"

    if (!walletAddress || !tokenID || !contractAddress || !txHash) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
      let accountId;

      // Use logged-in user's accountid if token is provided
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        accountId = decoded.accountId;
        const userResult = await pool.query("SELECT wallet_address FROM users WHERE accountid = $1", [accountId]);

        if (userResult.rowCount === 0) {
          return res.status(401).json({ success: false, message: "User not found" });
        }

        const userWallet = userResult.rows[0].wallet_address;
        if (userWallet.toLowerCase() !== walletAddress.toLowerCase()) {
          return res.status(403).json({ success: false, message: "Wallet address does not match logged-in user" });
        }
      } else {
        // Fallback: Use walletAddress to find or create user (e.g., for testing)
        let userResult = await pool.query("SELECT accountid FROM users WHERE wallet_address = $1", [walletAddress]);
        if (userResult.rowCount === 0) {
          return res.status(401).json({ success: false, message: "User not authenticated and wallet not registered" });
        }
        accountId = userResult.rows[0].accountid;
      }

      // Insert asset
      const insertAsset = await pool.query(
        "INSERT INTO assets (name, owner, img, price, tokenid, contract_address, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [nftName, accountId, imageUrl, price, tokenID, contractAddress, category]
      );

      // Insert transaction
      await pool.query(
        "INSERT INTO transactions (accountid, sender, recipient, name, amount, mode, date, tokenid, tx_hash) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8)",
        [accountId, walletAddress, contractAddress, nftName, price, "Purchase", tokenID, txHash]
      );

      res.json({ success: true, message: "NFT purchased successfully", asset: insertAsset.rows[0] });
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      if (error.code === "23505") {
        const isAssetDuplicate = error.constraint === "assets_tokenid_contract_unique";
        const isTxDuplicate = error.constraint === "transactions_tx_hash_key";
        return res.status(400).json({
          success: false,
          message: isAssetDuplicate ? "NFT already owned" : isTxDuplicate ? "Transaction already recorded" : "Duplicate entry",
          details: error.detail
        });
      }
      res.status(500).json({ success: false, message: "Failed to purchase NFT", details: error.message });
    }
  });

  return router;
};