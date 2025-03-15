-- Drop existing tables if they exist (in reverse order due to dependencies)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    account_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    wallet_address VARCHAR(255) UNIQUE CHECK (wallet_address ~* '^0x[a-fA-F0-9]{40}$')
);

-- Create collections table (updated to use base CID)
CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL UNIQUE,
    creator VARCHAR(255) CHECK (creator IS NULL OR creator ~* '^0x[a-fA-F0-9]{40}$'),
    token_id_start INT NOT NULL CHECK (token_id_start >= 0),
    base_cid VARCHAR(255) NOT NULL, -- Store the base IPFS CID (e.g., bafybeif7oettpy7l7j7pe4lpcqzr3hfum7dpd25q4yx5a3moh7x4ubfhqy)
    nft_count INT NOT NULL CHECK (nft_count > 0), -- Number of NFTs in the collection
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create assets table
CREATE TABLE assets (
    asset_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    wallet_address VARCHAR(255) NOT NULL CHECK (wallet_address ~* '^0x[a-fA-F0-9]{40}$'),
    token_id VARCHAR(255) NOT NULL UNIQUE,
    nft_name VARCHAR(255) NOT NULL,
    price_eth DECIMAL(10,4),
    contract_address VARCHAR(255) NOT NULL CHECK (contract_address ~* '^0x[a-fA-F0-9]{40}$'),
    image_url VARCHAR(255),
    category VARCHAR(255) NOT NULL,
    tx_hash VARCHAR(255) UNIQUE,
    minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES users(account_id) ON DELETE CASCADE,
    FOREIGN KEY (category) REFERENCES collections(category) ON DELETE RESTRICT
);

-- Create transactions table
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_id INT,
    sender_address VARCHAR(255) CHECK (sender_address IS NULL OR sender_address ~* '^0x[a-fA-F0-9]{40}$'),
    recipient_address VARCHAR(255) CHECK (recipient_address IS NULL OR recipient_address ~* '^0x[a-fA-F0-9]{40}$'),
    token_id VARCHAR(255),
    nft_name VARCHAR(255),
    amount_eth DECIMAL(10,4),
    transaction_type VARCHAR(50),
    contract_address VARCHAR(255) CHECK (contract_address IS NULL OR contract_address ~* '^0x[a-fA-F0-9]{40}$'),
    tx_hash VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES users(account_id) ON DELETE SET NULL,
    FOREIGN KEY (token_id) REFERENCES assets(token_id) ON DELETE SET NULL
);

-- Insert the "out" collection with base CID and 60 NFTs
INSERT INTO collections (category, creator, token_id_start, base_cid, nft_count)
VALUES (
    'out',
    NULL,
    1,
    'bafybeif7oettpy7l7j7pe4lpcqzr3hfum7dpd25q4yx5a3moh7x4ubfhqy',
    60
);