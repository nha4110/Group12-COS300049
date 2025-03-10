import React, { useState, useEffect } from "react";
import { Container, Typography, Paper, Button, TextField } from "@mui/material";
import { useAuth } from "../scripts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getWalletBalance, sendTransaction } from "../api/wallet";
import { ethers } from 'ethers';

const Profile = () => {
    const { state, dispatch } = useAuth();
    const navigate = useNavigate();
    const user = state.user;
    const accountId = user?.accountid;

    // Wallet & balance state
    const [walletAddress, setWalletAddress] = useState("");
    const [balance, setBalance] = useState("Loading...");

    // Transfer state
    const [recipientAddress, setRecipientAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (user && user.walletAddress) {
            setWalletAddress(user.walletAddress); // Set wallet address from user object
            fetchBalance(user.walletAddress);
        }
    }, [user]);

    const fetchBalance = async (walletAddress) => {
        try {
            const balanceData = await getWalletBalance(walletAddress);
            if (balanceData.success) {
                setBalance(balanceData.balance); // Just set the balance without appending " ETH"
            } else {
                console.error("Error fetching balance:", balanceData.message || "Unknown error");
                setBalance("Failed to fetch balance");
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
            setBalance("Failed to fetch balance");
        }
    };

    // ✅ Handle ETH transfer
    const handleSendTransaction = async () => {
        try {
            // Validate recipient address
            if (!ethers.utils.isAddress(recipientAddress)) {
                alert("Invalid recipient address.");
                return;
            }

            console.log("Sending transaction request:", {
                sender: walletAddress,
                recipient: recipientAddress,
                amount: amount,
            });

            // Make API request to backend to handle transfer
            const result = await sendTransaction({
                sender: walletAddress,
                recipient: recipientAddress,
                amount: amount,
            });
            if (result.success) {
                alert(`Transaction successful! TX Hash: ${result.txHash}`);
                // Optionally update balance after successful transfer
                fetchBalance(walletAddress);
            } else {
                alert("Transaction failed: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            alert("Transaction failed: " + error.message);
        }
    };

    if (!user) {
        return <Typography variant="h6" color="error">Unauthorized Access</Typography>;
    }

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 3, marginTop: 4, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>Profile</Typography>
                <Typography variant="h6">Account ID: {accountId}</Typography>
                <Typography variant="h6">Username: {user.username}</Typography>
                <Typography variant="h6">Email: {user.email}</Typography>
                <Typography variant="h6">Wallet Address: {walletAddress}</Typography>
                <Typography variant="h6">Balance: {balance} ETH</Typography> {/* Append " ETH" here */}

                {/* Transfer ETH Section */}
                <TextField
                    fullWidth
                    label="Recipient Wallet Address"
                    variant="outlined"
                    margin="normal"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Amount (ETH)"
                    variant="outlined"
                    margin="normal"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: 2 }}
                    onClick={handleSendTransaction}
                >
                    Send ETH
                </Button>

                {message && <Typography variant="body1" color="success" sx={{ marginTop: 2 }}>{message}</Typography>}

                {/* Logout Button */}
                <Button
                    variant="contained"
                    color="error"
                    sx={{ marginTop: 3 }}
                    onClick={() => {
                        dispatch({ type: "LOGOUT" });
                        localStorage.removeItem("user");
                        navigate("/login");
                    }}
                >
                    Logout
                </Button>
            </Paper>
        </Container>
    );
};

export default Profile;