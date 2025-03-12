import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, List, ListItem, Box } from "@mui/material";

const History = () => {
    const [transactions, setTransactions] = useState([]);
    const [visibleTx, setVisibleTx] = useState({}); // Tracks visibility state of each transaction

    useEffect(() => {
        const storedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
        setTransactions(storedTransactions.reverse()); // Latest transactions first
    }, []);

    const toggleTxVisibility = (index) => {
        setVisibleTx((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" sx={{ textAlign: "center", marginTop: 4, fontWeight: "bold" }}>
                Transaction History
            </Typography>
            <List sx={{ marginTop: 3 }}>
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
                                transition: "0.3s ease-in-out",
                                "&:hover": { boxShadow: "0px 4px 20px rgba(0, 255, 0, 0.5)" } // Glow effect on hover
                            }}
                        >
                            <ListItem divider sx={{ display: "block" }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
                                    Sent {tx.amount} ETH
                                </Typography>
                                <Box sx={{ marginTop: 1 }}>
                                    <Typography variant="body1">
                                        <strong style={{ color: "#16a085" }}>From:</strong> <span style={{ color: "black" }}>{tx.from}</span>
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong style={{ color: "#c0392b" }}>To:</strong> <span style={{ color: "black" }}>{tx.to}</span>
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            marginTop: 1, 
                                            color: "black", 
                                            cursor: "pointer", 
                                            textDecoration: "underline" 
                                        }}
                                        onClick={() => toggleTxVisibility(index)}
                                    >
                                        <strong>Tx Hash:</strong> {visibleTx[index] ? tx.hash : "Click to show"}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "black" }}>
                                        <strong>Date:</strong> {tx.date}
                                    </Typography>
                                </Box>
                            </ListItem>
                        </Paper>
                    ))
                ) : (
                    <Typography variant="body1" sx={{ textAlign: "center", marginTop: 3 }}>
                        No transactions found.
                    </Typography>
                )}
            </List>
        </Container>
    );
};

export default History;
