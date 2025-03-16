{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useEffect, useState } from "react";
import { Paper, Typography, List, ListItem, Box } from "@mui/material";
import { motion } from "framer-motion"; // For animations

const BalanceTransactionsHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [visibleTx, setVisibleTx] = useState({});

  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("balanceTransactions")) || [];
    setTransactions(storedTransactions.reverse());
  }, []);

  const toggleTxVisibility = (index) => {
    setVisibleTx((prev) => ({ ...prev, [index]: !prev[index] }));
  };

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
          Balance Transactions History
        </Typography>
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
                      Sent {tx.amount} ETH
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body1" sx={{ color: "#34495e" }}>
                        <strong style={{ color: "#16a085" }}>From:</strong> {tx.sender.substring(0, 6)}...{tx.sender.substring(tx.sender.length - 4)}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#34495e" }}>
                        <strong style={{ color: "#c0392b" }}>To:</strong> {tx.recipient.substring(0, 6)}...{tx.recipient.substring(tx.recipient.length - 4)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, color: "#6e8efb", cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => toggleTxVisibility(index)}
                      >
                        <strong>Tx Hash:</strong> {visibleTx[index] ? `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}` : "Click to show"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#34495e" }}>
                        <strong>Date:</strong> {new Date(tx.date).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#34495e" }}>
                        <strong>Gas:</strong> {tx.gas || "N/A"} ETH
                      </Typography>
                    </Box>
                  </ListItem>
                </Paper>
              </motion.div>
            ))
          ) : (
            <Typography variant="body1" sx={{ textAlign: "center", color: "#7f8c8d" }}>
              No balance transactions found.
            </Typography>
          )}
        </List>
      </Paper>
    </motion.div>
  );
};

export default BalanceTransactionsHistory;