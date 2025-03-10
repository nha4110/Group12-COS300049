import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, Grid, Card, CardContent, CardMedia, Typography, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import axios from "axios";

// 🔹 IPFS Base URL
const IPFS_BASE_URL = "https://ipfs.io/ipfs/bafybeif7oettpy7l7j7pe4lpcqzr3hfum7dpd25q4yx5a3moh7x4ubfhqy";

// 🔹 Styled Components
const SearchBarWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "-20px",
  marginBottom: "20px",
  gap: "10px",
});

const SearchBox = styled("div")({
  display: "flex",
  alignItems: "center",
  backgroundColor: "white",
  borderRadius: "30px",
  padding: "12px 20px",
  width: "60%",
  maxWidth: "600px",
  boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)",
});

const StyledInputBase = styled("input")({
  flex: 1,
  color: "black",
  paddingLeft: "10px",
  fontSize: "16px",
});

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [nfts, setNfts] = useState([]);
  const collectionsRef = useRef(null);

  // 🔹 Fetch NFT Metadata from IPFS
  useEffect(() => {
    const fetchNFTs = async () => {
      let loadedNFTs = [];
      for (let i = 0; i < 60; i++) {
        try {
          const metadataUrl = `${IPFS_BASE_URL}/${i}.json`; // JSON metadata
          const response = await axios.get(metadataUrl);
          loadedNFTs.push({
            id: i,
            name: response.data.name || `NFT ${i}`,
            image: `${IPFS_BASE_URL}/${i}.png`, // Assuming PNG format
          });
        } catch (error) {
          console.error(`Error fetching NFT ${i}:`, error);
        }
      }
      setNfts(loadedNFTs);
    };

    fetchNFTs();
  }, []);

  // 🔹 Scroll to NFTs
  const scrollToCollections = () => {
    if (collectionsRef.current) {
      collectionsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 🔹 Filter NFTs Based on Search
  const filteredNFTs = nfts.filter((nft) => nft.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Container sx={{ mt: 4 }}>
      <Box
        sx={{
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          flexDirection: "column",
          color: "white",
          background: "linear-gradient(135deg, #2c0e3a, #8e24aa)",
          borderRadius: "15px",
          padding: "40px",
          boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
          Discover & Collect Rare NFTs
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.8, mb: 3 }}>
          Explore digital art & collectibles in the most trusted marketplace.
        </Typography>
        <Button
          sx={{
            background: "#8e24aa",
            color: "white",
            padding: "12px 20px",
            borderRadius: "30px",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "0.3s",
            "&:hover": {
              background: "#4a148c",
              transform: "scale(1.05)",
            },
          }}
          onClick={scrollToCollections}
        >
          Explore Marketplace
        </Button>
      </Box>

      {/* 🔹 Search Bar */}
      <SearchBarWrapper>
        <SearchBox>
          <SearchIcon sx={{ color: "#8e24aa" }} />
          <StyledInputBase
            placeholder="Search NFTs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>
      </SearchBarWrapper>

      {/* 🔹 NFT Collection Grid */}
      <div ref={collectionsRef}>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {filteredNFTs.map((nft) => (
            <Grid item xs={12} sm={6} md={4} key={nft.id}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid transparent",
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: "0px 8px 20px rgba(142, 36, 170, 0.5)",
                    transform: "scale(1.05)",
                    border: "2px solid #8e24aa",
                  },
                }}
                onClick={() => navigate(`/nft/${nft.id}`)}
              >
                <CardMedia component="img" height="200" image={nft.image} alt={nft.name} />
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#8e24aa",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {nft.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </Container>
  );
};

export default Home;
