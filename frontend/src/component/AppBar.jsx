{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useEffect, useState, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
} from "@mui/material";
import { useAuth } from "../scripts/AuthContext"; // Custom hook for authentication context
import { useLocation, useNavigate } from "react-router-dom"; // React Router hooks for navigation
import { ethers } from "ethers"; // Ethers.js for blockchain interactions
import { getWalletBalance } from "../api/wallet"; // API call to fetch wallet balance
import { motion } from "framer-motion"; // For animations
import { Menu as MenuIcon, Home, Person, History, Logout } from "@mui/icons-material"; // Material-UI icons

const SearchAppBar = () => {
  const { state, logout } = useAuth(); // Access auth state and logout function
  const [balance, setBalance] = useState(null); // State for wallet balance
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar visibility
  const location = useLocation(); // Get current route location
  const navigate = useNavigate(); // Navigation function
  const walletAddress = state?.user?.walletAddress || state?.user?.wallet_address; // User's wallet address

  const [anchorEl, setAnchorEl] = useState(null); // Anchor element for profile menu
  const open = Boolean(anchorEl); // Boolean to control menu open state

  // Open profile menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close profile menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Fetch wallet balance from backend and blockchain
  const fetchBalance = useCallback(async () => {
    if (!walletAddress) {
      setBalance(null);
      return;
    }
    try {
      let backendBalance = null;
      let blockchainBalance = null;
  
      // Fetch from backend
      const balanceData = await getWalletBalance(walletAddress);
      if (balanceData?.success && balanceData.balance) {
        backendBalance = parseFloat(balanceData.balance).toFixed(4);
        console.log(`✅ Backend balance for ${walletAddress}: ${backendBalance} ETH`);
      } else {
        console.warn("⚠️ Backend fetch failed or no balance returned:", balanceData?.message || "No data");
      }
  
      // Fetch from blockchain as fallback
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balanceWei = await provider.getBalance(walletAddress, "latest");
        blockchainBalance = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);
        console.log(`🔗 Blockchain balance for ${walletAddress}: ${blockchainBalance} ETH`);
      }
  
      // Decide which balance to use
      if (backendBalance) {
        setBalance(backendBalance);
        if (blockchainBalance && Math.abs(blockchainBalance - backendBalance) > 0.01) {
          console.warn(`⚠️ Balance mismatch: Backend (${backendBalance} ETH) vs Blockchain (${blockchainBalance} ETH)`);
        }
      } else if (blockchainBalance) {
        setBalance(blockchainBalance);
        console.warn("⚠️ Falling back to blockchain balance due to missing backend data.");
      } else {
        setBalance("Error");
        console.error("❌ No balance data available from backend or blockchain.");
      }
    } catch (error) {
      console.error("❌ Error fetching balance:", error.message);
      setBalance("Error");
    }
  }, [walletAddress]);

  // Effect to fetch balance on mount or user change, and listen for balance updates
  useEffect(() => {
    if (state.user) {
      fetchBalance();
    } else {
      setBalance(null);
    }

    const handleBalanceUpdate = () => {
      fetchBalance();
    };
    window.addEventListener("balanceUpdated", handleBalanceUpdate);
    return () => window.removeEventListener("balanceUpdated", handleBalanceUpdate);
  }, [state.user, fetchBalance]);

  // Handle logout action
  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/login");
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppBar
      position="static" // Fixed position at top
      sx={{
        background: "linear-gradient(90deg, #2c3e50, #34495e)", // Gradient background
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)", // Shadow effect
        padding: "0 16px", // Horizontal padding
      }}
    >
      <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Sidebar Toggle Button */}
        <IconButton
          onClick={toggleSidebar}
          sx={{ color: "white", "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* App Title */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1, // Takes available space
            fontWeight: "bold",
            color: "white",
            cursor: "pointer",
            "&:hover": { color: "#6e8efb" }, // Only color change on hover
          }}
          onClick={() => navigate("/")} // Navigate to home
        >
          NFT Marketplace
        </Typography>

        {/* ETH Balance */}
        {state.user && balance !== null && (
          <Typography
            variant="body1"
            sx={{
              mr: 3, // Margin right
              color: "#27ae60", // Green color
              fontWeight: "bold",
              bgcolor: "rgba(255, 255, 255, 0.1)", // Light background
              p: 1, // Padding
              borderRadius: 1, // Rounded corners
            }}
          >
            <strong>ETH:</strong> {balance === "Error" ? "Error" : `${balance} ETH`}
          </Typography>
        )}

        {/* Profile Menu */}
        {state.user ? (
          <>
            <IconButton
              onClick={handleMenuOpen}
              component={motion.div}
              whileHover={{ scale: 1.1 }} // Scale up on hover
              whileTap={{ scale: 0.95 }} // Scale down on tap
            >
              <Avatar
                sx={{
                  bgcolor: "#6e8efb", // Background color
                  fontWeight: "bold",
                  border: "2px solid white", // White border
                }}
              >
                {state?.user?.username ? state.user.username.charAt(0).toUpperCase() : "?"}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  borderRadius: 2, // Rounded corners
                  background: "linear-gradient(135deg, #ffffff, #f0f4ff)", // Gradient background
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Shadow effect
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  navigate("/profile");
                  handleMenuClose();
                }}
                sx={{ color: "#34495e", "&:hover": { bgcolor: "#6e8efb", color: "white" } }}
              >
                Profile
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{ color: "#34495e", "&:hover": { bgcolor: "#c0392b", color: "white" } }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Typography
            variant="body1"
            sx={{
              color: "#6e8efb", // Blue color
              cursor: "pointer",
              fontWeight: "bold",
              "&:hover": { color: "#a777e3" }, // Purple on hover
            }}
            onClick={() => navigate("/login")} // Navigate to login
            component={motion.div}
            whileHover={{ scale: 1.05 }} // Slight scale on hover
          >
            Login
          </Typography>
        )}
      </Toolbar>

      {/* Sidebar Drawer */}
      <Drawer anchor="left" open={sidebarOpen} onClose={toggleSidebar}>
        <Box
          sx={{
            width: 250, // Fixed width
            background: "linear-gradient(135deg, #2c3e50, #34495e)", // Gradient background
            height: "100%", // Full height
            color: "white",
            p: 2, // Padding
          }}
          component={motion.div}
          initial={{ x: -250 }} // Start off-screen
          animate={{ x: 0 }} // Slide in
          exit={{ x: -250 }} // Slide out
          transition={{ duration: 0.5 }} // Animation duration
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 2, textAlign: "center", color: "#6e8efb" }}
          >
            Menu
          </Typography>
          <Divider sx={{ bgcolor: "#7f8c8d", mb: 2 }} /> {/* Divider line */}
          <List>
            <ListItem
              onClick={() => {
                navigate("/");
                toggleSidebar();
              }}
              sx={{
                borderRadius: 2,
                "&:hover": { bgcolor: "#16a085", cursor: "pointer" }, // Teal on hover
                mb: 1, // Margin bottom
              }}
              component={motion.div}
              whileHover={{ scale: 1.03 }} // Slight scale on hover
            >
              <Home sx={{ mr: 1 }} /> {/* Home icon */}
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem
              onClick={() => {
                navigate("/profile");
                toggleSidebar();
              }}
              sx={{
                borderRadius: 2,
                "&:hover": { bgcolor: "#16a085", cursor: "pointer" },
                mb: 1,
              }}
              component={motion.div}
              whileHover={{ scale: 1.03 }}
            >
              <Person sx={{ mr: 1 }} /> {/* Person icon */}
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem
              onClick={() => {
                navigate("/history");
                toggleSidebar();
              }}
              sx={{
                borderRadius: 2,
                "&:hover": { bgcolor: "#16a085", cursor: "pointer" },
                mb: 1,
              }}
              component={motion.div}
              whileHover={{ scale: 1.03 }}
            >
              <History sx={{ mr: 1 }} /> {/* History icon */}
              <ListItemText primary="History" />
            </ListItem>
            {state.user && (
              <ListItem
                onClick={() => {
                  handleLogout();
                  toggleSidebar();
                }}
                sx={{
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#c0392b", cursor: "pointer" }, // Red on hover
                }}
                component={motion.div}
                whileHover={{ scale: 1.03 }}
              >
                <Logout sx={{ mr: 1 }} /> {/* Logout icon */}
                <ListItemText primary="Logout" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default SearchAppBar;
