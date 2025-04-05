{/*
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Lu Nhat Hoang - 105234956
*/}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import nftData from "../scripts/nftData.jsx";
import { 
    Container, Box, Grid, Card, CardContent, CardMedia, 
    Divider, InputBase, Typography, Button, Stack 
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";

// Styled Components for the Search Bar
const SearchWrapper = styled("div")(({ theme }) => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: theme.shape.borderRadius,
    padding: "5px 10px",
    maxWidth: "500px",
    width: "100%",
    margin: "auto",
}));
// search icon
const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 1),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(0.5, 1),
}));

// Home Component - Displays NFT Collections
const Home = () => {
    const navigate = useNavigate(); // Hook for navigation
    const [searchTerm, setSearchTerm] = useState(""); // State for search input
    const [filteredCollections, setFilteredCollections] = useState(nftData); // nftaData Stores filtered NFT collections

    // Function to handle search input
    const handleSearch = (query) => {
        setSearchTerm(query);
    };

    // Updates filtered collections based on search input
    useEffect(() => {
        if (!searchTerm) {
            setFilteredCollections(nftData);
        } else {
            const filtered = Object.keys(nftData)
                .filter((category) => category.toLowerCase().includes(searchTerm.toLowerCase()))
                .reduce((acc, key) => {
                    acc[key] = nftData[key];
                    return acc;
                }, {});
            setFilteredCollections(filtered);
        }
    }, [searchTerm]);

    // Sorts NFT collections by price in descending order
    const sortByPrice = () => {
        const sorted = Object.entries(nftData)
            .sort(([, a], [, b]) => parseFloat(b[0].price) - parseFloat(a[0].price))
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        setFilteredCollections(sorted);
    };
    // it work
    const sortByNFTCount = () => {
        const boughtNFTs = JSON.parse(localStorage.getItem("boughtNFTs")) || [];
    
        // Create a new object with updated NFT counts after removing bought NFTs
        const updatedCollections = Object.keys(nftData).reduce((acc, category) => {
            const remainingNFTs = nftData[category].filter(
                (nft) => !boughtNFTs.some((bought) => bought.title === nft.title)
            );
            if (remainingNFTs.length > 0) acc[category] = remainingNFTs;
            return acc;
        }, {});
    
        // Sort the updated collections by NFT count
        const sorted = Object.entries(updatedCollections)
            .sort(([, a], [, b]) => b.length - a.length)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
        setFilteredCollections(sorted);
    };
    
    

    return (
        <Container sx={{ mt: 4 }}>
            {/* Title */}
            <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    NFT Marketplace
                </Typography>
            </Box>

            {/* Search Bar Section: Search icon and type box*/}
            <Box sx={{ mb: 2 }}>
                <SearchWrapper>
                    <SearchIconWrapper>
                        <SearchIcon /> 
                    </SearchIconWrapper>
                    <StyledInputBase
                        placeholder="Search NFTs..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </SearchWrapper>
                <Divider sx={{ my: 2 }} />
            </Box>

            {/* Filter Buttons Section All, Price, Number in the collection*/}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                <Button variant="contained" color="secondary" onClick={() => setFilteredCollections(nftData)}>
                    All
                </Button>
                <Button variant="contained" color="secondary" onClick={sortByPrice}>
                    Price
                </Button>
                <Button variant="contained" color="secondary" onClick={sortByNFTCount}>
                    Number of NFTs
                </Button>
            </Stack>

            {/* NFT Collection Display */}
            <Grid container spacing={3}>
                {Object.entries(filteredCollections).map(([category, nfts]) => (
                    <Grid item xs={12} sm={6} md={4} key={category}>
                        <Card 
                            sx={{ 
                                cursor: "pointer", 
                                transition: "0.3s", 
                                "&:hover": { boxShadow: 6 } 
                            }}
                            onClick={() => navigate(`/market/${category}`)}
                        >
                            {/* NFT Image get from nftData*/}
                            <CardMedia component="img" height="140" image={nfts[0].image} alt={nfts[0].title} />
                            <CardContent>
                                <Typography variant="h6">{category}</Typography>
                                <Typography variant="body1">{nfts[0].title}</Typography>
                                <Typography variant="body2">Price: {nfts[0].price}</Typography>
                                <Typography variant="body2">Creator: {nfts[0].creator}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Reset Button - Clears local storage and refreshes the page to help with the web development*/}
            <Box display="flex" justifyContent="center" mt={4}>
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                        localStorage.clear(); // Clears stored data
                        sessionStorage.clear(); // Clears session storage
                        window.location.reload(); // Refreshes the page
                    }}
                >
                    Reset Project
                </Button>
            </Box>

        </Container>
    );
};

export default Home;
