{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useState, useEffect } from "react";
import { 
  Container, Button, Typography, Grid, CircularProgress, Box 
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../scripts/AuthContext"; // Auth context for user authentication state
import { fetchCollectionNFTs, mintNFT } from "../api/nftApi"; // API functions for fetching & minting NFTs
import { 
  checkConnection, loadNFTsFromCacheOrFetch, saveToCache, connectMetaMask 
} from "../scripts/nftUtils"; // Utility functions for NFT handling
import NFTCard from "../scripts/NFTCard"; // Component to display an NFT
import NFTDialog from "../scripts/NFTDialog"; // Dialog for NFT details & minting
import { motion } from "framer-motion"; // Animation library
import { Storefront } from "@mui/icons-material"; // Icon for market display

const Market = () => {
  const { collectionName } = useParams(); // Get the collection name from the URL
  const navigate = useNavigate();
  const { state } = useAuth(); // Get the authentication state

  // State variables
  const [nfts, setNfts] = useState([]); // NFTs currently being displayed
  const [allNfts, setAllNfts] = useState([]); // All NFTs in the collection
  const [account, setAccount] = useState(null); // User's MetaMask account
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [mintedStatus, setMintedStatus] = useState({}); // Track minted NFTs
  const [creator, setCreator] = useState(null); // Creator of the NFT collection
  const [totalNfts, setTotalNfts] = useState(0); // Total NFTs in collection
  const [selectedNFT, setSelectedNFT] = useState(null); // Selected NFT for dialog

  /**
   * Load NFTs when the component mounts or when the collection changes
   */
  useEffect(() => {
    // Check if MetaMask is connected
    checkConnection(setAccount);

    // Load NFTs from cache or fetch from API
    loadNFTsFromCacheOrFetch(
      collectionName, 
      setAllNfts, 
      setNfts, 
      setMintedStatus, 
      setTotalNfts, 
      setLoading, 
      () => fetchCollectionNFTs(
        collectionName, 
        setLoading, 
        setError, 
        setCreator, 
        setTotalNfts, 
        setNfts, 
        setAllNfts, 
        setMintedStatus, 
        (nftsData, mintedStatusData, totalNftsCount) => 
          saveToCache(collectionName, nftsData, mintedStatusData, totalNftsCount)
      )
    );
  }, [collectionName]);

  /**
   * Load all NFTs from the collection
   */
  const loadAllNFTs = () => {
    setNfts(allNfts);
  };

  /**
   * Open NFT details dialog
   */
  const handleCardClick = (nft) => {
    setSelectedNFT(nft);
  };

  /**
   * Handle minting an NFT
   */
  const handleMint = (tokenId) => {
    return mintNFT(
      tokenId, 
      account, 
      creator, 
      collectionName, 
      navigate, 
      setMintedStatus, 
      setNfts, 
      setAllNfts, 
      (nftsData, mintedStatusData, totalNftsCount) =>
        saveToCache(collectionName, nftsData, mintedStatusData, totalNftsCount)
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 4 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        
        {/* Header Section */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #6e8efb, #a777e3)",
            borderRadius: 3,
            p: 4,
            textAlign: "center",
            color: "white",
            mb: 4,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Collection Title */}
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}
          >
            <Storefront /> {collectionName} Collection
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Discover and mint unique NFTs from this collection.
          </Typography>

          {/* MetaMask Connection & Refresh Button */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            {!account ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => connectMetaMask(setAccount)}
                sx={{ borderRadius: 2 }}
              >
                Connect MetaMask
              </Button>
            ) : (
              <Typography variant="body1" sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", p: 1, borderRadius: 1 }}>
                Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </Typography>
            )}
            <Button
              variant="outlined"
              sx={{ color: "white", borderColor: "white", "&:hover": { borderColor: "#dcdcdc", bgcolor: "rgba(255, 255, 255, 0.1)" }, borderRadius: 2 }}
              onClick={() =>
                fetchCollectionNFTs(collectionName, setLoading, setError, setCreator, setTotalNfts, setNfts, setAllNfts, setMintedStatus, (nftsData, mintedStatusData, totalNftsCount) =>
                  saveToCache(collectionName, nftsData, mintedStatusData, totalNftsCount)
                )
              }
            >
              Refresh NFTs
            </Button>
          </Box>
        </Box>

        {/* NFT Listing */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            {error}
          </Typography>
        ) : nfts.length === 0 ? (
          <Typography align="center" sx={{ color: "#7f8c8d", fontSize: "1.2rem" }}>
            No available NFTs in this collection.
          </Typography>
        ) : (
          <>
            {/* NFT Cards Grid */}
            <Grid container spacing={4}>
              {nfts.map((nft) => (
                <NFTCard key={nft.id} nft={nft} onClick={() => handleCardClick(nft)} />
              ))}
            </Grid>

            {/* Load More Button */}
            {nfts.length < allNfts.length && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={loadAllNFTs}
                  sx={{
                    background: "linear-gradient(90deg, #6e8efb, #a777e3)",
                    "&:hover": { background: "linear-gradient(90deg, #5d78e6, #9366d2)" },
                    borderRadius: 2,
                    py: 1.5,
                  }}
                >
                  Load All ({allNfts.length - nfts.length} remaining)
                </Button>
              </Box>
            )}
          </>
        )}

        {/* NFT Details Dialog */}
        {selectedNFT && (
          <NFTDialog
            open={!!selectedNFT}
            onClose={() => setSelectedNFT(null)}
            nft={selectedNFT}
            account={account}
            creator={creator}
            collectionName={collectionName}
            mintNFT={handleMint}
            mintedStatus={mintedStatus}
          />
        )}
      </motion.div>
    </Container>
  );
};

export default Market;
