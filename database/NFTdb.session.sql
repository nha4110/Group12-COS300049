-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    accountID SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password VARCHAR(255) NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    wallet_address VARCHAR(255) UNIQUE
);

-- Create assets table
CREATE TABLE assets (
    assetID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner INT,
    img VARCHAR(255),
    price DECIMAL(10,4),
    tokenID VARCHAR(255) UNIQUE NOT NULL,
    contract_address VARCHAR(255),
    category VARCHAR(255) NOT NULL,
    FOREIGN KEY (owner) REFERENCES users(accountID) ON DELETE CASCADE
);

-- Create transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    buyer VARCHAR(255) NOT NULL,
    seller VARCHAR(255) NOT NULL,
    amount DECIMAL(10,4) NOT NULL,
    token_id VARCHAR(255) NOT NULL,
    tx_hash VARCHAR(255) UNIQUE NOT NULL
);
