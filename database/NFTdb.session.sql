-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS users;

-- Create users table (renamed from accounts)
CREATE TABLE users (
    accountID SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL CHECK (email LIKE '%_@__%.__%'),
    password VARCHAR(255) NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create assets table with category column
CREATE TABLE assets (
    assetID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner INT,
    img VARCHAR(255),
    price DECIMAL(10,4),
    tokenID VARCHAR(255),
    contract_address VARCHAR(255),
    category VARCHAR(255) NOT NULL,
    FOREIGN KEY (owner) REFERENCES users(accountID)
);

-- Create transactions table
CREATE TABLE transactions (
    transID SERIAL PRIMARY KEY,
    accountID INT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,4),
    mode VARCHAR(50),
    date DATE,
    tokenID VARCHAR(255),
    FOREIGN KEY (accountID) REFERENCES users(accountID)
);

