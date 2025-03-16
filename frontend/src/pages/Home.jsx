{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useState, useEffect } from "react";
import { 
  Container, Button, Typography, Grid, CircularProgress, Box, TextField, 
  MenuItem, Select, InputLabel, FormControl 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // For animations
import { loadCollectionsFromCacheOrFetch, fetchCollections } from "../api/collectionApi";
import { checkConnection, handleAccountsChanged, connectMetaMask } from "../scripts/walletUtils";
import CollectionCard from "../scripts/CollectionCard";

const Home = () => {
  const navigate = useNavigate();
  
  // State variables for managing collections, user account, and UI states
  const [collections, setCollections] = useState([]); // Stores NFT collections
  const [account, setAccount] = useState(null); // Stores connected wallet address
  const [loading, setLoading] = useState(true); // Loading state for fetching collections
  const [error, setError] = useState(null); // Stores error messages if any
  const [loggedInWallet, setLoggedInWallet] = useState(localStorage.getItem("wallet_address")); // Retrieves stored wallet address
  const [walletMismatch, setWalletMismatch] = useState(false); // Indicates if wallet addresses don't match
  const [searchQuery, setSearchQuery] = useState(""); // Stores user search input
  const [sortOption, setSortOption] = useState("a-z"); // Sorting option for collections

  useEffect(() => {
    // Check if a wallet is connected and verify wallet addresses
    checkConnection(setAccount, loggedInWallet, setWalletMismatch);

    // Load NFT collections from cache or fetch fresh data
    loadCollectionsFromCacheOrFetch(setCollections, setLoading, () =>
      fetchCollections(setCollections, setLoading, setError)
    );

    // Listen for MetaMask account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) =>
        handleAccountsChanged(accounts, setAccount, loggedInWallet, setWalletMismatch, () =>
          loadCollectionsFromCacheOrFetch(setCollections, setLoading, () => fetchCollections(setCollections, setLoading, setError))
        )
      );
    }

    // Cleanup event listener on component unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, [loggedInWallet]); // Dependency array ensures effect runs when `loggedInWallet` changes

  // Fetches fresh collection data from API
  const resetCollections = () => {
    fetchCollections(setCollections, setLoading, setError);
  };

  // Filter and sort collections based on search query and selected sorting option
  const filteredCollections = collections
    .filter((col) => col.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === "a-z") return a.name.localeCompare(b.name);
      if (sortOption === "z-a") return b.name.localeCompare(a.name);
      if (sortOption === "nft-count") return b.nftCount - a.nftCount;
      if (sortOption === "most-viewed") return (b.views || 0) - (a.views || 0);
      return 0;
    });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        
        {/* Hero Section */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #6e8efb, #a777e3)", // Gradient background
            borderRadius: 3,
            p: 4,
            textAlign: "center",
            color: "white",
            mb: 4,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", // Soft shadow effect
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Discover NFT Collections
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Explore a world of unique digital assets.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
            sx={{ mt: 2 }}
          >
            Explore Collections
          </Button>
        </Box>

        {/* Wallet Connection & Info Section */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mb: 4 }}>
          
          {/* Display logged-in wallet address */}
          {loggedInWallet ? (
            <Typography variant="body1">
              Logged in as: {loggedInWallet.substring(0, 6)}...{loggedInWallet.substring(loggedInWallet.length - 4)}
            </Typography>
          ) : (
            <Typography variant="body1" color="error">
              Not logged in. Please log in to access all features.
            </Typography>
          )}

          {/* MetaMask connection button */}
          {!account ? (
            <Button variant="contained" onClick={() => connectMetaMask(setAccount, loggedInWallet, setWalletMismatch)}>
              Connect MetaMask
            </Button>
          ) : (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2">
                <strong>Your MetaMask account:</strong> {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </Typography>

              {/* Warning message for mismatched wallet addresses */}
              {walletMismatch && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  <strong>Warning:</strong> Your MetaMask account doesn’t match your logged-in wallet. NFTs will be minted to your MetaMask account. Please switch accounts.
                </Typography>
              )}
            </Box>
          )}

          {/* Search and Sorting Options */}
          <Box sx={{ display: "flex", gap: 2, width: "100%", maxWidth: "600px", mt: 2 }}>
            {/* Search Field */}
            <TextField
              label="Search by name"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1 }}
            />

            {/* Sorting Dropdown */}
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Sort</InputLabel>
              <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)} label="Sort">
                <MenuItem value="a-z">A-Z</MenuItem>
                <MenuItem value="z-a">Z-A</MenuItem>
                <MenuItem value="nft-count">NFT Count</MenuItem>
                <MenuItem value="most-viewed">Most Viewed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Reset Collections Button */}
          <Button variant="outlined" onClick={resetCollections} sx={{ mt: 2 }}>
            Reset Collections
          </Button>
        </Box>

        {/* Display Collections or Loading/Error Messages */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : filteredCollections.length === 0 ? (
          <Typography align="center">No collections match your search.</Typography>
        ) : (
          <Grid container spacing={4}>
            {filteredCollections.map((collection) => (
              <Grid item key={collection.name} xs={12} sm={6} md={4} lg={3}>
                {/* Collection Card Component */}
                <CollectionCard collection={collection} onClick={() => navigate(`/market/${collection.name}`)} />
              </Grid>
            ))}
          </Grid>
        )}
      </motion.div>
    </Container>
  );
};

export default Home;

