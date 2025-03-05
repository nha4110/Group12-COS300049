import React, { useState, useEffect, createContext, useContext } from "react";
import { AppBar, Box, Toolbar, IconButton, Typography, Avatar, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { getWallet, createWallet } from "../api/wallet";
import { useAuth } from "../scripts/AuthContext";
import { ethers } from "ethers";

// ✅ Create Wallet Context
const WalletContext = createContext();

// Balance Provider to wrap the app and manage global balance state
export const BalanceProvider = ({ children }) => {
    const [balance, setBalance] = useState(() => {
        return parseFloat(localStorage.getItem("balance")) || 0;
    }); 

    // Update localStorage whenever balance changes
    useEffect(() => {
        localStorage.setItem("balance", balance.toString());
    }, [balance]);

    // Function to update balance with a minimum value of 0 to prevent negative values
    const updateBalance = (newBalance) => {
        setBalance(Math.max(0, newBalance)); // Ensure balance doesn't go below zero
    };

    return (
        <WalletContext.Provider value={{ wallet, balance, setWallet }}>
            {children}
        </WalletContext.Provider>
    );
};

// ✅ Custom Hook to use Wallet Context
export const useWallet = () => useContext(WalletContext);

// ✅ Updated AppBar Component
export default function AppBarComponent() {
    const navigate = useNavigate();
    const { state, dispatch } = useAuth();
    const { wallet, balance } = useWallet();
    const user = state.user;

    // ✅ Logout Function
    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        localStorage.removeItem("jwtToken");  // ✅ Clear token
        localStorage.removeItem("user");      // ✅ Clear user data
        localStorage.removeItem("wallet");    // ✅ Clear wallet data
        navigate("/login");
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" sx={{ background: "#4A148C" }}> {/* Changed to Purple */}
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    {/* Home Button - Navigates to the home page */}
                    <IconButton size="large" edge="start" color="inherit" aria-label="home" onClick={() => navigate("/")}>
                        <HomeIcon />
                    </IconButton>

                    {/* App Title */}
                    <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "left" }}>
                        NFT Marketplace
                    </Typography>

                    {/* Balance Input Field - Allows users to modify their ETH balance */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <TextField
                            variant="standard"
                            type="number"
                            value={balance}
                            onChange={(e) => {
                                const newBalance = Number(e.target.value);
                                setBalance(newBalance >= 0 ? newBalance : 0); // Prevent negative values
                            }}
                            inputProps={{
                                min: 0, // Ensures the input does not go below zero
                                style: { color: "white", textAlign: "right", width: "100%" },
                            }}
                            sx={{
                                width: { xs: "60px", sm: "80px" }, // Adjusts width based on screen size
                                mr: 1,
                            }}
                        />
                        <Typography variant="body1" sx={{ color: "white" }}>ETH</Typography>
                    </Box>

                    {/* Profile Icon - Navigates to the user profile page */}
                    <IconButton onClick={() => navigate("/profile")} sx={{ ml: { xs: 1, sm: 2 } }}>
                        <Avatar />
                    </IconButton>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
