import React, { useState, useEffect } from "react";
import { Container, Button, Typography, CardMedia, Grid, Card, CardContent, CircularProgress, Box } from "@mui/material";
import { ethers } from "ethers";
import axios from "axios";
import contractData from "../../../backend/build/contracts/MyNFT.json";

const CONTRACT_ADDRESS = "0xA3e8472Eb803c5478F476175167b6c48Bf5eF530"; // Update if redeployed
const ABI = contractData.abi;
const PINATA_BASE_URL = "https://gateway.pinata.cloud/ipfs/bafybeif7oettpy7l7j7pe4lpcqzr3hfum7dpd25q4yx5a3moh7x4ubfhqy";
const BACKEND_URL = "http://localhost:8081";

const ALTERNATIVE_GATEWAYS = [
  "https://ipfs.io/ipfs/bafybeif7oettpy7l7j7pe4lpcqzr3hfum7dpd25q4yx5a3moh7x4ubfhqy",
  "https://cloudflare-ipfs.com/ipfs/bafybeif7oettpy7l7j7pe4lpcqzr3hfum7dpd25q4yx5a3moh7x4ubfhqy",
];

const Home = () => {
  const [nfts, setNfts] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gateway, setGateway] = useState(0);
  const [mintedStatus, setMintedStatus] = useState({});

  useEffect(() => {
    fetchNFTs();
    checkConnection();
  }, [gateway]);

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

  const getCurrentGateway = () => {
    if (gateway === 0) return PINATA_BASE_URL;
    return ALTERNATIVE_GATEWAYS[gateway - 1];
  };

  const tryNextGateway = () => {
    const nextGateway = (gateway + 1) % (ALTERNATIVE_GATEWAYS.length + 1);
    console.log(`Switching to gateway ${nextGateway}: ${getCurrentGateway()}`);
    setGateway(nextGateway);
  };

  const fetchNFTs = async () => {
    setLoading(true);
    setError(null);
    try {
      const availableNFTs = Array.from({ length: 5 }, (_, i) => i);
      const currentGateway = getCurrentGateway();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      const nftPromises = availableNFTs.map(async (id) => {
        try {
          const metadataUrl = `${currentGateway}/${id}.json`;
          const response = await axios.get(metadataUrl, { timeout: 5000 });
          const isMintedOnChain = await contract.isMinted(id);

          const ownershipResponse = await axios.get(`${BACKEND_URL}/check-nft-ownership/${id}`);
          const isOwned = ownershipResponse.data.isOwned;

          let imageUrl = response.data.image?.startsWith("ipfs://")
            ? `https://ipfs.io/ipfs/${response.data.image.replace("ipfs://", "")}`
            : response.data.image || `${currentGateway}/${id}.png`;

          return {
            id,
            name: response.data.name || `NFT ${id}`,
            description: response.data.description || "No description.",
            image: imageUrl,
            pngPath: `${currentGateway}/${id}.png`,
            svgPath: `${currentGateway}/${id}.svg`,
            metadata: response.data,
            isMinted: isMintedOnChain || isOwned,
          };
        } catch (error) {
          console.warn(`Failed to fetch NFT ${id}:`, error.message);
          return null;
        }
      });

      const results = await Promise.all(nftPromises);
      const validNFTs = results.filter((nft) => nft !== null);

      if (validNFTs.length === 0) {
        console.log("No NFTs loaded from any gateway. Trying next gateway...");
        tryNextGateway();
        return;
      }

      setNfts(validNFTs);
      setMintedStatus(Object.fromEntries(validNFTs.map((nft) => [nft.id, nft.isMinted])));
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
  
      const gasUsed = receipt.gasUsed ? receipt.gasUsed.toString() : "0";
      const effectiveGasPrice = receipt.effectiveGasPrice ? receipt.effectiveGasPrice.toString() : "0";
      const totalGasFeeWei = receipt.gasUsed * receipt.effectiveGasPrice; // Fixed to BigInt
      const totalGasFeeEth = ethers.formatEther(totalGasFeeWei);
  
      const txDetails = {
        txHash: receipt.hash, // Use receipt.hash directly
        from: receipt.from,
        to: CONTRACT_ADDRESS,
        amount: "-0.05 ETH",
        gasUsed,
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
  
      const buyResponse = await axios.post(`${BACKEND_URL}/buy-nft`, {
        walletAddress: account,
        nftId: tokenId,
        nftName,
        price: "0.05",
        tokenID: tokenId,
        contractAddress: CONTRACT_ADDRESS,
        imageUrl,
        category: "Art",
        txHash: txDetails.txHash,
      });
  
      if (!buyResponse.data.success) {
        throw new Error(`Failed to record NFT purchase in database: ${buyResponse.data.message}`);
      }
  
      setMintedStatus((prev) => ({ ...prev, [tokenId]: true }));
      alert("NFT minted and recorded successfully!");
    } catch (error) {
      console.error("Minting error:", error);
      alert(`Minting failed: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          NFT Collection
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
          <Button variant="outlined" onClick={tryNextGateway}>
            Try Different Gateway
          </Button>
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
        <Typography align="center">No NFTs found. Check IPFS content or try refreshing.</Typography>
      ) : (
        <Grid container spacing={4}>
          {nfts.map((nft) => (
            <Grid item key={nft.id} xs={12} sm={6} md={4}>
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
                    {mintedStatus[nft.id] ? "Minted/Owned" : "Mint NFT"}
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