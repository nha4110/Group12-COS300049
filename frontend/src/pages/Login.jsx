import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../scripts/AuthContext";
import { Container, TextField, Button, Typography, Box, Paper, CircularProgress } from "@mui/material";
import { motion } from "framer-motion"; // For animations
import { LockOpen } from "@mui/icons-material"; // Icon for login

const Login = () => {
  const navigate = useNavigate();
  const { dispatch } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.username || !formData.password) {
      setError("Username and password are required.");
      setLoading(false);
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
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
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
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#2c3e50", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}
          >
            <LockOpen /> Log In
          </Typography>
          <Typography variant="body1" sx={{ color: "#7f8c8d", mb: 3 }}>
            Access your NFT world!
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2, fontWeight: "bold" }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(90deg, #6e8efb, #a777e3)",
                "&:hover": { background: "linear-gradient(90deg, #5d78e6, #9366d2)" },
                "&:disabled": { bgcolor: "#bdc3c7" },
              }}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <LockOpen />}
            >
              {loading ? "Logging In..." : "Log In"}
            </Button>
          </Box>

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