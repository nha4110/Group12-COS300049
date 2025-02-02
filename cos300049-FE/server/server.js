const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Handle favicon.ico request to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No Content response
});

// Serve index.html from the parent directory (outside the 'server' folder)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));  // Go one level up and find index.html
});

// Serve signup.html
app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'signup.html')); // Serve signup.html from parent directory
});

// Serve login.html
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'login.html')); // Serve login.html from parent directory
});

// Serve profile.html
app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'profile.html')); // Serve profile.html from parent directory
});

// Serve index.html (just to keep the default route)
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));  // Serve index.html
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
