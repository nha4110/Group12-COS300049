{/*
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Lu Nhat Hoang -  105234956
*/ }
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../scripts/auth.jsx";
import { AppBar, Toolbar, Typography, Container, TextField, Button, Paper, Box } from "@mui/material";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = signup(username, password);
    if (result.success) {
      setMessage("✅ Account created successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } else {
      setMessage(`⚠️ ${result.message}`);
    }
  };

  return (
    <>
      {/* Signup Form getting the user info and store it for later use */}
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ padding: 4, marginTop: 5, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Sign Up
          </Typography>

          {message && <Typography color="error">{message}</Typography>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Box mt={2}>
              <Button variant="contained" color="primary" fullWidth type="submit">
                Sign Up
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </>
  );
};

export default SignUp;
