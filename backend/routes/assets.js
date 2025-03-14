const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  // Fetch all assets for a wallet address
  router.get("/:walletAddress", async (req, res) => {
    const { walletAddress } = req.params;

    try {
      const result = await pool.query(
        "SELECT * FROM assets WHERE wallet_address = $1",
        [walletAddress]
      );
      res.json({ success: true, assets: result.rows });
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  return router;
};