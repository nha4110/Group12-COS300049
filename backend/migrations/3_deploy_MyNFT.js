const MyNFT = artifacts.require("MyNFT");

module.exports = async function (deployer, network, accounts) {
    const ownerAddress = accounts[0]; // Use the first account as the owner
    await deployer.deploy(MyNFT, ownerAddress);
};
