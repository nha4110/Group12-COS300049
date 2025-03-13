import React, { useEffect, useState, useCallback } from "react";
import { AppBar, Toolbar, Typography, Avatar, Menu, MenuItem, IconButton, Drawer, List, ListItem, ListItemText, Divider } from "@mui/material";
import { useAuth } from "../scripts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";

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
    if (!walletAddress) {
      setBalance(null);
      return;
    }

    try {
      // Try backend first
      const response = await fetch(`http://localhost:8081/wallet/balance/${walletAddress}`);
      const data = await response.json();
      if (data.success) {
        const backendBalance = parseFloat(data.balance).toFixed(4);
        setBalance(backendBalance);
        // Verify with blockchain
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balanceWei = await provider.getBalance(walletAddress);
          const balanceEth = ethers.formatEther(balanceWei);
          const blockchainBalance = parseFloat(balanceEth).toFixed(4);
          if (backendBalance !== blockchainBalance) {
            console.warn("Backend balance mismatch with blockchain:", backendBalance, blockchainBalance);
            setBalance(blockchainBalance); // Trust blockchain
          }
        }
        return;
      }
      throw new Error("Backend fetch failed");
    } catch (backendError) {
      console.warn("Backend balance fetch failed, falling back to ethers.js:", backendError.message);
      try {
        if (!window.ethereum) throw new Error("MetaMask not detected");
        const provider = new ethers.BrowserProvider(window.ethereum);
        let balanceEth = null;
        // Retry up to 3 times with 1-second delay to ensure sync
        for (let i = 0; i < 3; i++) {
          const balanceWei = await provider.getBalance(walletAddress);
          balanceEth = ethers.formatEther(balanceWei);
          if (parseFloat(balanceEth) > 0 || i === 2) break; // Exit if non-zero or last attempt
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        setBalance(parseFloat(balanceEth).toFixed(4));
      } catch (ethersError) {
        console.error("❌ Error fetching ETH balance:", ethersError);
        setBalance("Error");
      }
    }
  }, [walletAddress]);

  useEffect(() => {
    if (state.user) {
      fetchBalance();
    } else {
      setBalance(null);
    }

    // Listen for balance updates from Home.jsx
    const handleBalanceUpdate = () => {
      fetchBalance();
    };
    window.addEventListener("balanceUpdated", handleBalanceUpdate);

    // Cleanup
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
            <strong>ETH Balance:</strong> {balance === "Error" ? "Error" : `${balance} ETH`}
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