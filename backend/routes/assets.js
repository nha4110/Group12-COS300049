{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

module.exports = (pool) => {
  const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, wallet }
      next();
    } catch (error) {
      console.error("JWT verification error:", error.message);
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  };

  router.get("/:walletAddress", verifyToken, async (req, res) => {
    const { walletAddress } = req.params;

    // Ensure wallet address case matches database
    const normalizedWallet = walletAddress.toLowerCase();
    console.log("Fetching assets for wallet:", normalizedWallet);

    try {
      const result = await pool.query(
        "SELECT * FROM assets WHERE wallet_address = $1",
        [normalizedWallet]
      );
      console.log("Assets found:", result.rows);

      res.json({ success: true, assets: result.rows });
    } catch (error) {
      console.error("Error fetching assets:", error.message);
      res.status(500).json({ success: false, message: "Server error", details: error.message });
    }
  });

  return router;
};
