const blockchain = {
    addresses: generateBlockchainAddresses(10),
    nftMapping: {},

    // Function to generate unique blockchain addresses
    generateAddress() {
        return '0x' + Math.random().toString(16).substr(2, 40);
    },

    // Connect an NFT to a blockchain address
    connectNFT(nftId) {
        if (this.addresses.length === 0) {
            console.error("No available blockchain addresses.");
            return null;
        }
        const address = this.addresses.pop();
        this.nftMapping[nftId] = address;
        return address;
    }
};

// Generate a list of unique addresses
function generateBlockchainAddresses(count) {
    let addresses = [];
    for (let i = 0; i < count; i++) {
        addresses.push(blockchain.generateAddress());
    }
    return addresses;
}

console.log("Blockchain Addresses:", blockchain.addresses);
