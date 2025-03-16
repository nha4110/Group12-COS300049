{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const { contractAddress, category } = req.query; // Add category as a query param
    try {
      console.log(
        `Checking ownership for token_id: ${id}, contract_address: ${contractAddress || "not specified"}, category: ${category || "not specified"}`
      );
      let query = "SELECT * FROM assets WHERE token_id = $1";
      const values = [parseInt(id, 10)];
      
      if (contractAddress) {
        query += " AND contract_address = $2";
        values.push(contractAddress);
      }
      if (category) {
        query += ` AND category = $${values.length + 1}`;
        values.push(category);
      }

      const result = await pool.query(query, values);
      const isOwned = result.rows.length > 0;
      console.log(`Ownership result for token_id ${id}:`, { isOwned, rows: result.rows });
      res.json({ isOwned, rows: result.rows });
    } catch (error) {
      console.error("Error checking NFT ownership:", error.message, "Details:", error);
      res.status(500).json({ success: false, message: "Database error", error: error.message });
    }
  });

  return router;
};