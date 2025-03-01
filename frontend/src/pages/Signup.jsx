import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../scripts/auth.jsx";
import { Container, TextField, Button, Paper, Typography, Box } from "@mui/material";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signup(username, email, password);

      if (result.success) {
        setMessage("✅ Account created successfully!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(`⚠️ ${result.message}`);
      }
    } catch (error) {
      setMessage("⚠️ An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ marginTop: 8, padding: 3 }}>
        <Typography component="h1" variant="h5" align="center">
          Sign Up
        </Typography>

        {message && (
          <Box sx={{ mt: 2, p: 1, bgcolor: message.includes("✅") ? "#e8f5e9" : "#ffebee", borderRadius: 1 }}>
            <Typography>{message}</Typography>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUp;
