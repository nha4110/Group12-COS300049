{/*
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Lu Nhat Hoang - 105234956
*/}

import React, { useState, createContext, useContext, useEffect } from "react";
import { AppBar, Box, Toolbar, IconButton, Typography, Avatar, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

// Create Context for Balance (Global State)
const BalanceContext = createContext();

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
        <BalanceContext.Provider value={{ balance, setBalance: updateBalance }}>
            {children}
        </BalanceContext.Provider>
    );
};

// Custom hook to use the balance context in other components
export const useBalance = () => useContext(BalanceContext);

// Main AppBar Component
export default function AppBarComponent() {
    const navigate = useNavigate();
    const { balance, setBalance } = useBalance();

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    {/* Home Button - Navigates to the home page */}
                    <IconButton size="large" edge="start" color="inherit" aria-label="home" onClick={() => navigate("/")}>
                        <HomeIcon />
                    </IconButton>

                    {/* App Title - Always Visible */}
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
