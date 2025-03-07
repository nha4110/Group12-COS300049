import React from "react";
import { Container, Typography, Paper, Button } from "@mui/material";
import { useAuth } from "../scripts/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const { state, dispatch } = useAuth();
    const navigate = useNavigate();

    const user = state.user;
    const accountId = user?.accountid;
    const walletAddress = user?.wallet_address; // ✅ No JSON parsing, just display it

    if (!user) {
        return <Typography variant="h6" color="error">Unauthorized Access</Typography>;
    }

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 3, marginTop: 4, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>Profile</Typography>
                <Typography variant="h6">Account ID: {accountId}</Typography>
                <Typography variant="h6">Username: {user.username}</Typography>
                <Typography variant="h6">Email: {user.email}</Typography>
                <Typography variant="h6">Wallet Address: {walletAddress || "Not available"}</Typography>

                <Button 
                    variant="contained" 
                    color="secondary" 
                    sx={{ marginTop: 3 }} 
                    onClick={() => {
                        dispatch({ type: "LOGOUT" });
                        localStorage.removeItem("user"); // Clear user data from localStorage
                        localStorage.removeItem("jwtToken"); // Clear token if necessary
                        navigate("/login");
                    }}
                >
                    Logout
                </Button>
            </Paper>
        </Container>
    );
};

export default Profile;
