import React, { useState, useEffect } from "react";
import { Container, Button, Typography, CardMedia, Grid, Card, CardContent, CircularProgress, Box } from "@mui/material";
import { ethers } from "ethers";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import contractData from "../../../backend/build/contracts/MyNFT.json";
import { useAuth } from "../scripts/AuthContext";

const CONTRACT_ADDRESS = "0x84643357E0de364Acc9659021A1920362e1255D5";
const ABI = contractData.abi;
const PINATA_GATEWAY = "https://gray-magic-tortoise-619.mypinata.cloud/ipfs/";
const BACKEND_URL = "http://localhost:8081";
const CACHE_KEY = "market_nft_cache";

const Market = () => {
  const { collectionName } = useParams();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [nfts, setNfts] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mintedStatus, setMintedStatus] = useState({});
  const [creator, setCreator] = useState(null);
  const [totalNfts, setTotalNfts] = useState(0);
  const [loadedCount, setLoadedCount] = useState(20); // Initial load limit

  useEffect(() => {
    checkConnection();
    loadNFTsFromCacheOrFetch();
  }, [collectionName]);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const loadNFTsFromCacheOrFetch = () => {
    const cachedData = localStorage.getItem(`${CACHE_KEY}_${collectionName}`);
    if (cachedData) {
      const { nfts, mintedStatus, totalNfts, timestamp } = JSON.parse(cachedData);
      const cacheAge = Date.now() - timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 1 day
      if (cacheAge < maxAge) {
        setNfts(nfts.slice(0, Math.min(loadedCount, nfts.length)));
        setMintedStatus(mintedStatus);
        setTotalNfts(totalNfts);
        setLoading(false);
        return;
      }
    }
    fetchCollectionNFTs();
  };

  const saveToCache = (nftsData, mintedStatusData, totalNftsCount) => {
    const cacheData = {
      nfts: nftsData,
      mintedStatus: mintedStatusData,
      totalNfts: totalNftsCount,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_KEY}_${collectionName}`, JSON.stringify(cacheData));
  };

  const fetchCollectionNFTs = async (loadAll = false) => {
    setLoading(true);
    setError(null);
    try {
      const collectionResponse = await axios.get(`${BACKEND_URL}/api/collections/${collectionName}`);
      const { token_id_start, creator, base_cid, nft_count } = collectionResponse.data;
      setCreator(creator);
      setTotalNfts(nft_count);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      const nftsData = [];
      const newMintedStatus = {};
      const limit = loadAll ? nft_count : Math.min(20, nft_count);

      for (let i = 0; i < nft_count; i++) {
        const tokenId = token_id_start + i;
        try {
          const metadataUrl = `${PINATA_GATEWAY}${base_cid}/${tokenId}.json`;
          const imageUrl = `${PINATA_GATEWAY}${base_cid}/${tokenId}.png`;
          const response = await axios.get(metadataUrl, { timeout: 10000 });
          const isMintedOnChain = await contract.isMinted(tokenId);

          let isOwned = false;
          try {
            const ownershipResponse = await axios.get(`${BACKEND_URL}/check-nft-ownership/${tokenId}`);
            isOwned = ownershipResponse.data.isOwned;
          } catch (ownershipError) {
            console.warn(`Ownership check failed for ${tokenId}:`, ownershipError.message);
          }

          newMintedStatus[tokenId] = isMintedOnChain || isOwned;

          const nftData = {
            id: tokenId,
            name: response.data.name || `NFT ${tokenId}`,
            description: response.data.description || "No description.",
            image: imageUrl,
            metadata: response.data,
            isMinted: isMintedOnChain || isOwned,
          };

          nftsData.push(nftData);
          if (i < limit) setNfts((prev) => [...prev.filter((nft) => nft.id !== tokenId), nftData]);
        } catch (error) {
          console.warn(`Failed to fetch NFT ${tokenId}:`, error.message);
          if (i >= limit) continue; // Skip errors after initial load
          break; // Stop if initial load fails
        }
      }

      saveToCache(nftsData, newMintedStatus, nft_count);
      setMintedStatus(newMintedStatus);
      setLoadedCount(limit);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setError("Failed to load NFTs for this collection.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreNFTs = () => {
    fetchCollectionNFTs(true); // Load all remaining NFTs
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

  const mintNFT = async (tokenId) => {
    if (!account) return alert("Connect MetaMask first.");
    if (account.toLowerCase() === creator?.toLowerCase()) {
      return alert("Creators cannot buy their own NFTs.");
    }
  
    const token = localStorage.getItem("jwtToken");
    console.log("JWT Token:", token);
    if (!token) {
      alert("Please log in to mint NFTs.");
      navigate("/login");
      return;
    }
  
    try {
      const ownershipResponse = await axios.get(`${BACKEND_URL}/check-nft-ownership/${tokenId}`);
      if (ownershipResponse.data.isOwned) {
        alert("This NFT is already owned.");
        return;
      }
  
      const collectionResponse = await axios.get(`${BACKEND_URL}/api/collections/${collectionName}`);
      const { base_cid } = collectionResponse.data;
  
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  
      const metadataURI = `${PINATA_GATEWAY}${base_cid}/${tokenId}.json`;
      console.log("Minting parameters:", { account, metadataURI, tokenId, value: "0.05 ETH" });
  
      // Check account balance
      const balance = await provider.getBalance(account);
      console.log("Account balance:", ethers.formatEther(balance), "ETH");
      if (balance < ethers.parseEther("0.06")) { // 0.05 ETH + gas buffer
        alert("Insufficient ETH balance. Need at least 0.06 ETH for minting and gas.");
        return;
      }
  
      // Check if token is minted
      const isMinted = await contract.isMinted(tokenId);
      console.log(`Token ${tokenId} minted?`, isMinted);
      if (isMinted) {
        alert(`Token ${tokenId} is already minted.`);
        return;
      }
  
      // Check if URI is used
      const isUriOwned = await contract.isContentOwned(metadataURI);
      console.log(`URI ${metadataURI} owned?`, isUriOwned);
      if (isUriOwned) {
        alert(`Metadata URI ${metadataURI} is already used.`);
        return;
      }
  
      // Estimate gas
      const gasEstimate = await contract.payToMint.estimateGas(account, metadataURI, tokenId, {
        value: ethers.parseEther("0.05"),
      });
      console.log("Gas estimate:", gasEstimate.toString());
  
      // Execute transaction
      const tx = await contract.payToMint(account, metadataURI, tokenId, {
        value: ethers.parseEther("0.05"),
        gasLimit: gasEstimate.mul(120).div(100), // 20% buffer
      });
  
      alert("Transaction submitted. Waiting for confirmation...");
      const receipt = await tx.wait();
  
      const gasUsed = receipt.gasUsed || BigInt(0);
      const effectiveGasPrice = receipt.effectiveGasPrice || BigInt(0);
      const totalGasFeeWei = gasUsed * effectiveGasPrice;
      const totalGasFeeEth = ethers.formatEther(totalGasFeeWei);
  
      const txDetails = {
        txHash: receipt.hash,
        from: receipt.from,
        to: CONTRACT_ADDRESS,
        amount: "-0.05 ETH",
        gasUsed: gasUsed.toString(),
        totalGasFee: totalGasFeeEth,
      };
  
      const metadataUrl = `${PINATA_GATEWAY}${base_cid}/${tokenId}.json`;
      const metadataResponse = await axios.get(metadataUrl);
      const nftName = metadataResponse.data.name || `NFT ${tokenId}`;
      const imageUrl = `${PINATA_GATEWAY}${base_cid}/${tokenId}.png`;
  
      const payload = {
        walletAddress: account,
        nftId: tokenId,
        nftName,
        price: "0.05",
        tokenID: tokenId,
        contractAddress: CONTRACT_ADDRESS,
        imageUrl,
        category: collectionName,
        txHash: txDetails.txHash,
        creator: creator || null,
      };
  
      console.log("Sending payload to /buy-nft:", payload);
      const buyResponse = await axios.post(`${BACKEND_URL}/buy-nft`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch((error) => {
        if (error.response?.status === 401) {
          alert("Session expired or invalid token. Please log in again.");
          localStorage.removeItem("jwtToken");
          navigate("/login");
          throw new Error("Unauthorized");
        }
        throw error;
      });
  
      if (!buyResponse.data.success) {
        throw new Error(`Failed to record NFT purchase: ${buyResponse.data.message}`);
      }
  
      if (creator) {
        await signer.sendTransaction({
          to: creator,
          value: ethers.parseEther("0.05"),
        });
      }
  
      setMintedStatus((prev) => ({ ...prev, [tokenId]: true }));
      setNfts((prev) => prev.filter((nft) => nft.id !== tokenId));
      const cachedData = JSON.parse(localStorage.getItem(`${CACHE_KEY}_${collectionName}`));
      if (cachedData) {
        cachedData.nfts = cachedData.nfts.filter((nft) => nft.id !== tokenId);
        cachedData.mintedStatus[tokenId] = true;
        saveToCache(cachedData.nfts, cachedData.mintedStatus, cachedData.totalNfts);
      }
      alert("NFT minted and recorded successfully!");
      window.dispatchEvent(new Event("balanceUpdated"));
    } catch (error) {
      console.error("Minting error:", error);
      if (error.code === "CALL_EXCEPTION" && !error.data) {
        alert("Minting failed: Transaction reverted. Check token ID, URI, or funds.");
      } else {
        alert(`Minting failed: ${error.message || "Unknown error"}`);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {collectionName} Collection
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {!account ? (
            <Button variant="contained" onClick={connectMetaMask}>
              Connect MetaMask
            </Button>
          ) : (
            <Typography variant="body1">
              Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </Typography>
          )}
          <Button variant="outlined" onClick={() => fetchCollectionNFTs()}>
            Refresh NFTs
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
      ) : nfts.length === 0 ? (
        <Typography align="center">No available NFTs in this collection.</Typography>
      ) : (
        <>
          <Grid container spacing={4}>
            {nfts.map((nft) => (
              <Grid item key={nft.id} xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <Box sx={{ position: "relative", pt: "100%" }}>
                    <CardMedia
                      component="img"
                      image={nft.image}
                      alt={nft.name}
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
                      {nft.name}
                    </Typography>
                    <Typography>{nft.description}</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Token ID: {nft.id}
                      </Typography>
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => mintNFT(nft.id)}
                      disabled={!account || mintedStatus[nft.id]}
                    >
                      {mintedStatus[nft.id] ? "Minted/Owned" : "Mint NFT (0.05 ETH)"}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          {loadedCount < totalNfts && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button variant="contained" onClick={loadMoreNFTs}>
                Load More ({totalNfts - loadedCount} remaining)
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Market;