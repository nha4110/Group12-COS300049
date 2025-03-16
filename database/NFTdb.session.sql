-- Drop existing tables if they exist (in reverse order due to dependencies)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS users;

-- Create users table (unchanged)
CREATE TABLE users (
    account_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    wallet_address VARCHAR(255) UNIQUE CHECK (wallet_address ~* '^0x[a-fA-F0-9]{40}$')
);

-- Create collections table (unchanged)
CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL UNIQUE,
    creator VARCHAR(255) CHECK (creator IS NULL OR creator ~* '^0x[a-fA-F0-9]{40}$'),
    token_id_start INT NOT NULL CHECK (token_id_start >= 0),
    base_cid VARCHAR(255) NOT NULL,
    nft_count INT NOT NULL CHECK (nft_count > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create assets table (unchanged)
CREATE TABLE assets (
    asset_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    wallet_address VARCHAR(255) NOT NULL CHECK (wallet_address ~* '^0x[a-fA-F0-9]{40}$'),
    token_id INT NOT NULL,
    nft_name VARCHAR(255) NOT NULL,
    price_eth DECIMAL(18,6) NOT NULL,
    contract_address VARCHAR(255) NOT NULL CHECK (contract_address ~* '^0x[a-fA-F0-9]{40}$'),
    image_url VARCHAR(255),
    category VARCHAR(255) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL UNIQUE CHECK (tx_hash ~* '^0x[a-fA-F0-9]{64}$'),
    minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES users(account_id) ON DELETE CASCADE,
    FOREIGN KEY (category) REFERENCES collections(category) ON DELETE RESTRICT,
    CONSTRAINT assets_token_id_contract_address_key UNIQUE (token_id, contract_address)
);

-- Create transactions table (updated with category column)
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_id INT,
    sender_address VARCHAR(255) NOT NULL CHECK (sender_address ~* '^0x[a-fA-F0-9]{40}$'),
    recipient_address VARCHAR(255) NOT NULL CHECK (recipient_address ~* '^0x[a-fA-F0-9]{40}$'),
    token_id INT,
    nft_name VARCHAR(255),
    amount_eth DECIMAL(18,6) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    contract_address VARCHAR(255) NOT NULL CHECK (contract_address ~* '^0x[a-fA-F0-9]{40}$'),
    category VARCHAR(255), -- New column for collection category
    tx_hash VARCHAR(66) NOT NULL UNIQUE CHECK (tx_hash ~* '^0x[a-fA-F0-9]{64}$'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES users(account_id) ON DELETE SET NULL,
    FOREIGN KEY (category) REFERENCES collections(category) ON DELETE SET NULL -- Optional: SET NULL if collection is deleted
);

-- Insert the "out" collection (unchanged)
INSERT INTO collections (category, creator, token_id_start, base_cid, nft_count)
VALUES (
    'out',
    NULL,
    1,
    'bafybeif7oettpy7l7j7pe4lpcqzr3hfum7dpd25q4yx5a3moh7x4ubfhqy',
    60
);