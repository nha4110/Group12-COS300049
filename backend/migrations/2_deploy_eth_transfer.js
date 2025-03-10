const Web3 = require("web3");
const EthTransfer = artifacts.require("EthTransfer");

module.exports = async function (deployer, network, accounts) {
    const web3 = new Web3(deployer.provider);
    const contractInstance = await EthTransfer.deployed();
    
    const sender = accounts[1]; // Example: Current logged-in user
    const recipient = accounts[2]; // Example: Selected recipient

    const balance = await web3.eth.getBalance(sender);
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 21000;
    const gasCost = gasPrice * gasLimit;

    if (balance > gasCost) {
        const amountToSend = balance - gasCost;

        console.log(`✅ Sending ${web3.utils.fromWei(amountToSend.toString(), "ether")} ETH...`);

        await contractInstance.sendETH(recipient, { from: sender, value: amountToSend, gas: gasLimit });

        console.log("✅ Transfer complete!");
    } else {
        console.log("❌ Not enough ETH to cover gas fees.");
    }
};
