const Web3 = require("web3");

module.exports = async function (deployer, network, accounts) {
    const web3 = new Web3(deployer.provider);
    const admin = accounts[0]; // Admin is the first account

    console.log(`✅ Admin account: ${admin}`);
    
    for (let i = 1; i < accounts.length; i++) {
        const fromAccount = accounts[i];

        let balance = await web3.eth.getBalance(fromAccount); // Get balance in Wei
        if (balance > 0) {
            const gasLimit = 21000; // Standard transaction gas
            const gasPrice = await web3.eth.getGasPrice(); // Current gas price
            const gasCost = gasLimit * gasPrice; // Total gas cost

            if (balance > gasCost) {
                const transferAmount = balance - gasCost; // Subtract gas cost

                console.log(`🔄 Transferring ${web3.utils.fromWei(transferAmount.toString(), "ether")} ETH from ${fromAccount} to ${admin}...`);

                await web3.eth.sendTransaction({
                    from: fromAccount,
                    to: admin,
                    value: transferAmount.toString(),
                    gas: gasLimit,
                    gasPrice: gasPrice,
                });

                console.log(`✅ Transfer complete for ${fromAccount}`);
            } else {
                console.log(`⚠️ Skipping ${fromAccount} (Not enough ETH to cover gas fees)`);
            }
        }
    }

    console.log("🎉 All ETH successfully transferred to Admin!");
};
