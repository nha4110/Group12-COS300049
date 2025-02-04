const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Serve signup.html
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'signup.html'));
});

// Serve login.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'login.html'));
});

// Serve profile.html
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'profile.html'));
});

// Handle login POST request
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const usersFilePath = path.join(__dirname, '../data/users.json');

    if (!fs.existsSync(usersFilePath)) {
        return res.status(400).json({ success: false, message: 'No users found' });
    }

    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    // If using bcrypt, check hashed password
    if (!bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    // Login successful
    res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
