const YourContract = artifacts.require("YourContract");

module.exports = function(deployer, network, accounts) {
  // Set a reasonable gas limit and gas price
  const gasLimit = 5000000; // Adjust this depending on your contract complexity
  const gasPrice = 20000000000; // 20 Gwei

  // Deploy contract
  deployer.deploy(YourContract, "Hello, Ethereum!", { gas: gasLimit, gasPrice: gasPrice });
};
