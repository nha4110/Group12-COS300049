const YourContract = artifacts.require("YourContract");

module.exports = async function (deployer, network, accounts) {
    const admin = accounts[0]; // Admin is the first account
    console.log("Deploying YourContract...");
    
    await deployer.deploy(YourContract, "Hello, Ethereum!");
    const contractInstance = await YourContract.deployed();

    console.log(`YourContract deployed at: ${contractInstance.address}`);
    console.log(`Admin account: ${admin}`);
};
