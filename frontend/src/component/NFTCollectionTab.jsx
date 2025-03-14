import React, { useState, useEffect } from "react";
import { Paper, Typography, Grid, Card, CardMedia, CardContent, Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { useAuth } from "../scripts/AuthContext";

// Define PINATA_BASE_URL as in Home.jsx
const PINATA_BASE_URL = "https://gateway.pinata.cloud/ipfs/bafybeif7oettpy7l7j7pe4lpcqzr3hfum7dpd25q4yx5a3moh7x4ubfhqy";

const NFTCollectionTab = () => {
  const { state } = useAuth();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const walletAddress = state?.user?.wallet_address;

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!walletAddress) {
        setError("Please log in to view your NFT collection.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8081/assets/${walletAddress}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        });

        if (response.data.success) {
          setNfts(response.data.assets);
        } else {
          setError("Failed to fetch NFT collection.");
        }
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setError("Error loading your NFT collection. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [walletAddress]);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
        <Typography variant="h6" gutterBottom>
          NFT Collection
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
        <Typography variant="h6" gutterBottom>
          NFT Collection
        </Typography>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
      <Typography variant="h6" gutterBottom>
        NFT Collection
      </Typography>
      {nfts.length === 0 ? (
        <Typography>You don’t own any NFTs yet.</Typography>
      ) : (
        <Grid container spacing={4}>
          {nfts.map((nft) => (
            <Grid item key={nft.asset_id} xs={12} sm={6} md={4}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Box sx={{ position: "relative", pt: "100%" }}>
                  <CardMedia
                    component="img"
                    image={`${PINATA_BASE_URL}/${nft.image_url}`} // Now PINATA_BASE_URL is defined
                    alt={nft.nft_name}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400?text=Image+Not+Found";
                      e.target.onerror = null;
                    }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {nft.nft_name}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Token ID: {nft.token_id}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Price: {nft.price_eth} ETH
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default NFTCollectionTab;