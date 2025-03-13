-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS users;

-- Create users table with snake_case
CREATE TABLE users (
    account_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    wallet_address VARCHAR(255) UNIQUE
);

CREATE TABLE assets (
    asset_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    token_id VARCHAR(255) UNIQUE NOT NULL,
    nft_name VARCHAR(255) NOT NULL,
    price_eth DECIMAL(10,4),
    contract_address VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    category VARCHAR(255) NOT NULL,
    tx_hash VARCHAR(255) UNIQUE,
    minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES users(account_id) ON DELETE CASCADE
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_id INT,
    sender_address VARCHAR(255),
    recipient_address VARCHAR(255),
    token_id VARCHAR(255),
    nft_name VARCHAR(255),
    amount_eth DECIMAL(10,4),
    transaction_type VARCHAR(50),
    contract_address VARCHAR(255),
    tx_hash VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES users(account_id) ON DELETE SET NULL
);