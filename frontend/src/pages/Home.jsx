import React, { useState, useEffect } from "react";
import { Container, Button, Typography, CardMedia, Grid, Card, CardContent, CircularProgress, Box } from "@mui/material";
import { ethers } from "ethers";
import axios from "axios";
import contractData from "../../../backend/build/contracts/MyNFT.json";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../scripts/AuthContext";

const CONTRACT_ADDRESS = "0x84643357E0de364Acc9659021A1920362e1255D5";
const ABI = contractData.abi;
const PINATA_BASE_URL = "https://gateway.pinata.cloud/ipfs/bafybeif7oettpy7l7j7pe4lpcqzr3hfum7dpd25q4yx5a3moh7x4ubfhqy";
const BACKEND_URL = "http://localhost:8081";
const CACHE_KEY = "nft_cache"; // Key for localStorage

const Home = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [nfts, setNfts] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mintedStatus, setMintedStatus] = useState({});
  const [nftCount, setNftCount] = useState(0);

  useEffect(() => {
    checkConnection();
    loadNFTs();
  
    const handleCacheUpdate = () => fetchNFTs(); // Full refresh
    window.addEventListener("nftCacheUpdated", handleCacheUpdate);
    return () => window.removeEventListener("nftCacheUpdated", handleCacheUpdate);
  }, []);

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

  const loadNFTs = () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { nfts: cachedNfts, mintedStatus: cachedMintedStatus, timestamp } = JSON.parse(cachedData);
      // Optional: Check if cache is too old (e.g., > 1 day)
      const cacheAge = Date.now() - timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 1 day in ms
      if (cacheAge < maxAge) {
        setNfts(cachedNfts);
        setMintedStatus(cachedMintedStatus);
        setNftCount(cachedNfts.length);
        setLoading(false);
        return;
      }
    }
    // If no valid cache, fetch fresh data
    fetchNFTs();
  };

  const saveToCache = (nftsData, mintedStatusData) => {
    const cacheData = {
      nfts: nftsData,
      mintedStatus: mintedStatusData,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  };

  const fetchNFTs = async () => {
    setLoading(true);
    setError(null);
    try {
      const availableNFTs = Array.from({ length: 59 }, (_, i) => i + 1);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      const validNFTs = [];
      const newMintedStatus = {};

      for (const id of availableNFTs) {
        try {
          const metadataUrl = `${PINATA_BASE_URL}/${id}.json`;
          const response = await axios.get(metadataUrl, { timeout: 10000 });
          const isMintedOnChain = await contract.isMinted(id);

          const ownershipResponse = await axios.get(`${BACKEND_URL}/check-nft-ownership/${id}`);
          const isOwned = ownershipResponse.data.isOwned;

          newMintedStatus[id] = isMintedOnChain || isOwned;

          if (!isMintedOnChain && !isOwned) {
            let imageUrl = response.data.image?.startsWith("ipfs://")
              ? `https://ipfs.io/ipfs/${response.data.image.replace("ipfs://", "")}`
              : response.data.image || `${PINATA_BASE_URL}/${id}.png`;

            validNFTs.push({
              id,
              name: response.data.name || `NFT ${id}`,
              description: response.data.description || "No description.",
              image: imageUrl,
              pngPath: `${PINATA_BASE_URL}/${id}.png`,
              svgPath: `${PINATA_BASE_URL}/${id}.svg`,
              metadata: response.data,
              isMinted: false,
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch NFT ${id}:`, error.message);
        }
      }

      if (validNFTs.length === 0) {
        setError("No available NFTs found. All may be minted or IPFS content unavailable.");
      } else {
        setNfts(validNFTs);
        setMintedStatus(newMintedStatus);
        setNftCount(validNFTs.length);
        saveToCache(validNFTs, newMintedStatus); // Cache the data
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setError("Failed to load NFTs. Please check your connection or IPFS content availability.");
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
      alert("Failed to connect to MetaMask. Please try again.");
    }
  };

  const mintNFT = async (tokenId) => {
    if (!account) return alert("Connect MetaMask first.");

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("Please log in first.");
      navigate("/login");
      return;
    }

    try {
      const ownershipResponse = await axios.get(`${BACKEND_URL}/check-nft-ownership/${tokenId}`);
      if (ownershipResponse.data.isOwned) {
        alert("This NFT is already owned and cannot be minted again.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const cid = PINATA_BASE_URL.replace("https://gateway.pinata.cloud/ipfs/", "");
      const metadataURI = `ipfs://${cid}/${tokenId}.json`;

      const tx = await contract.payToMint(account, metadataURI, tokenId, {
        value: ethers.parseEther("0.05"),
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

      console.log("Transaction confirmed:", receipt);
      console.log("Transaction ID:", txDetails.txHash);
      console.log("View on block explorer:", `https://etherscan.io/tx/${txDetails.txHash}`);

      const metadataUrl = `${PINATA_BASE_URL}/${tokenId}.json`;
      const metadataResponse = await axios.get(metadataUrl);
      const nftName = metadataResponse.data.name || `NFT ${tokenId}`;
      const imageUrl = metadataResponse.data.image?.startsWith("ipfs://")
        ? `https://ipfs.io/ipfs/${metadataResponse.data.image.replace("ipfs://", "")}`
        : metadataResponse.data.image || `${PINATA_BASE_URL}/${tokenId}.png`;

      const walletAddress = localStorage.getItem("wallet_address");
      if (!walletAddress) {
        throw new Error("Wallet address not found in localStorage. Please log in again.");
      }

      const payload = {
        walletAddress,
        nftId: tokenId,
        nftName,
        price: "0.05",
        tokenID: tokenId,
        contractAddress: CONTRACT_ADDRESS,
        imageUrl,
        category: "Art",
        txHash: txDetails.txHash,
      };
      console.log("Sending payload to /buy-nft:", payload);

      const buyResponse = await axios.post(
        `${BACKEND_URL}/buy-nft`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!buyResponse.data.success) {
        console.error("Buy NFT response:", buyResponse.data);
        throw new Error(`Failed to record NFT purchase: ${buyResponse.data.message}`);
      }

      // Update state and cache
      setMintedStatus((prev) => ({ ...prev, [tokenId]: true }));
      setNfts((prev) => {
        const updatedNfts = prev.filter((nft) => nft.id !== tokenId);
        saveToCache(updatedNfts, { ...mintedStatus, [tokenId]: true }); // Update cache
        return updatedNfts;
      });
      setNftCount((prev) => prev - 1);
      alert("NFT minted and recorded successfully!");
      window.dispatchEvent(new Event("balanceUpdated"));
    } catch (error) {
      console.error("Minting error:", error);
      if (error.response) console.error("Server response:", error.response.data);
      alert(`Minting failed: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          NFT Collection
        </Typography>
        <Typography variant="h6" gutterBottom>
          Available NFTs: {nftCount} / 59
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
          <Button variant="outlined" onClick={fetchNFTs}>
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
        <Typography align="center">No available NFTs found. Check IPFS content or refresh.</Typography>
      ) : (
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
                    onError={(e) => {
                      e.target.src = nft.pngPath;
                      e.target.onerror = () => {
                        e.target.src = nft.svgPath;
                        e.target.onerror = () => {
                          e.target.src = "https://via.placeholder.com/400?text=Image+Not+Found";
                          e.target.onerror = null;
                        };
                      };
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
      )}
    </Container>
  );
};

export default Home;