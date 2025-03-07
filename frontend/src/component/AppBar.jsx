import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Avatar, Menu, MenuItem, IconButton, Drawer, List, ListItem, ListItemText, Divider } from "@mui/material";
import { useAuth } from "../scripts/AuthContext";
import { getWalletBalance } from "../api/wallet"; 
import { useLocation, useNavigate } from "react-router-dom";

const SearchAppBar = () => {
    const { state, logout } = useAuth(); 
    const [balance, setBalance] = useState(null);  // Set to null initially to indicate no balance
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const walletAddress = state?.user?.wallet_address;

    // State for dropdown menu
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Fetch balance from Ganache only on specific routes
    useEffect(() => {
        const fetchBalance = async () => {
            if (!walletAddress) return;

            // Only fetch balance on specific routes
            const allowedRoutes = ["/home", "/market", "/profile", "/history"];
            if (!allowedRoutes.includes(location.pathname)) return;

            try {
                const response = await getWalletBalance(walletAddress);
                if (response.success) {
                    const newBalance = response.balance || "0.0000";
                    setBalance(newBalance);

                    // Save the fetched balance in localStorage
                    localStorage.setItem("ethBalance", newBalance);
                }
            } catch (error) {
                console.error("❌ Error fetching ETH balance:", error);
            }
        };

        // Fetch balance if the user is logged in
        if (state.user) {
            const storedBalance = localStorage.getItem("ethBalance");
            if (storedBalance) {
                // Use stored balance if it exists in localStorage
                setBalance(storedBalance);
            } else {
                // Fetch balance if not in localStorage
                fetchBalance();
            }
        } else {
            // If not logged in, ensure no balance is displayed
            setBalance(null);
        }
    }, [walletAddress, location.pathname, state.user]); // Re-run effect when user or route changes

    // Reset balance when user logs out or switches pages
    useEffect(() => {
        if (!state.user) {
            // Clear balance from localStorage and hide it
            localStorage.removeItem("ethBalance");
            setBalance(null);
        } else {
            const storedBalance = localStorage.getItem("ethBalance");
            if (storedBalance) {
                setBalance(storedBalance);
            }
        }
    }, [state.user, location.pathname]);

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate("/login");
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleBalanceChange = (newBalance) => {
        setBalance(newBalance);
        // Save the updated balance to localStorage
        localStorage.setItem("ethBalance", newBalance);
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: "#2c3e50", padding: "8px 16px" }}>
            <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* Sidebar Toggle Button */}
                <IconButton onClick={toggleSidebar} sx={{ color: "white" }}>
                    <Typography variant="h6">☰</Typography>
                </IconButton>

                {/* Title and NFT Marketplace */}
                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, fontWeight: "bold", cursor: "pointer" }}
                    onClick={() => navigate("/")}>
                    NFT Marketplace
                </Typography>

                {/* Show ETH balance only if user is logged in and balance exists */}
                {state.user && balance !== null && (
                    <Typography variant="body1" sx={{ marginRight: "20px" }}>
                        <strong>ETH Balance:</strong> {balance}
                    </Typography>
                )}

                {/* Avatar for dropdown */}
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

            {/* Sidebar Drawer */}
            <Drawer anchor="left" open={sidebarOpen} onClose={toggleSidebar}>
                <List sx={{ width: 250, backgroundColor: "#34495e", height: "100%", paddingTop: "20px" }}>
                    <ListItem
                        onClick={() => navigate("/home")}
                        sx={{
                            color: "white", 
                            padding: "15px", 
                            "&:hover": { backgroundColor: "#16a085", cursor: "pointer" }
                        }}>
                        <ListItemText primary="Home" />
                    </ListItem>
                    <Divider sx={{ backgroundColor: "#7f8c8d" }} />
                    <ListItem
                        onClick={() => navigate("/profile")}
                        sx={{
                            color: "white", 
                            padding: "15px", 
                            "&:hover": { backgroundColor: "#16a085", cursor: "pointer" }
                        }}>
                        <ListItemText primary="Profile" />
                    </ListItem>
                    <Divider sx={{ backgroundColor: "#7f8c8d" }} />
                    <ListItem
                        onClick={() => navigate("/history")}
                        sx={{
                            color: "white", 
                            padding: "15px", 
                            "&:hover": { backgroundColor: "#16a085", cursor: "pointer" }
                        }}>
                        <ListItemText primary="History" />
                    </ListItem>
                </List>
            </Drawer>
        </AppBar>
    );
};

export default SearchAppBar;
