import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCollections } from "../api/nftData.js";
import { 
    Container, Box, Grid, Card, CardContent, CardMedia, 
    Divider, InputBase, Typography, Button, Stack 
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";

// Styled Components for Search Bar
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

const Home = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [collections, setCollections] = useState([]);

    useEffect(() => {
        const fetchCollections = async () => {
            const data = await getCollections();
            setCollections(data);
        };
        fetchCollections();
    }, []);

    const filteredCollections = collections.filter(
        (collection) => collection.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container sx={{ mt: 4 }}>
            {/* Title */}
            <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    NFT Marketplace
                </Typography>
            </Box>

            {/* Search Bar */}
            <Box sx={{ mb: 2 }}>
                <SearchWrapper>
                    <SearchIconWrapper>
                        <SearchIcon /> 
                    </SearchIconWrapper>
                    <StyledInputBase
                        placeholder="Search Collections..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchWrapper>
                <Divider sx={{ my: 2 }} />
            </Box>

            {/* NFT Collections */}
            <Grid container spacing={3}>
                {filteredCollections.map(({ category, first_image }) => (
                    <Grid item xs={12} sm={6} md={4} key={category}>
                        <Card 
                            sx={{ 
                                cursor: "pointer", 
                                transition: "0.3s", 
                                "&:hover": { boxShadow: 6 } 
                            }}
                            onClick={() => navigate(`/market/${category}`)}
                        >
                            <CardMedia component="img" height="140" image={first_image} alt={category} />
                            <CardContent>
                                <Typography variant="h6">{category}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Home;
