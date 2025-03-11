import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, Grid, Card, CardContent, CardMedia, Typography, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import axios from "axios";

const IPFS_BASE_URL = "https://ipfs.io/ipfs/bafybeif7oettpy7l7j7pe4lpcqzr3hfum7dpd25q4yx5a3moh7x4ubfhqy";

const SearchBarWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "-20px",
  marginBottom: "20px",
  gap: "10px",
  background: "white",
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
  border: "2px solid white",
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
  const nftsRef = useRef(null); // Ref for the NFT grid
  const [colorFilter, setColorFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    const fetchNFTs = async () => {
      let loadedNFTs = [];
      for (let i = 0; i < 60; i++) {
        try {
          const metadataUrl = `${IPFS_BASE_URL}/${i}.json`;
          const response = await axios.get(metadataUrl);
          loadedNFTs.push({
            id: i,
            name: response.data.name || `NFT ${i}`,
            image: `${IPFS_BASE_URL}/${i}.png`,
            color: response.data.attributes?.find(attr => attr.trait_type === "Background")?.value || "Unknown",
            price: 5, // All NFTs have a price of 5 ETH
          });
        } catch (error) {
          console.error(`Error fetching NFT ${i}:`, error);
        }
      }
      setNfts(loadedNFTs);
    };

    fetchNFTs();
  }, []);

  const scrollToNFTs = () => {
    if (nftsRef.current) {
      nftsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleColorFilterChange = (event) => {
    setColorFilter(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  let filteredNFTs = nfts.filter((nft) => {
    const searchMatch = nft.name.toLowerCase().includes(searchTerm.toLowerCase());
    const colorMatch = colorFilter ? nft.color === colorFilter : true;
    return searchMatch && colorMatch;
  });

  if (sortOrder) {
    filteredNFTs = [...filteredNFTs].sort((a, b) => {
      if (sortOrder === "az") {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === "za") {
        return b.name.localeCompare(a.name);
      } else if (sortOrder === "priceLow") {
        return a.price - b.price;
      } else if (sortOrder === "priceHigh") {
        return b.price - a.price;
      }
      return 0;
    });
  }

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
          onClick={scrollToNFTs} // Changed to scrollToNFTs
        >
          Explore Marketplace
        </Button>
      </Box>

      {/* Search and Filters */}
      <SearchBarWrapper>
        <SearchBox>
          <SearchIcon sx={{ color: "#8e24aa" }} />
          <StyledInputBase
            placeholder="Search NFTs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="sort-order-label">Sort By</InputLabel>
          <Select
            labelId="sort-order-label"
            id="sort-order"
            value={sortOrder}
            onChange={handleSortOrderChange}
          >
            <MenuItem value="az">A-Z</MenuItem>
            <MenuItem value="za">Z-A</MenuItem>
            <MenuItem value="priceLow">Price (Low to High)</MenuItem>
            <MenuItem value="priceHigh">Price (High to Low)</MenuItem>
          </Select>
        </FormControl>
      </SearchBarWrapper>

      {/* NFT Cards */}
      <Grid container spacing={3} sx={{ mt: 2 }} ref={nftsRef}> {/* Added ref here */}
        {filteredNFTs.map((nft) => (
          <Grid item xs={12} sm={6} md={4} key={nft.id}>
            <Card onClick={() => navigate(`/market/nft/${nft.id}`)}>
              <CardMedia component="img" height="200" image={nft.image} alt={nft.name} />
              <CardContent>
                <Typography variant="h6">{nft.name}</Typography>
                <Typography variant="body2">Price: {nft.price} ETH</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;