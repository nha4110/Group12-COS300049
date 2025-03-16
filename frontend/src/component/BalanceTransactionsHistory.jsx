{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useEffect, useState } from "react"; // React hooks for state and lifecycle management
import { Paper, Typography, List, ListItem, Box } from "@mui/material"; // Material-UI components
import { motion } from "framer-motion"; // For animations

const BalanceTransactionsHistory = () => {
  const [transactions, setTransactions] = useState([]); // State for storing transaction history
  const [visibleTx, setVisibleTx] = useState({}); // State to toggle visibility of transaction hashes

  // Fetch transactions from local storage on component mount
  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("balanceTransactions")) || []; // Retrieve transactions from local storage
    setTransactions(storedTransactions.reverse()); // Reverse order for latest first and update state
  }, []);

  // Toggle visibility of full transaction hash for a specific transaction
  const toggleTxVisibility = (index) => {
    setVisibleTx((prev) => ({ ...prev, [index]: !prev[index] })); // Toggle visibility state for the given index
  };

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
          Balance Transactions History {/* Title */}
        </Typography>
        <List>
          {transactions.length > 0 ? ( // Check if there are transactions to display
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
                      Sent {tx.amount} ETH {/* Transaction amount */}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body1" sx={{ color: "#34495e" }}>
                        <strong style={{ color: "#16a085" }}>From:</strong> {tx.sender.substring(0, 6)}...{tx.sender.substring(tx.sender.length - 4)}
                        {/* Sender address (shortened) */}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#34495e" }}>
                        <strong style={{ color: "#c0392b" }}>To:</strong> {tx.recipient.substring(0, 6)}...{tx.recipient.substring(tx.recipient.length - 4)}
                        {/* Recipient address (shortened) */}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, color: "#6e8efb", cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => toggleTxVisibility(index)} // Toggle hash visibility on click
                      >
                        <strong>Tx Hash:</strong> {visibleTx[index] ? `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}` : "Click to show"}
                        {/* Transaction hash (toggleable) */}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#34495e" }}>
                        <strong>Date:</strong> {new Date(tx.date).toLocaleString()} {/* Transaction date */}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#34495e" }}>
                        <strong>Gas:</strong> {tx.gas || "N/A"} ETH {/* Gas used (if available) */}
                      </Typography>
                    </Box>
                  </ListItem>
                </Paper>
              </motion.div>
            ))
          ) : (
            <Typography variant="body1" sx={{ textAlign: "center", color: "#7f8c8d" }}>
              No balance transactions found. {/* Message when no transactions exist */}
            </Typography>
          )}
        </List>
      </Paper>
    </motion.div>
  );
};

export default BalanceTransactionsHistory;
