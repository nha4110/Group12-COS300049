import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, List, ListItem, ListItemText } from "@mui/material";
import { useAuth } from "../scripts/AuthContext";
import axios from "axios";

const History = () => {
    const { state } = useAuth();
    const user = state.user;
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        if (user) {
            axios.get(`http://localhost:5000/history/${user.wallet_address}`)
                .then(response => setTransactions(response.data))
                .catch(() => setTransactions([]));
        }
    }, [user]);

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
                <Typography variant="h4" gutterBottom>Transaction History</Typography>
                <List>
                    {transactions.map((tx, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={`Sent ${tx.amount} ETH to ${tx.recipient}`} secondary={tx.reference} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Container>
    );
};

export default History;
