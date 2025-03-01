const express = require("express");
const { Pool } = require("pg"); // PostgreSQL Client
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json()); // Allow JSON request bodies

// PostgreSQL connection
const pool = new Pool({
    connectionString: "postgresql://NFTdb_owner:npg_wRYlsH14JXhG@ep-empty-dream-a8woxm2q-pooler.eastus2.azure.neon.tech/NFTdb?sslmode=require"
});

// ✅ Ensure database connection
pool.connect()
    .then(client => {
        console.log("✅ Connected to PostgreSQL Database!");
        client.release(); // Release the client back to the pool
        initializeDatabase(); // Initialize the database
    })
    .catch(err => {
        console.error("❌ PostgreSQL connection failed:", err);
        process.exit(1); // Exit the app on failure
    });

// ✅ Function to initialize database from NFTdb.session.sql
function initializeDatabase() {
    const dbPath = path.join(__dirname, "../database/NFTdb.session.sql");

    if (!fs.existsSync(dbPath)) {
        console.error(`❌ Error: SQL file not found at ${dbPath}`);
        process.exit(1);
    }

    const sqlScript = fs.readFileSync(dbPath, "utf8");

    pool.query(sqlScript)
        .then(() => console.log("✅ Database and tables initialized."))
        .catch(err => console.error("❌ Error executing NFTdb.session.sql:", err));
}

// ✅ Default route to avoid 404 errors
app.get("/", (req, res) => {
    res.send("✅ Server is running! Welcome to the NFT API.");
});

// ✅ Start server
const PORT = 8081;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
