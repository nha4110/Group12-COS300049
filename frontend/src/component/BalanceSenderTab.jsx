import React, { useState, useEffect } from "react";
import { Paper, Typography, TextField, Button } from "@mui/material";
import { ethers } from "ethers";

const BACKEND_URL = "http://localhost:8081";

const BalanceSenderTab = ({ walletAddress, fetchBalance, balance }) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [gasPrice] = useState("0.000000002");
  const [balanceAfter, setBalanceAfter] = useState("");

  useEffect(() => {
    if (balance && amount && gasPrice && !isNaN(balance) && !isNaN(amount) && !isNaN(gasPrice)) {
      const balanceNum = parseFloat(balance);
      const amountNum = parseFloat(amount);
      const gasNum = parseFloat(gasPrice);
      const newBalance = balanceNum - amountNum - gasNum;
      setBalanceAfter(newBalance.toFixed(18));
    } else {
      setBalanceAfter("");
    }
  }, [balance, amount, gasPrice]);

  const sendDirectETH = async () => {
    try {
      if (!ethers.isAddress(recipientAddress)) {
        alert("Invalid recipient address.");
        return;
      }

      const token = localStorage.getItem("jwtToken");
      if (!token) {
        alert("Please log in to proceed.");
        return;
      }

      const transferData = {
        recipient: recipientAddress,
        amount: amount,
      };

      alert("Processing your transaction... Please wait.");
      const response = await fetch(`${BACKEND_URL}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transferData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Transfer failed");
      }

      const data = await response.json();
      alert(`Transaction successful! TX Hash: ${data.txHash}`);

      setTimeout(() => {
        fetchBalance(walletAddress);
        window.location.reload();
      }, 3000);
    } catch (error) {
      alert(`Transaction failed: ${error.message}`);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
      <Typography variant="h6">Send ETH (Direct)</Typography>
      <TextField
        label="Your Wallet Address"
        fullWidth
        margin="normal"
        value={walletAddress}
        InputProps={{ readOnly: true }}
      />
      <TextField
        label="Recipient Address"
        fullWidth
        margin="normal"
        value={recipientAddress}
        onChange={(e) => setRecipientAddress(e.target.value)}
      />
      <TextField
        label="Amount (ETH)"
        fullWidth
        margin="normal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      {balanceAfter && (
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          Balance After Send: {balanceAfter} ETH
        </Typography>
      )}
      <Button variant="contained" color="primary" onClick={sendDirectETH}>
        Send
      </Button>
    </Paper>
  );
};

export default BalanceSenderTab;