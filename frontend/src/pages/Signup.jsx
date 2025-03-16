{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/authApi"; // API call for user signup
import { Container, TextField, Button, Typography, Box, Paper } from "@mui/material";
import { motion } from "framer-motion"; // For animations
import { PersonAdd } from "@mui/icons-material"; // Icon for signup button

const Signup = () => {
  const navigate = useNavigate(); // Hook to navigate between pages

  // State to hold form input values
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  // State to handle error messages
  const [error, setError] = useState("");

  // Handle input changes and update form state
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(""); // Clear any existing error messages

    // Validate that all fields are filled
    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }

    try {
      // Send signup request to API
      const response = await signup(formData.username, formData.email, formData.password);
      
      // If signup is successful, notify user and redirect to login
      if (response.success) {
        alert("✅ Signup successful! Redirecting to login...");
        navigate("/login");
      } else {
        setError(response.message); // Display API error message
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again."); // Handle unexpected errors
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 4 }}>
      {/* Animation for smooth appearance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        {/* Signup Form Container */}
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #ffffff, #f0f4ff)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
          }}
        >
          {/* Signup Header */}
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#2c3e50", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}
          >
            <PersonAdd /> Sign Up
          </Typography>
          <Typography variant="body1" sx={{ color: "#7f8c8d", mb: 3 }}>
            Create your account to start exploring NFTs!
          </Typography>

          {/* Display error message if there is one */}
          {error && (
            <Typography color="error" sx={{ mb: 2, fontWeight: "bold" }}>
              {error}
            </Typography>
          )}

          {/* Signup Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Username Field */}
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
            {/* Email Field */}
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ bgcolor: "#fff", borderRadius: 1 }}
              InputLabelProps={{ sx: { color: "#34495e" } }}
            />
            {/* Password Field */}
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

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(90deg, #6e8efb, #a777e3)",
                "&:hover": { background: "linear-gradient(90deg, #5d78e6, #9366d2)" },
              }}
              startIcon={<PersonAdd />}
            >
              Sign Up
            </Button>
          </Box>

          {/* Redirect to Login */}
          <Typography sx={{ mt: 3, color: "#34495e" }}>
            Already have an account?{" "}
            <Button
              onClick={() => navigate("/login")}
              sx={{ textTransform: "none", color: "#6e8efb", fontWeight: "bold" }}
            >
              Login
            </Button>
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Signup;
