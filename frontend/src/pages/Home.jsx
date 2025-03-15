import React, { useState, useEffect } from "react";
import { Container, Button, Typography, CardMedia, Grid, Card, CardContent, CircularProgress, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = "http://localhost:8081";
const PINATA_GATEWAY = "https://gray-magic-tortoise-619.mypinata.cloud/ipfs/";

const Home = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [account, setAccount] = useState(null); // MetaMask account
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInWallet, setLoggedInWallet] = useState(null); // Local storage wallet

  useEffect(() => {
    // Check localStorage for wallet_address
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
            console.warn("MetaMask account differs from logged-in wallet:", accounts[0], loggedInWallet);
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
      const fetchedCollections = response.data.map((col) => {
        const folderPath = `${PINATA_GATEWAY}${col.base_cid}/${col.category}/1.png`;
        const flatPath = `${PINATA_GATEWAY}${col.base_cid}/1.png`;
        return {
          name: col.category,
          firstImage: folderPath,
          flatImage: flatPath,
          tokenIdStart: col.token_id_start,
          nftCount: col.nft_count,
        };
      });
      setCollections(fetchedCollections);
      if (fetchedCollections.length === 0) {
        setError("No collections found in the database.");
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
    if (e.target.src !== collection.flatImage) {
      e.target.src = collection.flatImage;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          NFT Collections
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mb: 2 }}>
          {loggedInWallet ? (
            <Typography variant="body1">
              Logged in as: {loggedInWallet.substring(0, 6)}...{loggedInWallet.substring(loggedInWallet.length - 4)}
            </Typography>
          ) : (
            <Typography variant="body1" color="error">
              Not logged in. Please log in to access all features.
            </Typography>
          )}
          {!account ? (
            <Button variant="contained" onClick={connectMetaMask}>
              Connect MetaMask
            </Button>
          ) : (
            <Typography variant="body2">
              MetaMask: {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </Typography>
          )}
          <Button variant="outlined" onClick={fetchCollections}>
            Refresh Collections
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : collections.length === 0 ? (
        <Typography align="center">No collections available.</Typography>
      ) : (
        <Grid container spacing={4}>
          {collections.map((collection) => (
            <Grid item key={collection.name} xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{ height: "100%", display: "flex", flexDirection: "column", cursor: "pointer" }}
                onClick={() => navigate(`/market/${collection.name}`)}
              >
                <Box sx={{ position: "relative", pt: "100%" }}>
                  <CardMedia
                    component="img"
                    image={collection.firstImage}
                    alt={collection.name}
                    onError={(e) => handleImageError(collection, e)}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
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
