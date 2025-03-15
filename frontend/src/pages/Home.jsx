import React, { useState, useEffect } from "react";
import { 
  Container, Button, Typography, Grid, Card, CardMedia, CardContent, 
  CircularProgress, Box, Paper, Avatar, Divider 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import WalletIcon from "@mui/icons-material/AccountBalanceWallet";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CollectionsIcon from "@mui/icons-material/Collections";

const BACKEND_URL = "http://localhost:8081";
const PINATA_GATEWAY = "https://gray-magic-tortoise-619.mypinata.cloud/ipfs/";

const Home = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [account, setAccount] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInWallet, setLoggedInWallet] = useState(null);

  useEffect(() => {
    const wallet = localStorage.getItem("wallet_address");
    setLoggedInWallet(wallet);

    checkConnection();
    fetchCollections();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (loggedInWallet && accounts[0].toLowerCase() !== loggedInWallet.toLowerCase()) {
            console.warn("Different MetaMask account detected:", accounts[0]);
          }
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(`${BACKEND_URL}/api/collections`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      console.log("Collections response:", response.data);
      const fetchedCollections = response.data.map((col) => ({
        name: col.category,
        firstImage: `${PINATA_GATEWAY}${col.base_cid}/${col.category}/1.png`,
        fallbackImage: `${PINATA_GATEWAY}${col.base_cid}/1.png`,
        tokenIdStart: col.token_id_start,
        nftCount: col.nft_count,
      }));
      setCollections(fetchedCollections);
      if (fetchedCollections.length === 0) {
        setError("No collections found.");
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      setError(`Failed to load collections: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) return alert("MetaMask not detected!");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("MetaMask connection error:", error);
      alert("Failed to connect to MetaMask.");
    }
  };

  const handleImageError = (collection, e) => {
    if (e.target.src !== collection.fallbackImage) {
      e.target.src = collection.fallbackImage;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      {/* Large Introduction Box */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 5, 
          textAlign: "center", 
          bgcolor: "#E0F7FA", // Light blue
          color: "black", 
          borderRadius: 3 
        }}
      >
        <Typography variant="h3" gutterBottom>
          <CollectionsIcon sx={{ fontSize: 40, verticalAlign: "middle" }} /> Welcome to Our NFT Marketplace
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: "80%", mx: "auto", mt: 1 }}>
          Explore unique digital assets, discover amazing collections, and trade NFTs securely.
        </Typography>
      </Paper>

      {/* Wallet Connection Section */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4, mb: 4 }}>
        {loggedInWallet ? (
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "secondary.main" }}>
              <WalletIcon />
            </Avatar>
            <Typography variant="body1">
              Logged in as: {loggedInWallet.substring(0, 6)}...{loggedInWallet.substring(loggedInWallet.length - 4)}
            </Typography>
          </Paper>
        ) : (
          <Typography variant="body1" color="error">
            <ErrorOutlineIcon sx={{ verticalAlign: "middle" }} /> Not logged in. Please log in to access features.
          </Typography>
        )}
        
        {!account ? (
          <Button variant="contained" sx={{ mt: 2 }} onClick={connectMetaMask} startIcon={<WalletIcon />}>
            Connect MetaMask
          </Button>
        ) : (
          <Typography variant="body2" sx={{ mt: 2 }}>
            MetaMask: {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </Typography>
        )}

        <Button variant="outlined" sx={{ mt: 2 }} onClick={fetchCollections} startIcon={<RefreshIcon />}>
          Refresh Collections
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Collection Display */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          <ErrorOutlineIcon sx={{ verticalAlign: "middle" }} /> {error}
        </Typography>
      ) : collections.length === 0 ? (
        <Typography align="center">No collections available.</Typography>
      ) : (
        <Grid container spacing={4} sx={{ mt: 3 }}>
          {collections.map((collection) => (
            <Grid item key={collection.name} xs={12} sm={6} md={4} lg={3}>
              <Card 
                sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3, boxShadow: 3, transition: "transform 0.2s", "&:hover": { transform: "scale(1.05)" } }}
                onClick={() => navigate(`/market/${collection.name}`)}
              >
                <CardMedia
                  component="img"
                  image={collection.firstImage}
                  alt={collection.name}
                  onError={(e) => handleImageError(collection, e)}
                  sx={{ height: 200, objectFit: "cover", borderRadius: "8px 8px 0 0" }}
                />
                <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {collection.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {collection.nftCount} NFTs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Home;