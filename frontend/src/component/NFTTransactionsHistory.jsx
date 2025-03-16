{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useState, useEffect } from "react";
import { Paper, Typography, List, ListItem, Box, CircularProgress } from "@mui/material";
import { motion } from "framer-motion"; // For animations
import axios from "axios";
import { useAuth } from "../scripts/AuthContext";

const API_URL = "http://localhost:8081";

const NFTTransactionsHistory = () => {
  const { state } = useAuth();
  const user = state.user;
  const [transactions, setTransactions] = useState([]);
  const [visibleTx, setVisibleTx] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const walletAddress = user?.walletAddress || user?.wallet_address || user?.wallet;

  useEffect(() => {
    if (!walletAddress) {
      setError("No wallet address available. Please log in.");
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          throw new Error("No JWT token found. Please log in.");
        }

        console.log(`Fetching NFT transactions for wallet: ${walletAddress}`);
        const response = await axios.get(`${API_URL}/api/nft-transactions`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API response data:", JSON.stringify(response.data, null, 2));
        if (response.data && Array.isArray(response.data)) {
          setTransactions(response.data);
          setError(null);
        } else {
          throw new Error("Invalid response format from API");
        }
      } catch (err) {
        console.error("Error fetching NFT transactions:", err.message);
        setError(err.response?.data?.message || err.message || "Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    const handleNftUpdate = () => {
      console.log("NFT transaction updated, refetching...");
      fetchTransactions();
    };
    window.addEventListener("nftTransactionUpdated", handleNftUpdate);

    return () => {
      window.removeEventListener("nftTransactionUpdated", handleNftUpdate);
    };
  }, [walletAddress]);

  const toggleTxVisibility = (index) => {
    setVisibleTx((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (!user) {
    return (
      <Typography variant="h6" color="error" sx={{ textAlign: "center", mt: 4 }}>
        Unauthorized Access
      </Typography>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #f9f9f9, #e8ecef)",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2c3e50", mb: 2 }}>
          NFT Transactions History
        </Typography>
        <Typography variant="body1" sx={{ color: "#34495e", mb: 3 }}>
          Wallet Address: {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : "Not set"}
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Typography variant="body1" sx={{ color: "error.main", textAlign: "center" }}>
            {error}
          </Typography>
        ) : (
          <List>
            {transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      mb: 2,
                      borderRadius: 2,
                      background: "#fff",
                      "&:hover": { boxShadow: "0 4px 20px rgba(110, 142, 251, 0.3)" },
                    }}
                  >
                    <ListItem sx={{ display: "block" }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2c3e50" }}>
                        {tx.transaction_type === "Purchase" ? "Purchased" : "Transferred"} {tx.nft_name || "Unknown NFT"} (Token ID: {tx.token_id})
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body1" sx={{ color: "#34495e" }}>
                          <strong style={{ color: "#16a085" }}>From:</strong> {tx.from.substring(0, 6)}...{tx.from.substring(tx.from.length - 4)}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#34495e" }}>
                          <strong style={{ color: "#c0392b" }}>To:</strong> {tx.to.substring(0, 6)}...{tx.to.substring(tx.to.length - 4)}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#34495e" }}>
                          <strong style={{ color: "#8e44ad" }}>Amount:</strong> {tx.amount} ETH
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, color: "#6e8efb", cursor: "pointer", textDecoration: "underline" }}
                          onClick={() => toggleTxVisibility(index)}
                        >
                          <strong>Tx Hash:</strong> {visibleTx[index] ? `${tx.tx_hash.substring(0, 6)}...${tx.tx_hash.substring(tx.tx_hash.length - 4)}` : "Click to show"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#34495e" }}>
                          <strong>Date:</strong> {new Date(tx.date).toLocaleString()}
                        </Typography>
                      </Box>
                    </ListItem>
                  </Paper>
                </motion.div>
              ))
            ) : (
              <Typography variant="body1" sx={{ textAlign: "center", color: "#7f8c8d" }}>
                No NFT transactions found.
              </Typography>
            )}
          </List>
        )}
      </Paper>
    </motion.div>
  );
};

export default NFTTransactionsHistory;