require("dotenv").config(); // Load environment variables
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    goerli: {
      provider: () =>
        new HDWalletProvider(process.env.PRIVATE_KEY, process.env.INFURA_URL),
      network_id: 5,
      gas: 5500000,
    },
  },
  compilers: {
    solc: {
      version: "0.8.20",
    },
  },
};
