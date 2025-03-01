require("dotenv").config(); // Load environment variables

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Use environment variables
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// ✅ Auto-reconnect mechanism
async function checkDBConnection(retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            const client = await pool.connect();
            console.log("✅ Connected to PostgreSQL!");
            client.release();
            await initializeDatabase(); // Ensure tables exist
            return;
        } catch (error) {
            console.error(`❌ Database connection failed. Retrying... (${i + 1}/${retries})`);
            await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
        }
    }
    console.error("❌ Could not connect to the database after multiple attempts.");
    process.exit(1);
}
checkDBConnection();

// ✅ Initialize Database
async function initializeDatabase() {
    const dbPath = path.join(__dirname, "../database/NFTdb.session.sql").replace(/\\/g, "/");

    if (!fs.existsSync(dbPath)) {
        console.error(`❌ Error: SQL file not found at ${dbPath}`);
        process.exit(1);
    }

    try {
        const sqlScript = fs.readFileSync(dbPath, "utf8");
        await pool.query(sqlScript);
        console.log("✅ Database and tables initialized.");
    } catch (error) {
        console.error("❌ Error executing NFTdb.session.sql:", error);
        process.exit(1);
    }
}

// ✅ Session storage using PostgreSQL
app.use(
    session({
        store: new PgSession({ pool }),
        secret: process.env.SESSION_SECRET || "fallback-secret",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false } // Set to true in production with HTTPS
    })
);

// ✅ Default route
app.get("/", (req, res) => {
    res.send("✅ Server is running! Welcome to the NFT API.");
});

// ✅ Get all users
app.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, username, created_at FROM users");
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Add a new user
app.post("/users", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO users (username, password, created_at) VALUES ($1, $2, NOW()) RETURNING id, username, created_at",
            [username, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error adding user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Get a user by ID
app.get("/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT id, username, created_at FROM users WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Delete a user by ID
app.delete("/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Start server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
