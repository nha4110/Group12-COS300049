import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Avatar, Menu, MenuItem, IconButton } from "@mui/material";
import { useAuth } from "../scripts/AuthContext";
import { getWalletBalance } from "../api/wallet"; // ✅ Correct API import
import { useLocation, useNavigate } from "react-router-dom"; // ✅ Detect route & navigate

const SearchAppBar = () => {
    const { state, logout } = useAuth();
    const [balance, setBalance] = useState("0.0000");
    const location = useLocation();
    const navigate = useNavigate();
    const walletAddress = state?.user?.wallet_address;

    // ✅ State for dropdown menu
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // ✅ Fetch balance from Ganache
    useEffect(() => {
        const fetchBalance = async () => {
            if (!walletAddress) return;

            try {
                const response = await getWalletBalance(walletAddress);
                if (response.success) {
                    setBalance(response.balance || "0.0000");
                }
            } catch (error) {
                console.error("❌ Error fetching ETH balance:", error);
            }
        };

        fetchBalance();
    }, [walletAddress]);

    // ✅ Reset balance when user logs out or switches pages
    useEffect(() => {
        setBalance("0.0000");
    }, [state.user, location.pathname]);

    // ✅ Handle Logout
    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate("/login");
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: "#2c3e50", padding: "8px 16px" }}>
            <Toolbar>
                {/* NFT Marketplace Title */}
                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, fontWeight: "bold", cursor: "pointer" }}
                    onClick={() => navigate("/")}>
                    NFT Marketplace
                </Typography>

                {/* Display ETH Balance */}
                <Typography variant="body1" sx={{ marginRight: "20px" }}>
                    <strong>ETH Balance:</strong> {balance} ETH
                </Typography>

                {/* Avatar with Dropdown */}
                <IconButton onClick={handleMenuOpen}>
                    <Avatar sx={{ bgcolor: "#f1c40f", fontWeight: "bold" }}>
                        {state?.user?.username ? state.user.username.charAt(0).toUpperCase() : "?"}
                    </Avatar>
                </IconButton>

                {/* Dropdown Menu */}
                <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                    <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default SearchAppBar;
