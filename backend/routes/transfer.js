const express = require("express");
const router = express.Router();

module.exports = (provider, ethers, pool) => {
  router.post("/", async (req, res) => {
    try {
      console.log("Received request body:", req.body);
      const { sender, recipient, amount } = req.body;

      // Validate addresses
      if (!ethers.isAddress(sender) || !ethers.isAddress(recipient)) {
        return res.status(400).json({ success: false, message: "Invalid sender or recipient address." });
      }

      // Check if sender is a known account in Ganache
      const accounts = await provider.listAccounts();
      console.log("Ganache accounts:", accounts);

      const senderIndex = accounts.findIndex(acc => acc.toLowerCase() === sender.toLowerCase());
      if (senderIndex === -1 || senderIndex > 9) {
        return res.status(400).json({ success: false, message: "Sender not found in Ganache accounts 0-9." });
      }

      // Retrieve sender's private key from Ganache (manually defined)
      const ganachePrivateKeys = [
        "0x1cb3246968a681fd65f47b2d13e1eacb5f8a7c7c848e1170a9b5739f74aea725", // Admin
        "0x6b7307c8e786709c8223a1a23eec199b814231efb30544ecab09c95881e33fb8", // User 1
        "0x1abf0de66cc41c23cc33b09286111ffc8e137249d22447f82f5989a4b10eaf9a", // User 2
        "0x94f257ed5393e1967c967eb4a9fecb816faecb3f63f66b228c94ff2c6eb2fb46", // User 3
        "0x4c135916a6dfe140f2c52c64e1abf48616d153da74f7b40672d7c03202e0377c", // User 4
        "0x9b853a96370b0ee2d2e2f1eeb593f7ae9b4e4d98df8370f21e227375ce562697", // User 5
        "0x23f78ca4acb114873960f06ce23777eeb06383e2957a08169eae3ca48dd7ee2f", // User 6
        "0x408699a41ff8bde59c808973ffd7e973cf1f830dc83f3d41bb78b605a62326c9", // User 7
        "0xa715224c64ba8c389dc4db0105992ddc387092d7c7ca148f3d7029cd627a5b27", // User 8
        "0x4d967ab424136e55d9d4ce7b7411b5c4f396d04234dd3966a46ff9df04f2ea79"  // User 9
      ];

      const senderPrivateKey = ganachePrivateKeys[senderIndex];
      if (!senderPrivateKey) {
        return res.status(500).json({ success: false, message: "Private key for sender not found." });
      }

      // Create wallet with sender's private key
      const senderWallet = new ethers.Wallet(senderPrivateKey, provider);
      console.log(`🔑 Sender's wallet address: ${senderWallet.address}`);

      // Check balance before transfer
      const balance = await provider.getBalance(senderWallet.address);
      if (balance.lt(ethers.parseEther(amount))) {
        return res.status(400).json({ success: false, message: "Insufficient balance." });
      }

      // Send ETH using sender's wallet
      const tx = await senderWallet.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
        gasLimit: 500000,
      });

      console.log(`✅ Transaction sent: ${tx.hash}`);
      await tx.wait(); // Wait for transaction confirmation

      // Save transaction details in PostgreSQL
      const timestamp = new Date();
      await pool.query(
        "INSERT INTO transactions (sender, recipient, amount, tx_hash, timestamp) VALUES ($1, $2, $3, $4, $5)",
        [sender, recipient, amount, tx.hash, timestamp]
      );

      res.json({ success: true, message: "Transfer successful", txHash: tx.hash });
    } catch (error) {
      console.error("❌ Transfer Error:", error.message);
      res.status(500).json({ success: false, message: "Transfer failed." });
    }
  });

  return router;
};