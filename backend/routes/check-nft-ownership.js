const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  router.get("/:tokenId", async (req, res) => {
    const { tokenId } = req.params;

    try {
      const result = await pool.query("SELECT owner FROM assets WHERE tokenID = $1", [tokenId]);
      if (result.rows.length > 0) {
        res.json({ isOwned: true, owner: result.rows[0].owner });
      } else {
        res.json({ isOwned: false });
      }
    } catch (error) {
      console.error("Error checking NFT ownership:", error);
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
};