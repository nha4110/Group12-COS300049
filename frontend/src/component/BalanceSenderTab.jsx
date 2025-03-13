import React, { useState, useEffect } from "react";
import { Paper, Typography, TextField, Button } from "@mui/material";
import { ethers } from "ethers";

const BalanceSenderTab = ({ walletAddress, web3, fetchBalance, balance }) => {
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
      if (!web3) {
        alert("Please install MetaMask or another web3 provider.");
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const senderAddress = accounts[0];
      const amountWei = web3.utils.toWei(amount, "ether");

      const transactionObject = {
        from: senderAddress,
        to: recipientAddress,
        value: amountWei,
        gas: 21000,
      };

      alert("Processing your transaction... Please wait.");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      web3.eth.sendTransaction(transactionObject)
        .on("transactionHash", async (hash) => {
          alert(`Transaction submitted! TX Hash: ${hash}`);
          const newTransaction = {
            from: senderAddress,
            to: recipientAddress,
            amount: amount,
            gas: "0.000055",
            hash: hash,
            date: new Date().toISOString(),
            type: "balanceTransfer",
          };

          // Save to localStorage
          const existingTransactions = JSON.parse(localStorage.getItem("balanceTransactions")) || [];
          localStorage.setItem("balanceTransactions", JSON.stringify([...existingTransactions, newTransaction]));

          // Wait briefly, update balance, then refresh page
          setTimeout(() => {
            fetchBalance(walletAddress); // Update balance before refresh
            setRecipientAddress("");
            setAmount("");
            window.location.reload(); // Full page refresh (Ctrl + R equivalent)
          }, 3000);
        })
        .on("error", (error) => {
          alert(`Transaction failed: ${error.message}`);
        });
    } catch (error) {
      alert(`Transaction Failed: ${error.message}`);
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