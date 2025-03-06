const Web3 = require("web3");

module.exports = async function (deployer, network, accounts) {
    const web3 = new Web3(deployer.provider); // Use Truffle's provider
    const admin = accounts[0]; // Admin account

    console.log("Starting ETH transfers...");

    for (let i = 1; i < accounts.length; i++) {
        let balance = await web3.eth.getBalance(accounts[i]); // Get balance
        balance = web3.utils.fromWei(balance, "ether"); // Convert to ETH

        if (balance > 0) {
            console.log(`Transferring ${balance} ETH from ${accounts[i]} to Admin (${admin})...`);
            await web3.eth.sendTransaction({
                from: accounts[i],
                to: admin,
                value: web3.utils.toWei(balance, "ether"),
                gas: 21000, // Set gas
                gasPrice: web3.utils.toWei("2", "gwei"), // Set gas price explicitly
            });
        }
    }

    console.log("✅ All funds transferred to Admin.");
};
