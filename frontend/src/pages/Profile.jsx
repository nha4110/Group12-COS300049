{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useState, useEffect } from "react";
import { Container, Typography, Paper, Tabs, Tab, Box, Avatar } from "@mui/material";
import { motion } from "framer-motion"; // For animations
import { getWalletBalance } from "../api/wallet"; // API call to fetch wallet balance
import { useAuth } from "../scripts/AuthContext"; // Authentication context
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers"; // Ethereum library
import NFTCollectionTab from "../component/NFTCollectionTab";
import BalanceSenderTab from "../component/BalanceSenderTab";
import CreateNFTTab from "../component/CreateNFTTab";
import { AccountCircle, Collections, Send, AddCircle } from "@mui/icons-material"; // Icons

const Profile = () => {
  const { state } = useAuth(); // Get authenticated user state
  const navigate = useNavigate();
  const user = state.user;
  const accountId = user?.accountId || user?.account_id;

  // State variables
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("Loading...");
  const [currentTab, setCurrentTab] = useState("NFT Collection");
  const [provider, setProvider] = useState(null);

  // Initialize provider and request wallet connection
  useEffect(() => {
    const initializeProvider = async () => {
      let ethProvider;
      if (window.ethereum) {
        ethProvider = new ethers.BrowserProvider(window.ethereum);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
          console.error("User denied account access:", error);
        }
      } else {
        console.warn("No injected provider found, falling back to Ganache");
        ethProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      }
      setProvider(ethProvider);
    };

    initializeProvider();

    // If user has a wallet address, fetch balance
    if (user) {
      const wallet = user.walletAddress || user.wallet_address;
      if (wallet) {
        setWalletAddress(wallet);
        fetchBalance(wallet);
      } else {
        setBalance("No wallet address available");
      }
    }
  }, [user]);

  // Fetch balance when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchBalance(walletAddress);
    }
  }, [walletAddress]);

  // Fetch wallet balance from API or blockchain provider
  const fetchBalance = async (walletAddress) => {
    if (!walletAddress) {
      setBalance("Invalid wallet address");
      return;
    }
    try {
      console.log("Fetching balance for:", walletAddress);
      const balanceData = await getWalletBalance(walletAddress);
      console.log("API balance data:", balanceData);
      if (balanceData?.success) {
        setBalance(parseFloat(balanceData.balance).toFixed(6));
      } else {
        throw new Error(balanceData?.message || "API returned unsuccessful response");
      }
    } catch (error) {
      console.error("Error fetching balance via API:", error.message);
      if (provider) {
        try {
          const balanceWei = await provider.getBalance(walletAddress);
          const balanceEth = ethers.formatEther(balanceWei);
          setBalance(parseFloat(balanceEth).toFixed(6));
        } catch (providerError) {
          console.error("Error fetching balance via provider:", providerError);
          setBalance("Failed to fetch balance");
        }
      } else {
        setBalance("Failed to fetch balance: Provider unavailable");
      }
    }
  };

  // Handle tab change
  const handleTabChange = (event, newTab) => {
    setCurrentTab(newTab);
    if (newTab === "Balance Sender") {
      fetchBalance(walletAddress);
    }
  };

  // If user is not authenticated, show an error message
  if (!user) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="error">
          Unauthorized Access
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 4 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        {/* Profile Card */}
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #ffffff, #f0f4ff)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
          }}
        >
          {/* User Avatar */}
          <Avatar
            sx={{
              bgcolor: "#6e8efb",
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
              fontSize: 36,
            }}
          >
            {user.username?.charAt(0).toUpperCase() || "U"}
          </Avatar>

          {/* Username */}
          <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold", color: "#2c3e50" }}>
            {user.username || "User Profile"}
          </Typography>

          {/* User Details */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ color: "#34495e" }}>
              <strong>Account ID:</strong> {accountId || "Not set"}
            </Typography>
            <Typography variant="body1" sx={{ color: "#34495e" }}>
              <strong>Email:</strong> {user.email || "Not set"}
            </Typography>
            <Typography variant="body1" sx={{ color: "#34495e" }}>
              <strong>Wallet Address:</strong> {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4) || "Not set"}
            </Typography>

            {/* Wallet Balance */}
            <Typography variant="h5" sx={{ mt: 2, color: "#27ae60", fontWeight: "bold" }}>
              Balance: {balance} ETH
            </Typography>
          </Box>
        </Paper>

        {/* Navigation Tabs */}
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          centered
          sx={{
            mt: 4,
            bgcolor: "#ffffff",
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "1.1rem",
              color: "#7f8c8d",
              "&.Mui-selected": {
                color: "#6e8efb",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#6e8efb",
              height: 3,
            },
          }}
        >
          <Tab label="NFT Collection" value="NFT Collection" icon={<Collections />} iconPosition="start" />
          <Tab label="Send ETH" value="Balance Sender" icon={<Send />} iconPosition="start" />
          <Tab label="Create NFT" value="Create NFT" icon={<AddCircle />} iconPosition="start" />
        </Tabs>

        {/* Display selected tab content */}
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mt: 3 }}>
            {currentTab === "NFT Collection" && <NFTCollectionTab />}
            {currentTab === "Balance Sender" && (
              <BalanceSenderTab walletAddress={walletAddress} provider={provider} fetchBalance={fetchBalance} balance={balance} />
            )}
            {currentTab === "Create NFT" && <CreateNFTTab walletAddress={walletAddress} provider={provider} />}
          </Box>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default Profile;
