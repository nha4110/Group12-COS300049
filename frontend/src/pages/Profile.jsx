import React, { useState, useEffect } from "react";
import { Container, Typography, Paper, Button, TextField, Tabs, Tab, Box } from "@mui/material";
import { getWalletBalance } from "../api/wallet";
import { useAuth } from "../scripts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ethers } from 'ethers';
import Web3 from 'web3';

const Profile = () => {
    const { state, dispatch } = useAuth();
    const navigate = useNavigate();
    const user = state.user;
    const accountId = user?.accountid;

    const [walletAddress, setWalletAddress] = useState("");
    const [balance, setBalance] = useState("Loading...");
    const [recipientAddress, setRecipientAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [gasPrice, setGasPrice] = useState("0.000000002");
    const [balanceAfter, setBalanceAfter] = useState("");
    const [currentTab, setCurrentTab] = useState("NFT Collection");

    const [web3, setWeb3] = useState(null);

    useEffect(() => {
        if (user && user.walletAddress) {
            setWalletAddress(user.walletAddress);
            fetchBalance(user.walletAddress);
        }

        if (window.ethereum) {
            setWeb3(new Web3(window.ethereum));
        }
    }, [user]);

    const fetchBalance = async (walletAddress) => {
        try {
            const balanceData = await getWalletBalance(walletAddress);
            if (balanceData.success) {
                setBalance(balanceData.balance);
            } else {
                console.error("Error fetching balance:", balanceData.message || "Unknown error");
                setBalance("Failed to fetch balance");
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
            setBalance("Failed to fetch balance");
        }
    };

    const sendDirectETH = async () => {
        try {
            if (!ethers.isAddress(recipientAddress)) {
                alert("Invalid recipient address.");
                return;
            }

            if (!web3) {
                alert("Please install MetaMask or another web3 provider.");
                return;
            }

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const senderAddress = accounts[0];

            const amountWei = web3.utils.toWei(amount, 'ether');

            const transactionObject = {
                from: senderAddress,
                to: recipientAddress,
                value: amountWei,
                gas: 21000,
            };

            web3.eth.sendTransaction(transactionObject)
                .on('transactionHash', (hash) => {
                    alert(`Transaction successful! TX Hash: ${hash}`);
                    fetchBalance(walletAddress);
                })
                .on('error', (error) => {
                    alert(`Transaction failed: ${error.message}`);
                });
        } catch (error) {
            alert(`Transaction failed: ${error.message}`);
        }
    };

    const handleTabChange = (event, newTab) => {
        setCurrentTab(newTab);
    };

    useEffect(() => {
        if (balance && amount && gasPrice && !isNaN(balance) && !isNaN(amount) && !isNaN(gasPrice)) {
            const balanceNum = parseFloat(balance);
            const amountNum = parseFloat(amount);
            const gasNum = parseFloat(gasPrice);
            const newBalance = balanceNum - amountNum - gasNum;
            setBalanceAfter(newBalance.toFixed(18));
        } else {
            setBalanceAfter("");
        }
    }, [balance, amount, gasPrice]);

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
                <Typography variant="h6">Balance: {balance} ETH</Typography>
            </Paper>

            <Box sx={{ width: '100%', marginTop: 4 }}>
                <Tabs value={currentTab} onChange={handleTabChange} centered>
                    <Tab label="NFT Collection" value="NFT Collection" />
                    <Tab label="Balance Sender" value="Balance Sender" />
                </Tabs>
            </Box>

            {currentTab === "NFT Collection" && (
                <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
                    <Typography variant="h6">NFT Collection</Typography>
                </Paper>
            )}

            {currentTab === "Balance Sender" && (
                <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
                    <Typography variant="h6">Send ETH (Direct)</Typography>
                    <TextField label="Your Wallet Address" fullWidth margin="normal" value={walletAddress} InputProps={{ readOnly: true }} />
                    <TextField label="Recipient Address" fullWidth margin="normal" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} />
                    <TextField label="Amount (ETH)" fullWidth margin="normal" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    {balanceAfter && (
                        <Typography variant="body1" sx={{ marginTop: 2 }}>
                            Balance After Send: {balanceAfter} ETH
                        </Typography>
                    )}
                    <Button variant="contained" color="primary" onClick={sendDirectETH}>
                        Send
                    </Button>
                </Paper>
            )}

            <Button variant="contained" color="error" sx={{ marginTop: 3 }} onClick={() => { dispatch({ type: "LOGOUT" }); localStorage.removeItem("user_wallet"); localStorage.removeItem("username"); navigate("/login"); }}>
                Logout
            </Button>
        </Container>
    );
};

export default Profile;