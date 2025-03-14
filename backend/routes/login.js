const express = require("express");
const router = express.Router();

module.exports = (pool, bcrypt, jwt) => {
  router.post("/", async (req, res) => {
    const { username, password } = req.body;

    try {
      const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: "Invalid username or password." });
      }

      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: "Invalid username or password." });
      }

      console.log(`🔑 User logged in: ${user.username}, Wallet: ${user.wallet_address}`);

      const token = jwt.sign(
        { userId: user.accountid, username: user.username, walletAddress: user.wallet_address },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: "1h" }
      );

      res.json({
        success: true,
        token,
        user: {
          accountID: user.accountid,
          username: user.username,
          email: user.email,
          wallet_address: user.wallet_address,
        },
      });
    } catch (error) {
      console.error("❌ Login Error:", error);
      res.status(500).json({ success: false, message: "Database error." });
    }
  });

  return router;
};