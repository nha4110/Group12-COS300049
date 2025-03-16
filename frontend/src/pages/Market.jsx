{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useState, useEffect } from "react";
import { Container, Button, Typography, Grid, CircularProgress, Box } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../scripts/AuthContext";
import { fetchCollectionNFTs, mintNFT } from "../api/nftApi";
import { checkConnection, loadNFTsFromCacheOrFetch, saveToCache, connectMetaMask } from "../scripts/nftUtils";
import NFTCard from "../scripts/NFTCard";
import NFTDialog from "../scripts/NFTDialog";
import { motion } from "framer-motion"; // For animations
import { Storefront } from "@mui/icons-material"; // Icon for market

const Market = () => {
  const { collectionName } = useParams();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [nfts, setNfts] = useState([]);
  const [allNfts, setAllNfts] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mintedStatus, setMintedStatus] = useState({});
  const [creator, setCreator] = useState(null);
  const [totalNfts, setTotalNfts] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState(null);

  useEffect(() => {
    checkConnection(setAccount);
    loadNFTsFromCacheOrFetch(collectionName, setAllNfts, setNfts, setMintedStatus, setTotalNfts, setLoading, () =>
      fetchCollectionNFTs(collectionName, setLoading, setError, setCreator, setTotalNfts, setNfts, setAllNfts, setMintedStatus, (nftsData, mintedStatusData, totalNftsCount) =>
        saveToCache(collectionName, nftsData, mintedStatusData, totalNftsCount)
      )
    );
  }, [collectionName]);

  const loadAllNFTs = () => {
    setNfts(allNfts);
  };

  const handleCardClick = (nft) => {
    setSelectedNFT(nft);
  };

  const handleMint = (tokenId) => {
    return mintNFT(tokenId, account, creator, collectionName, navigate, setMintedStatus, setNfts, setAllNfts, (nftsData, mintedStatusData, totalNftsCount) =>
      saveToCache(collectionName, nftsData, mintedStatusData, totalNftsCount)
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 4 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
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
            <Grid container spacing={4}>
              {nfts.map((nft) => (
                <NFTCard key={nft.id} nft={nft} onClick={() => handleCardClick(nft)} />
              ))}
            </Grid>
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