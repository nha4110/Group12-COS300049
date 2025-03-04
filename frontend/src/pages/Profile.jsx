import React from "react";
import { Container, Typography, Paper, Button } from "@mui/material";
import { useAuth } from "../scripts/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const { state, dispatch } = useAuth();
    const navigate = useNavigate();

    if (!state.user) {
        return <Typography variant="h6" color="error">Unauthorized Access</Typography>;
    }

    // ✅ Logout Function
    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        navigate("/login"); // Redirect to login page
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 3, marginTop: 4, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>Profile</Typography>
                <Typography variant="h6">Username: {state.user.username}</Typography>
                <Typography variant="h6">Email: {state.user.email}</Typography>
                <Typography variant="h6">Wallet Address: {state.user.walletAddress}</Typography>

                {/* ✅ Logout Button */}
                <Button 
                    variant="contained" 
                    color="secondary" 
                    sx={{ marginTop: 3 }} 
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </Paper>
        </Container>
    );
};

export default Profile;
