import React, { useEffect, useState, useCallback } from "react";
import { AppBar, Toolbar, Typography, Avatar, Menu, MenuItem, IconButton, Drawer, List, ListItem, ListItemText, Divider } from "@mui/material";
import { useAuth } from "../scripts/AuthContext";
import { getWalletBalance } from "../api/wallet";
import { useLocation, useNavigate } from "react-router-dom";

const SearchAppBar = () => {
    const { state, logout } = useAuth();
    const [balance, setBalance] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const walletAddress = state?.user?.wallet_address;

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const fetchBalance = useCallback(async () => {
        if (!walletAddress) return;
        try {
            const response = await getWalletBalance(walletAddress);
            if (response.success) {
                const newBalance = response.balance || "0.0000";
                setBalance(newBalance);
                localStorage.setItem("ethBalance", newBalance);
            }
        } catch (error) {
            console.error("❌ Error fetching ETH balance:", error);
        }
    }, [walletAddress]);

    useEffect(() => {
        const storedBalance = localStorage.getItem("ethBalance");
        if (state.user) {
            if (storedBalance) {
                setBalance(storedBalance);
            } else {
                fetchBalance();
            }
        } else {
            setBalance(null);
            localStorage.removeItem("ethBalance");
        }
    }, [state.user, fetchBalance]);

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate("/login");
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: "#2c3e50", padding: "8px 16px" }}>
            <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <IconButton onClick={toggleSidebar} sx={{ color: "white" }}>
                    <Typography variant="h6">☰</Typography>
                </IconButton>

                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, fontWeight: "bold", cursor: "pointer" }}
                    onClick={() => navigate("/")}
                >
                    NFT Marketplace
                </Typography>

                {state.user && balance !== null && (
                    <Typography variant="body1" sx={{ marginRight: "20px" }}>
                        <strong>ETH Balance:</strong> {balance}
                    </Typography>
                )}

                {state.user ? (
                    <>
                        <IconButton onClick={handleMenuOpen}>
                            <Avatar sx={{ bgcolor: "#f1c40f", fontWeight: "bold" }}>
                                {state?.user?.username ? state.user.username.charAt(0).toUpperCase() : "?"}
                            </Avatar>
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                            <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </>
                ) : (
                    <Typography variant="body1" sx={{ cursor: "pointer" }} onClick={() => navigate("/login")}>
                        Login
                    </Typography>
                )}
            </Toolbar>

            <Drawer anchor="left" open={sidebarOpen} onClose={toggleSidebar}>
                <List sx={{ width: 250, backgroundColor: "#34495e", height: "100%", paddingTop: "20px" }}>
                    <ListItem
                        onClick={() => navigate("/")}
                        sx={{ color: "white", padding: "15px", "&:hover": { backgroundColor: "#16a085", cursor: "pointer" } }}
                    >
                        <ListItemText primary="Home" />
                    </ListItem>
                    <Divider sx={{ backgroundColor: "#7f8c8d" }} />
                    <ListItem
                        onClick={() => navigate("/profile")}
                        sx={{ color: "white", padding: "15px", "&:hover": { backgroundColor: "#16a085", cursor: "pointer" } }}
                    >
                        <ListItemText primary="Profile" />
                    </ListItem>
                    <Divider sx={{ backgroundColor: "#7f8c8d" }} />
                    <ListItem
                        onClick={() => navigate("/history")}
                        sx={{ color: "white", padding: "15px", "&:hover": { backgroundColor: "#16a085", cursor: "pointer" } }}
                    >
                        <ListItemText primary="History" />
                    </ListItem>
                </List>
            </Drawer>
        </AppBar>
    );
};

export default SearchAppBar;