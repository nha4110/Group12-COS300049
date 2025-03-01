import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/authApi"; // ✅ Import logout function
import { useAuth } from "../scripts/AuthContext"; // ✅ Import useAuth
import { Container, Typography, Box, Button, Card, CardContent, CardMedia } from "@mui/material";

const Profile = () => {
    const navigate = useNavigate();
    const { state, dispatch } = useAuth(); // ✅ Get user from global state
    const [activeTab, setActiveTab] = useState("nfts");
    const [expandedNFT, setExpandedNFT] = useState(null);

    useEffect(() => {
        if (!state.user) {
            navigate("/login"); // Redirect if not logged in
        }
    }, [state.user, navigate]);

    // ✅ Handle NFT expansion
    const toggleNFTDetails = (index) => {
        setExpandedNFT(expandedNFT === index ? null : index);
    };

    // ✅ Handle Logout
    const handleLogout = () => {
        dispatch({ type: "LOGOUT" }); // Remove user from global state
        logout(); // Call API logout function
        navigate("/login"); // Redirect to login
    };

    if (!state.user) return <Typography>Loading profile...</Typography>;

    return (
        <Container sx={{ mt: 4 }}>
            {/* Profile Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h4">Your Profile - {state.user.username}</Typography>
                <Box>
                    <Button variant="contained" sx={{ mr: 2 }} onClick={() => navigate("/")}>🏠 Home</Button>
                    <Button variant="contained" color="error" onClick={handleLogout}>
                        🚪 Sign Out
                    </Button>
                </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ display: "flex", justifyContent: "left", gap: 2, mb: 3 }}>
                <Button variant={activeTab === "nfts" ? "contained" : "outlined"} onClick={() => setActiveTab("nfts")}>My NFTs</Button>
                <Button variant={activeTab === "history" ? "contained" : "outlined"} onClick={() => setActiveTab("history")}>Transaction History</Button>
            </Box>

            {/* My NFTs Section */}
            {activeTab === "nfts" && (
                <Box>
                    <Typography variant="h5" sx={{ mb: 2 }}>Owned NFTs</Typography>
                    {state.user.ownedNFTs?.length > 0 ? (
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                            {state.user.ownedNFTs.map((nft, index) => (
                                <Card key={index} sx={{ cursor: "pointer", width: "400px", textAlign: "center" }} onClick={() => toggleNFTDetails(index)}>
                                    <CardMedia
                                        component="img"
                                        sx={{ height: "300px", width: "300px", objectFit: "cover", margin: "auto" }}
                                        image={nft.image}
                                        alt={nft.title}
                                    />
                                    <CardContent>
                                        <Typography variant="h6">{nft.title}</Typography>
                                        <Typography variant="body2">By: {nft.creator}</Typography>
                                    </CardContent>
                                    {expandedNFT === index && (
                                        <Box sx={{ mt: 1, p: 2, border: "1px solid #ddd", borderRadius: "8px", bgcolor: "#f9f9f9", textAlign: "left" }}>
                                            <Typography variant="body1"><strong>Price:</strong> {nft.price}</Typography>
                                            <Typography variant="body1"><strong>Creator:</strong> {nft.creator}</Typography>
                                            <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                                                <strong>Blockchain Address:</strong> {nft.blockchainAddress}
                                            </Typography>
                                        </Box>
                                    )}
                                </Card>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: "center", mt: 2 }}>
                            <Typography>No NFTs owned yet.</Typography>
                        </Box>
                    )}
                </Box>
            )}

            {/* Transaction History Section */}
            {activeTab === "history" && (
                <Box>
                    <Typography variant="h5" sx={{ mb: 2 }}>Transaction History</Typography>
                    {state.user.transactionHistory?.length > 0 ? (
                        state.user.transactionHistory.map((tx, index) => (
                            <Card key={index} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="body1">🛒 {tx.username} bought <strong>{tx.nftTitle}</strong></Typography>
                                    <Typography variant="body2" color="text.secondary">Date: {tx.date}</Typography>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Box sx={{ textAlign: "center", mt: 2 }}>
                            <Typography>No transactions found.</Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Container>
    );
};

export default Profile;
