import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, CardMedia, Button } from "@mui/material";
import { ethers } from "ethers";
import axios from "axios";

const IPFS_BASE_URL = "https://ipfs.io/ipfs/bafybeif7oettpy7l7j7pe4lpcqzr3hfum7dpd25q4yx5a3moh7x4ubfhqy";
const CONTRACT_ADDRESS = "0x123456789abcdef";
const ABI = [
  // Define the ABI for your NFT contract
  "function transferFrom(address from, address to, uint256 tokenId) external"
];

const Market = () => {
  const { id } = useParams();
  const [nft, setNft] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const fetchNFT = async () => {
      try {
        const metadataUrl = `${IPFS_BASE_URL}/${id}.json`;
        const imageUrl = `${IPFS_BASE_URL}/${id}.png`;
        const response = await axios.get(metadataUrl);
        setNft({
          id: id,
          name: response.data.name || `NFT ${id}`,
          description: response.data.description || "No description provided.",
          image: imageUrl,
          price: 5, // Example price in ETH
          tokenID: id,
          contractAddress: CONTRACT_ADDRESS,
          category: "Art",
        });
      } catch (error) {
        console.error(`Error fetching NFT ${id}:`, error);
      }
    };

    fetchNFT();
  }, [id]);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting MetaMask:", error);
    }
  };

  const buyNFT = async () => {
    if (!nft || !account) return alert("Please connect MetaMask first");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(nft.contractAddress, ABI, signer);
      const seller = "0xSellerAddressHere"; // Replace with actual seller address

      const tx = await contract.transferFrom(seller, account, nft.tokenID);
      await tx.wait();
      
      const txHash = tx.hash;
      const response = await axios.post("http://localhost:8081/buy-nft", {
        buyer: account,
        seller: seller,
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
      {!account && <Button variant="contained" onClick={connectMetaMask}>Connect MetaMask</Button>}
      {nft ? (
        <>
          <Typography variant="h4" sx={{ mb: 2 }}>{nft.name}</Typography>
          <CardMedia component="img" image={nft.image} alt={nft.name} sx={{ maxWidth: "500px", mb: 2 }} />
          <Typography variant="body1">Description: {nft.description}</Typography>
          <Typography variant="body1">Price: {nft.price} ETH</Typography>
          <Button variant="contained" color="primary" onClick={buyNFT}>Buy Now</Button>
        </>
      ) : (
        <Typography>Loading...</Typography>
      )}
    </Container>
  );
};

export default Market;
