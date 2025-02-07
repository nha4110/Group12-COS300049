const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const USERS_FILE = "data/users.json";

// Read users.json
function readUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

// Write to users.json
function writeUsers(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Signup Route
app.post("/signup", (req, res) => {
    const { username, password } = req.body;
    let users = readUsers();

    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: "Username already exists!" });
    }

    users.push({ username, password, balance: 0 });
    writeUsers(users);

    res.status(201).json({ message: "Signup successful!" });
});

// Login Route
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    let users = readUsers();

    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials!" });
    }

    res.json({ message: "Login successful!", username, balance: user.balance });
});

// Get User Balance
app.get("/balance/:username", (req, res) => {
    const { username } = req.params;
    let users = readUsers();

    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).json({ message: "User not found!" });
    }

    res.json({ balance: user.balance });
});

// Update Balance
app.post("/update-balance", (req, res) => {
    const { username, balance } = req.body;
    let users = readUsers();

    let user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).json({ message: "User not found!" });
    }

    user.balance = balance;
    writeUsers(users);

    res.json({ message: "Balance updated!", balance });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
