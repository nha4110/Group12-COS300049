{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useState, useEffect } from "react";
import { Paper, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Box } from "@mui/material";
import { motion } from "framer-motion"; // For animations
import { ethers } from "ethers";
import axios from "axios";
import { Send as SendIcon } from "@mui/icons-material";

const BACKEND_URL = "http://localhost:8081";

const BalanceSenderTab = ({ walletAddress, provider, fetchBalance, balance }) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [gasPrice] = useState("2"); // Gwei
  const [users, setUsers] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(`${BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        console.error("Failed to fetch users:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load user list. Please try again.");
    }
  };

  const handleUsernameChange = (event) => {
    const username = event.target.value;
    setSelectedUsername(username);
    const user = users.find((u) => u.username === username);
    setRecipientAddress(user ? user.wallet_address : "");
  };

  const sendDirectETH = async () => {
    if (!walletAddress || !recipientAddress || !amount) {
      alert("Please enter all fields.");
      return;
    }

    if (!provider) {
      alert("No Ethereum provider available. Please connect a wallet (e.g., MetaMask).");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        alert("Your MetaMask account does not match the wallet address provided. Please switch accounts.");
        return;
      }

      const tx = {
        to: recipientAddress,
        value: ethers.parseEther(amount),
        gasPrice: ethers.parseUnits(gasPrice, "gwei"),
      };

      const txResponse = await signer.sendTransaction(tx);
      await txResponse.wait();

      const newTransaction = {
        sender: walletAddress,
        recipient: recipientAddress,
        amount,
        hash: txResponse.hash,
        date: new Date().toISOString(),
        type: "balanceTransfer",
      };

      const existingTransactions = JSON.parse(localStorage.getItem("balanceTransactions")) || [];
      localStorage.setItem("balanceTransactions", JSON.stringify([...existingTransactions, newTransaction]));

      alert("Transaction successful! Reloading page...");
      fetchBalance(walletAddress); // Update balance without reload
      window.dispatchEvent(new Event("balanceUpdated"));
    } catch (error) {
      console.error("Transaction Error:", error);
      alert(`Transaction Failed: ${error.message}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #f9f9f9, #e8ecef)",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#2c3e50", display: "flex", alignItems: "center", gap: 1 }}
        >
          <SendIcon /> Send ETH
        </Typography>
        <Typography variant="body2" sx={{ color: "#7f8c8d", mb: 3 }}>
          Transfer ETH directly to another wallet.
        </Typography>

        <TextField
          label="Your Wallet Address"
          fullWidth
          margin="normal"
          value={walletAddress}
          InputProps={{ readOnly: true }}
          sx={{ bgcolor: "#fff", borderRadius: 1 }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel sx={{ color: "#34495e" }}>Recipient Username</InputLabel>
          <Select
            value={selectedUsername}
            onChange={handleUsernameChange}
            label="Recipient Username"
            sx={{ bgcolor: "#fff", borderRadius: 1 }}
          >
            <MenuItem value="">
              <em>Select a user</em>
            </MenuItem>
            {users.map((user) => (
              <MenuItem key={user.wallet_address} value={user.username}>
                {user.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Recipient Address"
          fullWidth
          margin="normal"
          value={recipientAddress}
          InputProps={{ readOnly: true }}
          sx={{ bgcolor: "#fff", borderRadius: 1 }}
        />
        <TextField
          label="Amount (ETH)"
          fullWidth
          margin="normal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          sx={{ bgcolor: "#fff", borderRadius: 1 }}
        />
        <Typography variant="body1" sx={{ mt: 2, color: "#27ae60" }}>
          Current Balance: {balance} ETH
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={sendDirectETH}
          sx={{
            mt: 3,
            py: 1.5,
            borderRadius: 2,
            background: "linear-gradient(90deg, #6e8efb, #a777e3)",
            "&:hover": { background: "linear-gradient(90deg, #5d78e6, #9366d2)" },
          }}
          startIcon={<SendIcon />}
        >
          Send ETH
        </Button>
      </Paper>
    </motion.div>
  );{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useState, useEffect } from "react"; // React hooks for state and lifecycle management
import { Paper, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Box } from "@mui/material"; // Material-UI components
import { motion } from "framer-motion"; // For animations
import { ethers } from "ethers"; // Ethers.js for Ethereum blockchain interactions
import axios from "axios"; // HTTP client for API requests
import { Send as SendIcon } from "@mui/icons-material"; // Send icon from Material-UI

const BACKEND_URL = "http://localhost:8081"; // Backend API base URL

const BalanceSenderTab = ({ walletAddress, provider, fetchBalance, balance }) => {
  const [recipientAddress, setRecipientAddress] = useState(""); // State for recipient wallet address
  const [amount, setAmount] = useState(""); // State for amount of ETH to send
  const [gasPrice] = useState("2"); // Fixed gas price in Gwei
  const [users, setUsers] = useState([]); // State for list of users fetched from backend
  const [selectedUsername, setSelectedUsername] = useState(""); // State for selected recipient username

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch list of users from backend API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("jwtToken"); // Retrieve JWT token from local storage
      const response = await axios.get(`${BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }, // Include token in request headers
      });
      if (response.data.success) {
        setUsers(response.data.users); // Update users state with fetched data
      } else {
        console.error("Failed to fetch users:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load user list. Please try again.");
    }
  };

  // Handle username selection from dropdown
  const handleUsernameChange = (event) => {
    const username = event.target.value;
    setSelectedUsername(username); // Update selected username
    const user = users.find((u) => u.username === username); // Find user by username
    setRecipientAddress(user ? user.wallet_address : ""); // Set recipient address or clear it
  };

  // Send ETH directly to recipient address
  const sendDirectETH = async () => {
    if (!walletAddress || !recipientAddress || !amount) {
      alert("Please enter all fields."); // Validate input fields
      return;
    }

    if (!provider) {
      alert("No Ethereum provider available. Please connect a wallet (e.g., MetaMask)."); // Check for provider
      return;
    }

    try {
      const signer = await provider.getSigner(); // Get signer from provider (e.g., MetaMask)
      const signerAddress = await signer.getAddress(); // Get signer's address

      // Verify signer matches the provided wallet address
      if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        alert("Your MetaMask account does not match the wallet address provided. Please switch accounts.");
        return;
      }

      // Prepare transaction object
      const tx = {
        to: recipientAddress,
        value: ethers.parseEther(amount), // Convert ETH amount to Wei
        gasPrice: ethers.parseUnits(gasPrice, "gwei"), // Set gas price in Wei
      };

      const txResponse = await signer.sendTransaction(tx); // Send transaction
      await txResponse.wait(); // Wait for transaction confirmation

      // Create new transaction record
      const newTransaction = {
        sender: walletAddress,
        recipient: recipientAddress,
        amount,
        hash: txResponse.hash,
        date: new Date().toISOString(),
        type: "balanceTransfer",
      };

      // Store transaction in local storage
      const existingTransactions = JSON.parse(localStorage.getItem("balanceTransactions")) || [];
      localStorage.setItem("balanceTransactions", JSON.stringify([...existingTransactions, newTransaction]));

      alert("Transaction successful! Reloading page...");
      fetchBalance(walletAddress); // Update balance without reload
      window.dispatchEvent(new Event("balanceUpdated")); // Trigger balance update event
    } catch (error) {
      console.error("Transaction Error:", error);
      alert(`Transaction Failed: ${error.message}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Animated container */}
      <Paper
        elevation={4}
        sx={{
          p: 4, // Padding
          borderRadius: 3, // Rounded corners
          background: "linear-gradient(135deg, #f9f9f9, #e8ecef)", // Gradient background
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)", // Custom shadow
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#2c3e50", display: "flex", alignItems: "center", gap: 1 }}
        >
          <SendIcon /> Send ETH {/* Title with send icon */}
        </Typography>
        <Typography variant="body2" sx={{ color: "#7f8c8d", mb: 3 }}>
          Transfer ETH directly to another wallet. {/* Description */}
        </Typography>

        <TextField
          label="Your Wallet Address"
          fullWidth
          margin="normal"
          value={walletAddress}
          InputProps={{ readOnly: true }} // Read-only field
          sx={{ bgcolor: "#fff", borderRadius: 1 }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel sx={{ color: "#34495e" }}>Recipient Username</InputLabel>
          <Select
            value={selectedUsername}
            onChange={handleUsernameChange} // Update recipient on selection
            label="Recipient Username"
            sx={{ bgcolor: "#fff", borderRadius: 1 }}
          >
            <MenuItem value="">
              <em>Select a user</em> {/* Placeholder */}
            </MenuItem>
            {users.map((user) => (
              <MenuItem key={user.wallet_address} value={user.username}>
                {user.username} {/* List of usernames */}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Recipient Address"
          fullWidth
          margin="normal"
          value={recipientAddress}
          InputProps={{ readOnly: true }} // Read-only field
          sx={{ bgcolor: "#fff", borderRadius: 1 }}
        />
        <TextField
          label="Amount (ETH)"
          fullWidth
          margin="normal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)} // Update amount state
          type="number" // Numeric input
          sx={{ bgcolor: "#fff", borderRadius: 1 }}
        />
        <Typography variant="body1" sx={{ mt: 2, color: "#27ae60" }}>
          Current Balance: {balance} ETH {/* Display current balance */}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={sendDirectETH} // Trigger send function
          sx={{
            mt: 3, // Margin top
            py: 1.5, // Vertical padding
            borderRadius: 2, // Rounded corners
            background: "linear-gradient(90deg, #6e8efb, #a777e3)", // Gradient background
            "&:hover": { background: "linear-gradient(90deg, #5d78e6, #9366d2)" }, // Hover effect
          }}
          startIcon={<SendIcon />} // Send icon on button
        >
          Send ETH
        </Button>
      </Paper>
    </motion.div>
  );
};

export default BalanceSenderTab;
