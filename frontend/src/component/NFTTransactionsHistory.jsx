import React, { useState, useEffect } from "react";
import { Container, Typography, Paper, List, ListItem, Box } from "@mui/material";
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

  // Extract walletAddress consistently
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

    // Listen for updates from Market.jsx
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
    return <Typography variant="h6" color="error">Unauthorized Access</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          NFT Transactions History
        </Typography>
        <Typography variant="body1">
          Wallet Address: {walletAddress || "Not set"}
        </Typography>

        {loading ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading transactions...
          </Typography>
        ) : error ? (
          <Typography variant="body1" sx={{ mt: 2, color: "red" }}>
            {error}
          </Typography>
        ) : (
          <List sx={{ mt: 2 }}>
            {transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <Paper
                  key={index}
                  elevation={4}
                  sx={{
                    padding: 3,
                    marginBottom: 3,
                    borderRadius: "12px",
                    backgroundColor: "#f5f5f5",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    "&:hover": { boxShadow: "0px 4px 20px rgba(0, 255, 0, 0.5)" },
                  }}
                >
                  <ListItem divider sx={{ display: "block" }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                      {tx.transaction_type === "Purchase" ? "Purchased" : "Transferred"} {tx.nft_name || "Unknown NFT"} (Token ID: {tx.token_id})
                    </Typography>
                    <Box sx={{ marginTop: 1 }}>
                      <Typography variant="body1">
                        <strong style={{ color: "#16a085" }}>From:</strong> <span style={{ color: "black" }}>{tx.from}</span>
                      </Typography>
                      <Typography variant="body1">
                        <strong style={{ color: "#c0392b" }}>To:</strong> <span style={{ color: "black" }}>{tx.to}</span>
                      </Typography>
                      <Typography variant="body1">
                        <strong style={{ color: "#8e44ad" }}>Amount:</strong> <span style={{ color: "black" }}>{tx.amount} ETH</span>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          marginTop: 1,
                          color: "black",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => toggleTxVisibility(index)}
                      >
                        <strong>Tx Hash:</strong> {visibleTx[index] ? tx.tx_hash : "Click to show"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "black" }}>
                        <strong>Date:</strong> {new Date(tx.date).toLocaleString()}
                      </Typography>
                    </Box>
                  </ListItem>
                </Paper>
              ))
            ) : (
              <Typography variant="body1" sx={{ textAlign: "center" }}>
                No NFT transactions found.
              </Typography>
            )}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default NFTTransactionsHistory;