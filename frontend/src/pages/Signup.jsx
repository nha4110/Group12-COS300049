import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/authApi";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [privateKey, setPrivateKey] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

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
        setPrivateKey(response.privateKey); // Assuming API returns private key
        setShowDialog(true); // Show private key dialog
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleCopyPrivateKey = () => {
    navigator.clipboard.writeText(privateKey);
    alert("✅ Private Key copied to clipboard!");
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

      {/* Private Key Dialog */}
      <Dialog open={showDialog} onClose={() => navigate("/login")}>
        <DialogTitle>🎉 Signup Successful!</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            This is your **private key**. It will **not be shown again**, so save it somewhere safe.
          </Typography>
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", bgcolor: "#f5f5f5", p: 1, borderRadius: 1 }}>
            <Typography sx={{ flexGrow: 1, fontWeight: "bold" }}>
              {privateKey ? `${privateKey.slice(0, 4)}...` : "Loading..."}
            </Typography>
            <IconButton onClick={handleCopyPrivateKey}>
              <ContentCopyIcon />
            </IconButton>
          </Box>
          <Typography sx={{ mt: 2, color: "red", fontWeight: "bold" }}>
            ⚠️ Do **not** share this key. Losing it means losing access to your wallet.
          </Typography>
          <Typography sx={{ mt: 2 }}>
            🔗 Learn how to connect your wallet:{" "}
            <a href="https://www.youtube.com/watch?v=Af_lQ1zUnoM" target="_blank" rel="noopener noreferrer">
              Watch on YouTube
            </a>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Signup;


