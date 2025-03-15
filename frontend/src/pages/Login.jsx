import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../scripts/AuthContext";
import { Container, TextField, Button, Typography, Box, CircularProgress } from "@mui/material";

const Login = () => {
    const navigate = useNavigate();
    const { dispatch } = useAuth();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); // Add loading state

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true); // Set loading to true

        if (!formData.username || !formData.password) {
            setError("Username and password are required.");
            setLoading(false); // Set loading to false
            return;
        }

        try {
            const response = await login(formData.username, formData.password);

            console.log("Login Response:", response);

            if (response.success) {
                console.log("Login User:", response.user);
                dispatch({ type: "LOGIN", payload: response.user });
                localStorage.setItem("user", JSON.stringify(response.user));
                localStorage.setItem("jwtToken", response.token);
                localStorage.setItem("wallet_address", response.user.wallet_address);
                navigate("/profile");
            } else {
                setError(response.message);
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false); // Set loading to false in finally block
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>Login</Typography>
                {error && <Typography color="error">{error}</Typography>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : "Login"}
                    </Button>
                </form>
                <Typography sx={{ mt: 2 }}>
                    Don't have an account? <Button onClick={() => navigate("/signup")}>Sign Up</Button>
                </Typography>
            </Box>
        </Container>
    );
};

export default Login;