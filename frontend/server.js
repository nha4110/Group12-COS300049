import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let db;  // Declare the database connection variable

const connectDB = async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS,  // Fix the variable name
      database: process.env.DB_NAME || "group12_project",
    });

    console.log("✅ Database connected successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1); // Exit if DB connection fails
  }
};

connectDB(); // Call the function to connect to the database

// Sample route
app.get("/test", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT 'Hello World' AS message");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Database query failed" });
  }
});

// Home route to fix "Cannot GET /" issue
app.get("/", (req, res) => {
  res.send("Welcome to the Group 12 Project API!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
