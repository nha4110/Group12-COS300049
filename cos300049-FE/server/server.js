const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 4000;

// ✅ Change this path to serve `index.html` from `cos300049-FE`
const ROOT_DIR = path.join(__dirname, ".."); 

app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files from `cos300049-FE` (where index.html is located)
app.use(express.static(ROOT_DIR));

// ✅ Default route to serve `index.html`
app.get("/", (req, res) => {
    res.sendFile(path.join(ROOT_DIR, "index.html"));
});

// ✅ Ensure users.json exists
const USERS_FILE = path.join(__dirname, "data", "users.json");

function readUsers() {
    if (!fs.existsSync(USERS_FILE)) {
        return [];
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

function writeUsers(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ✅ User routes
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

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    let users = readUsers();

    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials!" });
    }

    res.json({ message: "Login successful!", username, balance: user.balance });
});

app.get("/balance/:username", (req, res) => {
    const { username } = req.params;
    let users = readUsers();

    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).json({ message: "User not found!" });
    }

    res.json({ balance: user.balance });
});

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

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
