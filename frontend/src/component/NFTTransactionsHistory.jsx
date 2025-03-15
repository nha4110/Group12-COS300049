import React, { useEffect, useState } from "react";
import { Paper, Typography, List, ListItem, Box } from "@mui/material";

const NFTTransactionsHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [visibleTx, setVisibleTx] = useState({});
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        setError("Please log in to view NFT transactions.");
        console.log("No JWT token found in localStorage");
        return;
      }

      console.log("Fetching transactions with token:", token.substring(0, 10) + "...");
      const response = await fetch("http://localhost:8081/api/nft-transactions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Server responded with ${response.status}: ${text}`);
        throw new Error(`Failed to fetch NFT transactions: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched NFT transactions:", JSON.stringify(data, null, 2));
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching NFT transactions:", err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchTransactions();

    const handleNftUpdate = () => {
      console.log("NFT transaction updated, refetching...");
      fetchTransactions();
    };
    window.addEventListener("nftTransactionUpdated", handleNftUpdate);

    return () => {
      window.removeEventListener("nftTransactionUpdated", handleNftUpdate);
    };
  }, []);

  const toggleTxVisibility = (index) => {
    setVisibleTx((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <>
      <Typography variant="h5" sx={{ marginTop: 3, marginBottom: 2 }}>
        NFT Transactions History
      </Typography>
      {error ? (
        <Typography variant="body1" sx={{ textAlign: "center", marginTop: 3, color: "red" }}>
          {error}
        </Typography>
      ) : (
        <List>
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
            <Typography variant="body1" sx={{ textAlign: "center", marginTop: 3 }}>
              No NFT transactions found.
            </Typography>
          )}
        </List>
      )}
    </>
  );
};

export default NFTTransactionsHistory;