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
    wallet_address VARCHAR(255) UNIQUE -- No private_key column
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

-- Create transactions table (unified for buy-nft and transfer)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    accountID INT, -- For buy-nft (buyer), nullable for transfers
    sender VARCHAR(255), -- For transfer
    recipient VARCHAR(255), -- For transfer (or contract address for minting)
    name VARCHAR(255), -- For buy-nft
    amount DECIMAL(10,4), -- Unified for price (buy-nft) or amount (transfer)
    mode VARCHAR(50), -- 'Purchase' for buy-nft, nullable for transfers
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Unified timestamp
    tokenID VARCHAR(255), -- For buy-nft and transfer (if applicable)
    tx_hash VARCHAR(255) UNIQUE, -- For transfer and minting confirmation
    FOREIGN KEY (accountID) REFERENCES users(accountID) ON DELETE SET NULL
);