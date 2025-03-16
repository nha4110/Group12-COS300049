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
import { useAuth } from "../scripts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { getWalletBalance } from "../api/wallet";
import { motion } from "framer-motion"; // For animations
import { Menu as MenuIcon, Home, Person, History, Logout } from "@mui/icons-material"; // Icons

const SearchAppBar = () => {
  const { state, logout } = useAuth();
  const [balance, setBalance] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const walletAddress = state?.user?.walletAddress || state?.user?.wallet_address;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const fetchBalance = useCallback(async () => {
    if (!walletAddress) {
      setBalance(null);
      return;
    }
    try {
      let backendBalance = null;
      let blockchainBalance = null;

      const balanceData = await getWalletBalance(walletAddress);
      if (balanceData?.success) {
        backendBalance = parseFloat(balanceData.balance).toFixed(4);
        console.log(`✅ Backend balance for ${walletAddress}: ${backendBalance} ETH`);
        setBalance(backendBalance);
      } else {
        console.warn("⚠️ Backend fetch failed, using blockchain balance.");
      }

      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balanceWei = await provider.getBalance(walletAddress, "latest");
        blockchainBalance = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);
        console.log(`🔗 Blockchain balance for ${walletAddress}: ${blockchainBalance} ETH`);
      }

      if (!balanceData?.success || blockchainBalance !== backendBalance) {
        console.warn("⚠️ Using blockchain balance due to mismatch.");
        setBalance(blockchainBalance);
      }
    } catch (error) {
      console.error("❌ Error fetching balance:", error);
      setBalance("Error");
    }
  }, [walletAddress]);

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

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #2c3e50, #34495e)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
        padding: "0 16px",
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
            flexGrow: 1,
            fontWeight: "bold",
            color: "white",
            cursor: "pointer",
            "&:hover": { color: "#6e8efb" }, // Only color change on hover
          }}
          onClick={() => navigate("/")}
        >
          NFT Marketplace
        </Typography>

        {/* ETH Balance */}
        {state.user && balance !== null && (
          <Typography
            variant="body1"
            sx={{
              mr: 3,
              color: "#27ae60",
              fontWeight: "bold",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              p: 1,
              borderRadius: 1,
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
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar
                sx={{
                  bgcolor: "#6e8efb",
                  fontWeight: "bold",
                  border: "2px solid white",
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
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #ffffff, #f0f4ff)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
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
              color: "#6e8efb",
              cursor: "pointer",
              fontWeight: "bold",
              "&:hover": { color: "#a777e3" },
            }}
            onClick={() => navigate("/login")}
            component={motion.div}
            whileHover={{ scale: 1.05 }}
          >
            Login
          </Typography>
        )}
      </Toolbar>

      {/* Sidebar Drawer */}
      <Drawer anchor="left" open={sidebarOpen} onClose={toggleSidebar}>
        <Box
          sx={{
            width: 250,
            background: "linear-gradient(135deg, #2c3e50, #34495e)",
            height: "100%",
            color: "white",
            p: 2,
          }}
          component={motion.div}
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          exit={{ x: -250 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 2, textAlign: "center", color: "#6e8efb" }}
          >
            Menu
          </Typography>
          <Divider sx={{ bgcolor: "#7f8c8d", mb: 2 }} />
          <List>
            <ListItem
              onClick={() => {
                navigate("/");
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
              <Home sx={{ mr: 1 }} />
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
              <Person sx={{ mr: 1 }} />
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
              <History sx={{ mr: 1 }} />
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
                  "&:hover": { bgcolor: "#c0392b", cursor: "pointer" },
                }}
                component={motion.div}
                whileHover={{ scale: 1.03 }}
              >
                <Logout sx={{ mr: 1 }} />
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