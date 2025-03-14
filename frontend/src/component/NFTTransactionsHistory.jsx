import React, { useEffect, useState } from "react";
import { Paper, Typography, List, ListItem, Box } from "@mui/material";

const NFTTransactionsHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [visibleTx, setVisibleTx] = useState({});

  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("nftTransactions")) || [];
    setTransactions(storedTransactions.reverse()); // Latest first
  }, []);

  const toggleTxVisibility = (index) => {
    setVisibleTx((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <>
      <Typography variant="h5" sx={{ marginTop: 3, marginBottom: 2 }}>
        NFT Transactions History
      </Typography>
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
                  Minted {tx.nftName} (Token ID: {tx.tokenId})
                </Typography>
                <Box sx={{ marginTop: 1 }}>
                  <Typography variant="body1">
                    <strong style={{ color: "#16a085" }}>From:</strong> <span style={{ color: "black" }}>{tx.from}</span>
                  </Typography>
                  <Typography variant="body1">
                    <strong style={{ color: "#c0392b" }}>To:</strong> <span style={{ color: "black" }}>{tx.to}</span>
                  </Typography>
                  <Typography variant="body1">
                    <strong style={{ color: "#8e44ad" }}>Amount:</strong> <span style={{ color: "black" }}>{tx.amount}</span>
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
                    <strong>Tx Hash:</strong> {visibleTx[index] ? tx.txHash : "Click to show"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "black" }}>
                    <strong>Date:</strong> {tx.date}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "black" }}>
                    <strong>Gas:</strong> {tx.gas} ETH
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
    </>
  );
};

export default NFTTransactionsHistory;