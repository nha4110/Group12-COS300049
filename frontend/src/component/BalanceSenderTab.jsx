import React, { useState, useEffect } from "react";
import { Paper, Typography, TextField, Button } from "@mui/material";
import { ethers } from "ethers";

const BACKEND_URL = "http://localhost:8081";

const BalanceSenderTab = ({ walletAddress, fetchBalance, balance }) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [gasPrice] = useState("0.000000002"); // Default gas price
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

      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it to proceed.");
        return;
      }

      // Request MetaMask connection
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      if (userAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        alert("MetaMask account does not match your logged-in wallet address.");
        return;
      }

      const amountWei = ethers.parseEther(amount);
      const tx = {
        to: recipientAddress,
        value: amountWei,
        gasLimit: 21000, // Standard ETH transfer gas limit
      };

      alert("Please confirm the transaction in MetaMask...");
      const txResponse = await signer.sendTransaction(tx);
      console.log(`Transaction sent: ${txResponse.hash}`);
      alert(`Transaction sent! TX Hash: ${txResponse.hash}`);

      // Wait for confirmation
      const receipt = await txResponse.wait();
      console.log(`Transaction confirmed: ${receipt.transactionHash}`);

      // Log transaction to backend
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        alert("No JWT token found. Please log in again.");
        return;
      }

      const logResponse = await fetch(`${BACKEND_URL}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sender_address: walletAddress,
          recipient_address: recipientAddress,
          amount_eth: amount,
          tx_hash: receipt.transactionHash,
        }),
      });

      if (!logResponse.ok) {
        const errorData = await logResponse.json();
        console.error("Failed to log transaction:", errorData);
        throw new Error(`Failed to log transaction: ${errorData.message}`);
      }

      console.log("Transaction logged successfully");

      setTimeout(() => {
        fetchBalance(walletAddress);
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Transaction error:", error);
      alert(`Transaction failed: ${error.message}`);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
      <Typography variant="h6">Send ETH (Direct via MetaMask)</Typography>
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
        Send via MetaMask
      </Button>
    </Paper>
  );
};

export default BalanceSenderTab;