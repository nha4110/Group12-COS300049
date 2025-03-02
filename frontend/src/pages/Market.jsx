import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getNFTsByCategory } from "../api/nftData.js";
import { Container, Grid, Card, CardContent, CardMedia, Typography } from "@mui/material";

const Market = () => {
    const { category } = useParams();
    const location = useLocation();
    const [nfts, setNfts] = useState([]);

    // ✅ Debugging logs
    console.log("🟢 Category from URL:", category);
    console.log("🟡 Current URL:", location.pathname);

    useEffect(() => {
        if (!category) {
            console.error("❌ No category found in URL.");
            return;
        }

        const fetchNFTs = async () => {
            const data = await getNFTsByCategory(category);
            setNfts(data);
        };

        fetchNFTs();
    }, [category]);

    return (
        <Container sx={{ mt: 6 }}> {/* ✅ Added margin-top for spacing */}
            <Typography variant="h4" sx={{ textAlign: "center", mb: 4 }}>
                {category ? `${category} NFTs` : "Loading..."}
            </Typography>

            <Grid container spacing={3}>
                {nfts.map(({ assetid, img, name, price }) => {
                    console.log(`🖼️ Image URL for ${name}:`, img); // ✅ Debugging

                    return (
                        <Grid item xs={12} sm={6} md={4} key={assetid}>
                            <Card sx={{ transition: "0.3s", "&:hover": { boxShadow: 6 }, mt: 2 }}> {/* ✅ Added margin-top */}
                                <CardMedia
                                    component="img"
                                    height="200" // ✅ Increased height for better display
                                    image={img} // ✅ Use `img` directly
                                    alt={name}
                                    sx={{ padding: "10px", objectFit: "contain" }} // ✅ Added padding above the image
                                    onError={(e) => e.target.src = "/placeholder.jpg"} // ✅ Fallback image
                                />
                                <CardContent>
                                    <Typography variant="h6">{name}</Typography>
                                    <Typography variant="body1">Price: {price}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Container>
    );
};

export default Market;
