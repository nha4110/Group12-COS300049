const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`Checking ownership for token_id: ${id}`);
      const result = await pool.query(
        "SELECT * FROM assets WHERE token_id = $1", // Use snake_case as per schema
        [parseInt(id, 10)] // Ensure integer
      );
      const isOwned = result.rows.length > 0;
      console.log(`Ownership result for token_id ${id}:`, { isOwned, rows: result.rows });
      res.json({ isOwned });
    } catch (error) {
      console.error("Error checking NFT ownership:", error.message, "Details:", error);
      res.status(500).json({ success: false, message: "Database error", error: error.message });
    }
  });

  return router;
};