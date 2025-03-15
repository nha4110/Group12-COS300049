const express = require("express");
const router = express.Router();

module.exports = (pool, bcrypt, assignNextAvailableWallet) => {
  router.post("/", async (req, res) => {
    const { username, email, password } = req.body;

    try {
      // Check if the username or email already exists
      const existingUser = await pool.query(
        "SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 OR email = $2) AS exists",
        [username, email]
      );
      if (existingUser.rows[0].exists) {
        return res.status(400).json({ success: false, message: "Username or email already exists." });
      }

      // Assign next available wallet
      const assignedWallet = await assignNextAvailableWallet();
      if (!assignedWallet) {
        return res.status(500).json({ success: false, message: "No available wallets left in Ganache." });
      }

      console.log(`🎉 New wallet assigned for ${username}: ${assignedWallet}`);

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user & wallet address to database
      await pool.query(
        "INSERT INTO users (username, email, password, wallet_address) VALUES ($1, $2, $3, $4)",
        [username, email, hashedPassword, assignedWallet]
      );

      res.json({ success: true, message: "User registered successfully.", walletAddress: assignedWallet });
    } catch (error) {
      console.error("❌ Signup Error:", error);
      res.status(500).json({ success: false, message: "Database error." });
    }
  });

  return router;
};