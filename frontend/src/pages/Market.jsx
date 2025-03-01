{/*
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Lu Nhat Hoang -  105234956
*/ }
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isAuthenticated, getCurrentUser, buyNFT } from "../scripts/auth";
import nftData from "../scripts/nftData";
import SearchAppBar, { useBalance } from "../component/AppBar";
import { Container, Grid, Card, CardMedia, CardContent, Typography, Button } from "@mui/material";


// getting the data from other file
const Market = () => {
    const { collectionName } = useParams();
    const navigate = useNavigate();
    const { balance, setBalance } = useBalance(); // Now balance persists correctly
    const [nfts, setNfts] = useState([]);

    useEffect(() => {
        if (isAuthenticated()) {
            let user = getCurrentUser();
            let storedBalance = localStorage.getItem("balance"); // trying to save balance in local storage to make it display corectly in all page

            if (storedBalance !== null) {
                setBalance(parseFloat(storedBalance)); // Load stored balance
            } else {
                setBalance(user.balance || 0);
            }
        }
    }, []); // ✅ Removed setBalance from dependency array to avoid infinite re-renders.

    useEffect(() => {
        const boughtNFTs = JSON.parse(localStorage.getItem("boughtNFTs")) || []; // see if the user bought any NFTs

        if (nftData[collectionName]) { // check if the collection exists in the nftdata
            const availableNFTs = nftData[collectionName].filter( // if users bought any NFTs, filter out the bought ones
                (nft) => !boughtNFTs.some((bought) => bought.title === nft.title) 
            ); // ✅ Logic to check collection and filter out bought NFTs
            setNfts(availableNFTs);
        } else {
            setNfts([]);
        }
    }, [collectionName]);

    const handleBuy = (nft) => {
        if (!isAuthenticated()) {
            navigate("/login");
            return;
        }

        const nftPrice = parseFloat(nft.price.replace(" ETH", ""));

        if (balance < nftPrice) {
            alert("Not enough ETH");
            return;
        }

        const result = buyNFT(nft);
        if (result.success) {
            const newBalance = Math.max(0, balance - nftPrice); // Ensure balance never goes negative
            setBalance(newBalance);
            localStorage.setItem("balance", newBalance.toString()); // ✅ Persist balance after purchase

            const boughtNFTs = JSON.parse(localStorage.getItem("boughtNFTs")) || [];
            localStorage.setItem("boughtNFTs", JSON.stringify([...boughtNFTs, nft]));

            setNfts((prevNfts) => prevNfts.filter((item) => item.title !== nft.title));

            alert(`You purchased ${nft.title}!`);
        } else {
            alert(result.message);
        }
    };

    return (
        <>
            <Container>
                <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
                    {collectionName} Collection
                </Typography>
                {nfts.length > 0 ? (
                    <Grid container spacing={3}>
                        {nfts.map((nft, index) => {
                            const nftPrice = parseFloat(nft.price.replace(" ETH", ""));
                            return (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card>
                                        <CardMedia component="img" height="200" image={nft.image} alt={nft.title} />
                                        <CardContent>
                                            <Typography variant="h6">{nft.title}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                By: {nft.creator}
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: "bold", mt: 1 }}>
                                                Price: {nft.price}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                fullWidth
                                                sx={{ mt: 2 }}
                                                onClick={() => handleBuy(nft)}
                                                disabled={balance < nftPrice}
                                            >
                                                {balance >= nftPrice ? "Buy" : "Insufficient Funds"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : (
                    <Typography variant="body1" sx={{ mt: 4 }}>
                        No NFTs available.
                    </Typography>
                )}
            </Container>
        </>
    );
};

export default Market;
