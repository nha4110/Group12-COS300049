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
  const accountId = user?.accountId || user?.account_id; // Use one consistent key, adjust based on your user object

  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("Loading...");
  const [currentTab, setCurrentTab] = useState("NFT Collection");
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    if (user) {
      const wallet = user.walletAddress || user.wallet_address; // Standardize this based on your user object
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
      console.log("Fetching balance for:", walletAddress); // Debug
      const balanceData = await getWalletBalance(walletAddress);
      console.log("API balance data:", balanceData); // Debug

      if (balanceData?.success) {
        // Assume balanceData.balance is in Wei or ETH, adjust based on your API
        const balanceInEth = web3?.utils?.fromWei(balanceData.balance, "ether") || balanceData.balance;
        setBalance(parseFloat(balanceInEth).toFixed(6)); // Format to 6 decimals
      } else {
        throw new Error(balanceData?.message || "API returned unsuccessful response");
      }
    } catch (error) {
      console.error("Error fetching balance via API:", error.message);
      if (web3) {
        try {
          const balanceWei = await web3.eth.getBalance(walletAddress);
          const balanceEth = web3.utils.fromWei(balanceWei, "ether");
          setBalance(parseFloat(balanceEth).toFixed(6));
        } catch (web3Error) {
          console.error("Error fetching balance via Web3:", web3Error);
          setBalance("Failed to fetch balance");
        }
      } else {
        setBalance("Failed to fetch balance: Web3 unavailable");
      }
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
        <Typography variant="h6">Account ID: {accountId || "Not set"}</Typography>
        <Typography variant="h6">Username: {user.username || "Not set"}</Typography>
        <Typography variant="h6">Email: {user.email || "Not set"}</Typography>
        <Typography variant="h6">Wallet Address: {walletAddress || "Not set"}</Typography>
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
          balance={balance} // Pass balance as prop
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
          localStorage.removeItem("user_wallet");
          localStorage.removeItem("username");
          navigate("/home");
        }}
      >
        Logout
      </Button>
    </Container>
  );
};

export default Profile;