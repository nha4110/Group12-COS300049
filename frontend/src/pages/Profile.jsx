import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  Box,
  Divider,
} from "@mui/material";
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
  const accountId = user?.accountId || user?.account_id;

  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("Loading...");
  const [currentTab, setCurrentTab] = useState(0);
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    if (user) {
      const wallet = user.walletAddress || user.wallet_address;
      if (wallet) {
        setWalletAddress(wallet);
        fetchBalance(wallet);
      } else {
        setBalance("No wallet address available");
      }
    }
    if (window.ethereum) {
      setWeb3(new Web3(window.ethereum));
    }
  }, [user]);

  const fetchBalance = async (walletAddress) => {
    if (!walletAddress) {
      setBalance("Invalid wallet address");
      return;
    }

    try {
      const balanceData = await getWalletBalance(walletAddress);
      if (balanceData?.success) {
        const balanceInEth = web3?.utils?.fromWei(balanceData.balance, "ether") || balanceData.balance;
        setBalance(parseFloat(balanceInEth).toFixed(6));
      } else {
        throw new Error(balanceData?.message || "API error");
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
    return (
      <Container maxWidth="sm">
        <Typography variant="h6" color="error" align="center">
          Unauthorized Access
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      {/* Profile Details */}
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />
        <Box sx={{ textAlign: "left", paddingLeft: 2 }}>
          <Typography variant="body1">
            <strong>Account ID:</strong> {accountId || "Not set"}
          </Typography>
          <Typography variant="body1">
            <strong>Username:</strong> {user.username || "Not set"}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {user.email || "Not set"}
          </Typography>
          <Typography variant="body1">
            <strong>Wallet Address:</strong> {walletAddress || "Not set"}
          </Typography>
          <Typography variant="body1">
            <strong>Balance:</strong> {balance} ETH
          </Typography>
        </Box>
      </Paper>

      {/* Tab Navigation */}
      <Box sx={{ width: "100%", marginTop: 4 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          centered
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="NFT Collection" />
          <Tab label="Send ETH" />
          <Tab label="Create NFT" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ marginTop: 2 }}>
        {currentTab === 0 && <NFTCollectionTab />}
        {currentTab === 1 && (
          <BalanceSenderTab
            walletAddress={walletAddress}
            web3={web3}
            fetchBalance={fetchBalance}
            balance={balance}
          />
        )}
        {currentTab === 2 && <CreateNFTTab walletAddress={walletAddress} web3={web3} />}
      </Box>

      {/* Logout Button */}
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            dispatch({ type: "LOGOUT" });
            localStorage.removeItem("user_wallet");
            localStorage.removeItem("username");
            navigate("/home");
          }}
        >
          Logout
        </Button>
      </Box>
    </Container>
  );
};

export default Profile;
