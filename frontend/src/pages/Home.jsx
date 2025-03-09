import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, Grid, Card, CardContent, CardMedia, Typography, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";

// 🔹 Search & Filter Wrapper (Contains Both)
const SearchBarWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "-20px",
  marginBottom: "20px",
  gap: "10px",
});

// 🔹 Search Box (White Bar)
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

// 🔹 Input Styling
const StyledInputBase = styled("input")({
  flex: 1,
  color: "black",
  paddingLeft: "10px",
  fontSize: "16px",
});

// 🔹 Home Component
const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [collections, setCollections] = useState([
    {
      category: "Art 1",
      first_image: "https://ipfs.io/ipfs/bafybeiffrmvsogsu5povwilhez3uai2zzr5qnlfcnchv5xzbiri2c5bsim/art1.jpg",
    },
    {
      category: "Art 2",
      first_image: "https://ipfs.io/ipfs/bafybeiffrmvsogsu5povwilhez3uai2zzr5qnlfcnchv5xzbiri2c5bsim/art2.jpg",
    },
    {
      category: "Art 3",
      first_image: "https://ipfs.io/ipfs/bafybeiffrmvsogsu5povwilhez3uai2zzr5qnlfcnchv5xzbiri2c5bsim/art3.jpg",
    },
    {
      category: "Music 1",
      first_image: "https://ipfs.io/ipfs/bafybeiffrmvsogsu5povwilhez3uai2zzr5qnlfcnchv5xzbiri2c5bsim/music1.jpg",
    },
    {
      category: "Music 2",
      first_image: "https://ipfs.io/ipfs/bafybeiffrmvsogsu5povwilhez3uai2zzr5qnlfcnchv5xzbiri2c5bsim/music2.jpg",
    },
    {
      category: "Music 3",
      first_image: "https://ipfs.io/ipfs/bafybeiffrmvsogsu5povwilhez3uai2zzr5qnlfcnchv5xzbiri2c5bsim/music3.jpg",
    },
    {
      category: "Photo 1",
      first_image: "https://ipfs.io/ipfs/bafybeiffrmvsogsu5povwilhez3uai2zzr5qnlfcnchv5xzbiri2c5bsim/photo1.jpg",
    },
    {
      category: "Photo 2",
      first_image: "https://ipfs.io/ipfs/bafybeiffrmvsogsu5povwilhez3uai2zzr5qnlfcnchv5xzbiri2c5bsim/photo2.jpg",
    },
    {
      category: "Photo 3",
      first_image: "https://ipfs.io/ipfs/bafybeiffrmvsogsu5povwilhez3uai2zzr5qnlfcnchv5xzbiri2c5bsim/photo3.jpg",
    },
  ]);

  const collectionsRef = useRef(null);

  const scrollToCollections = () => {
    if (collectionsRef.current) {
      collectionsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 🔹 Filter NFTs based on Search
  const filteredCollections = collections.filter((collection) => {
    return collection.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

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

      {/* 🔹 NFT Collections */}
      <div ref={collectionsRef}>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {filteredCollections.map(({ category, first_image }) => (
            <Grid item xs={12} sm={6} md={4} key={category}>
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
                onClick={() => navigate(`/market/${category}`)}
              >
                <CardMedia component="img" height="200" image={first_image} alt={category} />
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#8e24aa",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {category}
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