import React, { useState, useEffect } from "react";
import { Container, Typography, Paper, Button, Tabs, Tab, Box } from "@mui/material";
import { getWalletBalance } from "../api/wallet";
import { useAuth } from "../scripts/AuthContext";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import NFTCollectionTab from "../component/NFTCollectionTab";
import BalanceSenderTab from "../component/BalanceSenderTab";
import CreateNFTTab from "../component/CreateNFTTab";

const Profile = () => {
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();
  const user = state.user;
  const accountId = user?.account_id;

  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("Loading...");
  const [currentTab, setCurrentTab] = useState("NFT Collection");
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    if (user && user.wallet_address) {
      setWalletAddress(user.wallet_address);
      fetchBalance(user.wallet_address);
    }
    if (window.ethereum) {
      setWeb3(new Web3(window.ethereum));
    }
  }, [user]);

  const fetchBalance = async (walletAddress) => {
    try {
      const balanceData = await getWalletBalance(walletAddress);
      if (balanceData.success) {
        setBalance(balanceData.balance);
      } else {
        console.error("Error fetching balance:", balanceData.message || "Unknown error");
        setBalance("Failed to fetch balance");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("Failed to fetch balance");
    }
  };

  const handleTabChange = (event, newTab) => {
    setCurrentTab(newTab);
  };

  if (!user) {
    return <Typography variant="h6" color="error">Unauthorized Access</Typography>;
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>Profile</Typography>
        <Typography variant="h6">Account ID: {accountId}</Typography>
        <Typography variant="h6">Username: {user.username}</Typography>
        <Typography variant="h6">Email: {user.email}</Typography>
        <Typography variant="h6">Wallet Address: {walletAddress}</Typography>
        <Typography variant="h6">Balance: {balance} ETH</Typography>
      </Paper>

      <Box sx={{ width: "100%", marginTop: 4 }}>
        <Tabs value={currentTab} onChange={handleTabChange} centered>
          <Tab label="NFT Collection" value="NFT Collection" />
          <Tab label="Balance Sender" value="Balance Sender" />
          <Tab label="Create NFT" value="Create NFT" />
        </Tabs>
      </Box>

      {currentTab === "NFT Collection" && <NFTCollectionTab />}
      {currentTab === "Balance Sender" && (
        <BalanceSenderTab
          walletAddress={walletAddress}
          web3={web3}
          fetchBalance={fetchBalance}
          balance={balance}
        />
      )}
      {currentTab === "Create NFT" && (
        <CreateNFTTab walletAddress={walletAddress} web3={web3} />
      )}

      <Button
        variant="contained"
        color="error"
        sx={{ marginTop: 3 }}
        onClick={() => {
          dispatch({ type: "LOGOUT" });
          navigate("/home");
        }}
      >
        Logout
      </Button>
    </Container>
  );
};

export default Profile;