import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, CardMedia, Button, Grid, Card, CardContent } from "@mui/material";
import axios from "axios";

const IPFS_BASE_URL = "https://ipfs.io/ipfs/bafybeif7oettpy7l7j7pe4lpcqzr3hfum7dpd25q4yx5a3moh7x4ubfhqy";

const Market = () => {
  const { id } = useParams();
  const [nft, setNft] = useState(null);
  const [suggestedNfts, setSuggestedNfts] = useState([]);
  const userId = 1; // Replace with actual logged-in user's ID

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
          tokenID: `token-${id}`,
          contractAddress: "0x123456789abcdef",
          category: "Art",
        });
      } catch (error) {
        console.error(`Error fetching NFT ${id}:`, error);
      }
    };

    fetchNFT();
  }, [id]);

  const buyNFT = async () => {
    if (!nft) return;
    
    try {
      const response = await axios.post("http://localhost:8081/buy-nft", {
        userId,
        nftId: nft.id,
        nftName: nft.name,
        price: nft.price,
        tokenID: nft.tokenID,
        contractAddress: nft.contractAddress,
        imageUrl: nft.image,
        category: nft.category
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
      {nft ? (
        <>
          <Typography variant="h4" sx={{ mb: 2 }}>{nft.name}</Typography>
          <CardMedia component="img" image={nft.image} alt={nft.name} sx={{ maxWidth: "500px", maxHeight: "500px", width: "100%", height: "auto", mb: 2 }} />
          <Typography variant="body1" sx={{ mb: 1 }}>Description: {nft.description}</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>Price: {nft.price} ETH</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>Gas Price: 0.000000002 ETH</Typography>
          <Button variant="contained" color="primary" onClick={buyNFT}>Buy Now</Button>
        </>
      ) : (
        <Typography>Loading...</Typography>
      )}
    </Container>
  );
};

export default Market;
