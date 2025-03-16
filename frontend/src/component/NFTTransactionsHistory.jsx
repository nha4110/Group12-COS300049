{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useState, useEffect } from "react"; // React hooks for state and lifecycle management
import { Paper, Typography, List, ListItem, Box, CircularProgress } from "@mui/material"; // Material-UI components
import { motion } from "framer-motion"; // For animations
import axios from "axios"; // HTTP client for API requests
import { useAuth } from "../scripts/AuthContext"; // Custom hook for authentication context

const API_URL = "http://localhost:8081"; // Backend API base URL

const NFTTransactionsHistory = () => {
  const { state } = useAuth(); // Access authentication state
  const user = state.user; // Current user object
  const [transactions, setTransactions] = useState([]); // State for storing NFT transactions
  const [visibleTx, setVisibleTx] = useState({}); // State to toggle visibility of transaction hashes
  const [error, setError] = useState(null); // State to store error messages
  const [loading, setLoading] = useState(true); // State to track loading status

  const walletAddress = user?.walletAddress || user?.wallet_address || user?.wallet; // User's wallet address with fallbacks

  // Fetch transactions when component mounts or walletAddress changes
  useEffect(() => {
    if (!walletAddress) {
      setError("No wallet address available. Please log in."); // Check if wallet address exists
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("jwtToken"); // Retrieve JWT token from local storage
        if (!token) {
          throw new Error("No JWT token found. Please log in."); // Validate token presence
        }

        console.log(`Fetching NFT transactions for wallet: ${walletAddress}`);
        const response = await axios.get(`${API_URL}/api/nft-transactions`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        });

        console.log("API response data:", JSON.stringify(response.data, null, 2));
        if (response.data && Array.isArray(response.data)) {
          setTransactions(response.data); // Update transactions state with fetched data
          setError(null); // Clear any previous errors
        } else {
          throw new Error("Invalid response format from API"); // Validate response format
        }
      } catch (err) {
        console.error("Error fetching NFT transactions:", err.message);
        setError(err.response?.data?.message || err.message || "Failed to fetch transactions"); // Set error message
      } finally {
        setLoading(false); // Stop loading regardless of outcome
      }
    };

    fetchTransactions();

    // Listen for NFT transaction updates
    const handleNftUpdate = () => {
      console.log("NFT transaction updated, refetching...");
      fetchTransactions(); // Refetch transactions on update event
    };
    window.addEventListener("nftTransactionUpdated", handleNftUpdate);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("nftTransactionUpdated", handleNftUpdate);
    };
  }, [walletAddress]);

  // Toggle visibility of full transaction hash for a specific transaction
  const toggleTxVisibility = (index) => {
    setVisibleTx((prev) => ({ ...prev, [index]: !prev[index] })); // Toggle visibility state for the given index
  };

  // Check if user is authenticated
  if (!user) {
    return (
      <Typography variant="h6" color="error" sx={{ textAlign: "center", mt: 4 }}>
        Unauthorized Access {/* Display message if not logged in */}
      </Typography>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Animated container */}
      <Paper
        elevation={4}
        sx={{
          p: 4, // Padding
          borderRadius: 3, // Rounded corners
          background: "linear-gradient(135deg, #f9f9f9, #e8ecef)", // Gradient background
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)", // Custom shadow
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2c3e50", mb: 2 }}>
          NFT Transactions History {/* Title */}
        </Typography>
        <Typography variant="body1" sx={{ color: "#34495e", mb: 3 }}>
          Wallet Address: {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : "Not set"}
          {/* Display shortened wallet address */}
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress color="primary" /> {/* Loading spinner */}
          </Box>
        ) : error ? (
          <Typography variant="body1" sx={{ color: "error.main", textAlign: "center" }}>
            {error} {/* Error message */}
          </Typography>
        ) : (
          <List>
            {transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }} // Start off-screen and faded
                  animate={{ opacity: 1, y: 0 }} // Fade in and slide up
                  transition={{ duration: 0.5, delay: index * 0.1 }} // Staggered animation
                >
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3, // Padding
                      mb: 2, // Margin bottom
                      borderRadius: 2, // Rounded corners
                      background: "#fff", // White background
                      "&:hover": { boxShadow: "0 4px 20px rgba(110, 142, 251, 0.3)" }, // Hover effect
                    }}
                  >
                    <ListItem sx={{ display: "block" }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2c3e50" }}>
                        {tx.transaction_type === "Purchase" ? "Purchased" : "Transferred"} {tx.nft_name || "Unknown NFT"} (Token ID: {tx.token_id})
                        {/* Transaction type and NFT details */}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body1" sx={{ color: "#34495e" }}>
                          <strong style={{ color: "#16a085" }}>From:</strong> {tx.from.substring(0, 6)}...{tx.from.substring(tx.from.length - 4)}
                          {/* Sender address (shortened) */}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#34495e" }}>
                          <strong style={{ color: "#c0392b" }}>To:</strong> {tx.to.substring(0, 6)}...{tx.to.substring(tx.to.length - 4)}
                          {/* Recipient address (shortened) */}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#34495e" }}>
                          <strong style={{ color: "#8e44ad" }}>Amount:</strong> {tx.amount} ETH
                          {/* Transaction amount */}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, color: "#6e8efb", cursor: "pointer", textDecoration: "underline" }}
                          onClick={() => toggleTxVisibility(index)} // Toggle hash visibility on click
                        >
                          <strong>Tx Hash:</strong> {visibleTx[index] ? `${tx.tx_hash.substring(0, 6)}...${tx.tx_hash.substring(tx.tx_hash.length - 4)}` : "Click to show"}
                          {/* Transaction hash (toggleable) */}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#34495e" }}>
                          <strong>Date:</strong> {new Date(tx.date).toLocaleString()} {/* Transaction date */}
                        </Typography>
                      </Box>
                    </ListItem>
                  </Paper>
                </motion.div>
              ))
            ) : (
              <Typography variant="body1" sx={{ textAlign: "center", color: "#7f8c8d" }}>
                No NFT transactions found. {/* Message when no transactions exist */}
              </Typography>
            )}
          </List>
        )}
      </Paper>
    </motion.div>
  );
};

export default NFTTransactionsHistory;
