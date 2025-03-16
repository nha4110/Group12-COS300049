Group12-COS30049 NFT Marketplace
This is an NFT marketplace project for Web3 that allows users to manage their digital assets using Ethereum blockchain and IPFS.

📌 Features
User Authentication (Signup/Login)
Ethereum Wallet Integration
NFT Minting & Collection
IPFS File Uploading
Ethereum Transactions
Web3 & MetaMask Support

🚀 Getting Started

1️⃣ Install Dependencies

npm install

2️⃣ Setup the Frontend

cd frontend
npm install

3️⃣ Initialize the Backend

cd backend
npm run init

4️⃣ Start Truffle & Migrate Smart Contracts

cd backend
npx truffle console --network development
migrate --reset

5️⃣ Start the Backend Server

cd backend
node server.js

6️⃣ Start the Frontend

cd frontend
npm run dev

📜 Smart Contract Deployment
The project uses Truffle for smart contract development and deployment.

If you need to redeploy:

npx truffle migrate --reset

🔗 MetaMask & Web3 Guide
To connect MetaMask:

1 - Install MetaMask from https://metamask.io/
2 - Create a new Ethereum wallet.
3 - Switch to Localhost 8545 network.
4 - Import the generated private key.

🛠 Technologies Used
Frontend: React, Material-UI, Framer Motion
Backend: Node.js, Express, MongoDB
Blockchain: Solidity, Truffle, Web3.js
Storage: IPFS (Pinata)
Authentication: JSON Web Tokens (JWT)

📌 Contributing
Feel free to fork this repository and contribute! Open an issue for any suggestions or improvements.

📜 License
This project is open-source under the MIT License.
