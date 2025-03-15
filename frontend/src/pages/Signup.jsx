import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/authApi";
import { Container, TextField, Button, Typography, Box } from "@mui/material";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await signup(formData.username, formData.email, formData.password);
      if (response.success) {
        alert("✅ Signup successful! Redirecting to login...");
        navigate("/login");
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>Signup</Typography>
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
            label="Email" 
            name="email" 
            type="email"
            value={formData.email} 
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
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Sign Up
          </Button>
        </form>
        <Typography sx={{ mt: 2 }}>
          Already have an account? <Button onClick={() => navigate("/login")}>Login</Button>
        </Typography>
      </Box>
    </Container>
  );
};

export default Signup;