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

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
