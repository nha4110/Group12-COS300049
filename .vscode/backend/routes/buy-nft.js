const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

module.exports = (pool) => {
  const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Received token:", token);
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);
      req.user = decoded; // { id, wallet }
      next();
    } catch (error) {
      console.error("JWT verification error:", error.message);
      return res.status(401).json({ success: false, message: "Invalid or expired token", details: error.message });
    }
  };

  router.post("/", verifyToken, async (req, res) => {
    const {
      walletAddress,
      nftId,
      nftName,
      price,
      tokenID,
      contractAddress,
      imageUrl,
      category,
      txHash,
      creator,
    } = req.body;

    console.log("Received payload:", req.body);

    if (!walletAddress || !tokenID || !contractAddress || !txHash) {
      return res.status(400).json({ success: false, message: "Missing required fields: walletAddress, tokenID, contractAddress, txHash" });
    }

    try {
      // Verify user
      const userResult = await pool.query(
        "SELECT account_id, wallet_address FROM users WHERE account_id = $1",
        [req.user.id]
      );
      console.log("User query result:", userResult.rows);
      if (userResult.rowCount === 0) {
        return res.status(401).json({ success: false, message: "User not found" });
      }

      const { account_id: accountId, wallet_address: dbWalletAddress } = userResult.rows[0];
      if (dbWalletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(403).json({ success: false, message: "Wallet address does not match authenticated user" });
      }

      // Check existing token
      const tokenCheck = await pool.query(
        "SELECT asset_id FROM assets WHERE token_id = $1 AND contract_address = $2",
        [tokenID, contractAddress]
      );
      console.log("Token check result:", tokenCheck.rows);
      if (tokenCheck.rowCount > 0) {
        return res.status(400).json({ success: false, message: "NFT with this token ID and contract address already exists" });
      }

      // Insert into assets
      const insertAsset = await pool.query(
        `INSERT INTO assets (account_id, wallet_address, token_id, nft_name, price_eth, contract_address, image_url, category, tx_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (token_id, contract_address) DO NOTHING
         RETURNING *`,
        [
          accountId,
          walletAddress,
          tokenID,
          nftName || "Unnamed NFT",
          price ? parseFloat(price) : 0.05, // Ensure numeric
          contractAddress,
          imageUrl || "",
          category || "Art",
          txHash,
        ]
      );
      console.log("Asset insert result:", insertAsset.rows);
      if (insertAsset.rowCount === 0) {
        return res.status(400).json({ success: false, message: "NFT already recorded by another request" });
      }

      // Insert into transactions
      const insertTx = await pool.query(
        `INSERT INTO transactions (account_id, sender_address, recipient_address, token_id, nft_name, amount_eth, transaction_type, contract_address, tx_hash, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (tx_hash) DO NOTHING
         RETURNING *`,
        [
          accountId,
          walletAddress,
          contractAddress,
          tokenID,
          nftName || "Unnamed NFT",
          price ? parseFloat(price) : 0.05, // Ensure numeric
          "Purchase",
          contractAddress,
          txHash,
        ]
      );
      console.log("Transaction insert result:", insertTx.rows);

      res.json({ success: true, message: "NFT purchased successfully", asset: insertAsset.rows[0] });
    } catch (error) {
      console.error("Error purchasing NFT:", error.message, error.stack);
      if (error.code === "23505") {
        const isAssetDuplicate = error.constraint === "assets_token_id_contract_address_key";
        const isTxDuplicate = error.constraint === "transactions_tx_hash_key";
        return res.status(400).json({
          success: false,
          message: isAssetDuplicate
            ? "NFT already owned"
            : isTxDuplicate
            ? "Transaction already recorded"
            : "Duplicate entry",
          details: error.detail,
        });
      }
      if (error.message.includes("ON CONFLICT")) {
        return res.status(500).json({
          success: false,
          message: "Database configuration error: missing unique constraint on assets table",
          details: error.message,
        });
      }
      res.status(500).json({ success: false, message: "Failed to purchase NFT", details: error.message });
    }
  });

  return router;
};