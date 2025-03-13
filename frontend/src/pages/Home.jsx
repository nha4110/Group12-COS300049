import React, { useState, useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import { ethers } from "ethers";
import axios from "axios";
import contractData from "../../../backend/build/contracts/MyNFT.json";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../scripts/AuthContext";
import NFTList from "../component/NFTList";
import WalletConnection from "../component/WalletConnection";

const CONTRACT_ADDRESS = "0x84643357E0de364Acc9659021A1920362e1255D5";
const ABI = contractData.abi;
const PINATA_BASE_URL = "https://gateway.pinata.cloud/ipfs/bafybeif7oettpy7l7j7pe4lpcqzr3hfum7dpd25q4yx5a3moh7x4ubfhqy";
const BACKEND_URL = "http://localhost:8081";
const CACHE_KEY = "nft_cache";

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

    const handleCacheUpdate = () => fetchNFTs();
    window.addEventListener("nftCacheUpdated", handleCacheUpdate);
    return () => window.removeEventListener("nftCacheUpdated", handleCacheUpdate);
  }, [state.user?.wallet_address]);

  const checkConnection = async () => {
    try {
      if (state.user?.wallet_address) {
        setAccount(state.user.wallet_address);
      } else if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0 && (!state.user?.wallet_address || accounts[0] === state.user.wallet_address)) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error);
      setAccount(null);
    }
  };

  const loadNFTs = () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { nfts: cachedNfts, mintedStatus: cachedMintedStatus, timestamp } = JSON.parse(cachedData);
      const cacheAge = Date.now() - timestamp;
      const maxAge = 24 * 60 * 60 * 1000;
      if (cacheAge < maxAge) {
        setNfts(cachedNfts);
        setMintedStatus(cachedMintedStatus);
        setNftCount(cachedNfts.length);
        setLoading(false);
        return;
      }
    }
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
      const availableNFTs = Array.from({ length: 20 }, (_, i) => i + 1);
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
        saveToCache(validNFTs, newMintedStatus);
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
      if (state.user?.wallet_address && accounts[0] !== state.user.wallet_address) {
        alert("MetaMask account does not match your logged-in wallet. Please switch accounts or log in again.");
      } else {
        setAccount(accounts[0]);
      }
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

      const metadataUrl = `${PINATA_BASE_URL}/${tokenId}.json`;
      const metadataResponse = await axios.get(metadataUrl);
      const nftName = metadataResponse.data.name || `NFT ${tokenId}`;
      const imageUrl = metadataResponse.data.image?.startsWith("ipfs://")
        ? `https://ipfs.io/ipfs/${metadataResponse.data.image.replace("ipfs://", "")}`
        : metadataResponse.data.image || `${PINATA_BASE_URL}/${tokenId}.png`;

      const payload = {
        walletAddress: account,
        nftId: tokenId,
        nftName,
        price: "0.05",
        tokenID: tokenId,
        contractAddress: CONTRACT_ADDRESS,
        imageUrl,
        category: "Art",
        txHash: txDetails.txHash,
      };

      const buyResponse = await axios.post(
        `${BACKEND_URL}/buy-nft`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!buyResponse.data.success) {
        throw new Error(`Failed to record NFT purchase: ${buyResponse.data.message}`);
      }

      const nftTransaction = {
        txHash: txDetails.txHash,
        from: txDetails.from,
        to: CONTRACT_ADDRESS,
        amount: txDetails.amount,
        gas: totalGasFeeEth,
        date: new Date().toISOString(),
        nftName,
        tokenId,
        type: "nftPurchase",
      };
      const existingNftTransactions = JSON.parse(localStorage.getItem("nftTransactions")) || [];
      localStorage.setItem("nftTransactions", JSON.stringify([...existingNftTransactions, nftTransaction]));

      setMintedStatus((prev) => ({ ...prev, [tokenId]: true }));
      setNfts((prev) => {
        const updatedNfts = prev.filter((nft) => nft.id !== tokenId);
        saveToCache(updatedNfts, { ...mintedStatus, [tokenId]: true });
        return updatedNfts;
      });
      setNftCount((prev) => prev - 1);
      alert("NFT minted and recorded successfully!");
      window.dispatchEvent(new Event("balanceUpdated"));
    } catch (error) {
      console.error("Minting error:", error);
      alert(`Minting failed: ${error.message || "Unknown error"}`);
    }
  };

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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
        <WalletConnection
          account={account}
          connectMetaMask={connectMetaMask}
          fetchNFTs={fetchNFTs}
          shortenAddress={shortenAddress}
        />
      </Box>
      <NFTList
        nfts={nfts}
        loading={loading}
        error={error}
        account={account}
        mintedStatus={mintedStatus}
        mintNFT={mintNFT}
      />
    </Container>
  );
};

export default Home;