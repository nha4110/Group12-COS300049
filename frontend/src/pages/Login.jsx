{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi"; // API call for user login
import { useAuth } from "../scripts/AuthContext"; // Authentication context for state management
import {
  Container, TextField, Button, Typography, Box, Paper, CircularProgress
} from "@mui/material";
import { motion } from "framer-motion"; // Framer Motion for animations
import { LockOpen } from "@mui/icons-material"; // Lock icon for login button

const Login = () => {
  const navigate = useNavigate();
  const { dispatch } = useAuth(); // Access the authentication context to update user state
  const [formData, setFormData] = useState({ username: "", password: "" }); // Stores login input fields
  const [error, setError] = useState(""); // Stores error messages
  const [loading, setLoading] = useState(false); // Indicates whether login request is in progress

  /**
   * Handles input changes and updates the formData state
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handles form submission and logs in the user
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state
    setLoading(true); // Show loading indicator

    // Ensure both username and password are entered
    if (!formData.username || !formData.password) {
      setError("Username and password are required.");
      setLoading(false);
      return;
    }

    try {
      // Call API to authenticate user
      const response = await login(formData.username, formData.password);
      console.log("Login Response:", response);

      if (response.success) {
        console.log("Login User:", response.user);
        
        // Save user data in context and localStorage
        dispatch({ type: "LOGIN", payload: response.user });
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("jwtToken", response.token);
        localStorage.setItem("wallet_address", response.user.wallet_address);

        // Redirect to Profile page
        navigate("/profile");
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        
        {/* Login Card */}
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #ffffff, #f0f4ff)", // Light gradient background
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
            textAlign: "center",
          }}
        >
          {/* Login Title */}
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#2c3e50", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}
          >
            <LockOpen /> Log In
          </Typography>
          
          {/* Subtitle */}
          <Typography variant="body1" sx={{ color: "#7f8c8d", mb: 3 }}>
            Access your NFT world!
          </Typography>

          {/* Error Message Display */}
          {error && (
            <Typography color="error" sx={{ mb: 2, fontWeight: "bold" }}>
              {error}
            </Typography>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Username Input */}
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ bgcolor: "#fff", borderRadius: 1 }}
              InputLabelProps={{ sx: { color: "#34495e" } }}
            />

            {/* Password Input */}
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ bgcolor: "#fff", borderRadius: 1 }}
              InputLabelProps={{ sx: { color: "#34495e" } }}
            />

            {/* Login Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(90deg, #6e8efb, #a777e3)", // Blue to purple gradient
                "&:hover": { background: "linear-gradient(90deg, #5d78e6, #9366d2)" },
                "&:disabled": { bgcolor: "#bdc3c7" }, // Gray out when disabled
              }}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <LockOpen />}
            >
              {loading ? "Logging In..." : "Log In"}
            </Button>
          </Box>

          {/* Signup Link */}
          <Typography sx={{ mt: 3, color: "#34495e" }}>
            Don’t have an account?{" "}
            <Button
              onClick={() => navigate("/signup")}
              sx={{ textTransform: "none", color: "#6e8efb", fontWeight: "bold" }}
            >
              Sign Up
            </Button>
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Login;
