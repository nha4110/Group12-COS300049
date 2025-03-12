import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, CardMedia, Button } from "@mui/material";
import { ethers } from "ethers";
import axios from "axios";
import contractData from "../../../backend/build/contracts/MyNFT.json"; // ✅ Correct path

const CONTRACT_ADDRESS = "0x8B9E8451d03fF8A57a51bC83f7a8aDadE106E71C";
const ABI = contractData.abi;

const Market = () => {
  const { id } = useParams();
  const tokenId = Number(id);
  const [nft, setNft] = useState(null);
  const [account, setAccount] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNFT = async () => {
      setLoading(true);
      try {
        if (!window.ethereum) throw new Error("MetaMask is not installed");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        // ✅ Use `count()` instead of `totalMinted()`
        const totalSupply = await contract.getTotalSupply();
        if (tokenId >= totalSupply) throw new Error(`Token ID ${tokenId} does not exist.`);

        const tokenURI = await contract.tokenURI(tokenId);
        if (!tokenURI) throw new Error(`No metadata found for Token ID ${tokenId}`);

        const ownerAddress = await contract.ownerOf(tokenId);
        setSeller(ownerAddress);

        const metadataUrl = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        const response = await axios.get(metadataUrl);

        setNft({
          id: tokenId,
          name: response.data.name || `NFT ${tokenId}`,
          description: response.data.description || "No description provided.",
          image: response.data.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
          price: 5,
          tokenID: tokenId,
          contractAddress: CONTRACT_ADDRESS,
          category: "Art",
        });
      } catch (error) {
        console.error(`Error fetching NFT ${tokenId}:`, error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNFT();
  }, [tokenId]);

  const connectMetaMask = async () => {
    if (!window.ethereum) return alert("MetaMask not detected!");
    if (account) return;

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting MetaMask:", error);
    }
  };

  const buyNFT = async () => {
    if (!nft || !account || !seller) return alert("Please connect MetaMask first or wait for NFT to load.");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(nft.contractAddress, ABI, signer);

      // ✅ Approve transfer
      const approveTx = await contract.approve(account, nft.tokenID);
      await approveTx.wait();

      // ✅ Transfer NFT
      const tx = await contract.transferFrom(seller, account, nft.tokenID);
      await tx.wait();

      // ✅ Save transaction details
      const txHash = tx.hash;
      const response = await axios.post("http://localhost:8081/buy-nft", {
        buyer: account,
        seller,
        amount: nft.price,
        token_id: nft.tokenID,
        tx_hash: txHash,
        name: nft.name,
        owner: account,
        img: nft.image,
        price: nft.price,
        contract_address: nft.contractAddress,
        category: nft.category,
      });

      if (response.data.success) {
        alert("NFT purchased successfully!");
      } else {
        alert("Purchase failed. Please try again.");
      }
    } catch (error) {
      console.error("Error buying NFT:", error);
      alert("Error purchasing NFT.");
    }
  };

  return (
    <Container sx={{ mt: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {!account && (
        <Button variant="contained" onClick={connectMetaMask}>
          Connect MetaMask
        </Button>
      )}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : nft ? (
        <>
          <Typography variant="h4" sx={{ mb: 2 }}>{nft.name}</Typography>
          <CardMedia component="img" image={nft.image} alt={nft.name} sx={{ maxWidth: "500px", mb: 2 }} />
          <Typography variant="body1">Description: {nft.description}</Typography>
          <Typography variant="body1">Price: {nft.price} ETH</Typography>
          <Button variant="contained" color="primary" onClick={buyNFT} disabled={!account}>
            Buy Now
          </Button>
        </>
      ) : (
        <Typography>Error loading NFT data.</Typography>
      )}
    </Container>
  );
};

export default Market;
