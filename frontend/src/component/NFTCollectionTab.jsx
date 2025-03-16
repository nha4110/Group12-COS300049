{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useState, useEffect } from "react"; // React hooks for state and lifecycle management
import { Paper, Typography, Grid, Card, CardMedia, CardContent, Box, CircularProgress } from "@mui/material"; // Material-UI components
import axios from "axios"; // HTTP client for API requests
import { useAuth } from "../scripts/AuthContext"; // Custom hook for authentication context

const BACKEND_URL = "http://localhost:8081"; // Backend API base URL

const NFTCollectionTab = () => {
  const { state } = useAuth(); // Access authentication state
  const [nfts, setNfts] = useState([]); // State for storing NFT collection
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to store error messages
  const walletAddress = state?.user?.wallet_address; // User's wallet address from auth state

  // Fetch NFTs when component mounts or walletAddress changes
  useEffect(() => {
    const fetchNFTs = async () => {
      if (!walletAddress) {
        setError("Please log in to view your NFT collection."); // Check if user is logged in
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BACKEND_URL}/assets/${walletAddress}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`, // Include JWT token in headers
          },
        });

        if (response.data.success) {
          setNfts(response.data.assets); // Update NFTs state with fetched data
        } else {
          setError("Failed to fetch NFT collection."); // Set error if API call fails
        }
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setError("Error loading your NFT collection. Please try again later."); // Handle network or other errors
      } finally {
        setLoading(false); // Stop loading regardless of outcome
      }
    };

    fetchNFTs();
  }, [walletAddress]);

  // Display loading state
  if (loading) {
    return (
      <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
        <Typography variant="h6" gutterBottom>
          NFT Collection {/* Title */}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress /> {/* Loading spinner */}
        </Box>
      </Paper>
    );
  }

  // Display error state
  if (error) {
    return (
      <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
        <Typography variant="h6" gutterBottom>
          NFT Collection {/* Title */}
        </Typography>
        <Typography color="error">{error}</Typography> {/* Error message */}
      </Paper>
    );
  }

  // Display NFT collection
  return (
    <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
      <Typography variant="h6" gutterBottom>
        NFT Collection {/* Title */}
      </Typography>
      {nfts.length === 0 ? (
        <Typography>You don’t own any NFTs yet.</Typography> // Message if no NFTs are owned
      ) : (
        <Grid container spacing={4}>
          {nfts.map((nft) => (
            <Grid item key={nft.asset_id} xs={12} sm={6} md={4}> {/* Grid item for each NFT */}
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Box sx={{ position: "relative", pt: "100%" }}>
                  <CardMedia
                    component="img"
                    image={nft.image_url} // Full URL from backend
                    alt={nft.nft_name}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain", // Ensure image fits within bounds
                    }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400?text=Image+Not+Found"; // Fallback image on error
                      e.target.onerror = null; // Prevent infinite loop
                    }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {nft.nft_name} {/* NFT name */}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Token ID: {nft.token_id} {/* Token ID */}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Price: {nft.price_eth} ETH {/* Price in ETH */}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Category: {nft.category} {/* NFT category */}
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
