module.exports = async function (deployer, network, accounts) {
    const gasLimit = 5000000; // Set a reasonable gas limit
    const gasPrice = 20000000000; // Set gas price to 20 Gwei
  
    // List of accounts to transfer ETH from
    const accountsToTransfer = [
      "0x187025d3874F816Cc691AD839d8Ef8328Ee0402b",
      "0xEC47729aD9e88092C9c800BF05A21495Ef741e91",
      "0x5D5032327e77d468BA044c6a4cEcCF7C2333de0b",
      "0x3a27aEFa6829963e764a052A6C0e5A3630e9273c",
      "0x56547a513B28c23af06d0196e8bcC9EfE484B406",
      "0x5D5727F5A52e577914060C153D2554E38251b17E",
      "0x69C72B6820c373746bA36F5616c636c27Dec94e2",
      "0xD06f81cEE71Cb40f443eB29d523cb0657499ABBE",
      "0xef161FDB5Cc6b665781b723e53dc885C16d7fC3D"
    ];
  
    // Loop through each account and send ETH to the admin account
    for (let i = 0; i < accountsToTransfer.length; i++) {
      const fromAccount = accountsToTransfer[i];
      try {
        const tx = await web3.eth.sendTransaction({
          from: fromAccount,
          to: "0xa3141fb5C707C169d5FF3f7FcBA1B3E34733c66F", // Admin address
          value: web3.utils.toWei("89", "ether"), // The amount of ETH to transfer (adjust as needed)
          gas: gasLimit,
          gasPrice: gasPrice
        });
  
        console.log(`Transferred ETH from ${fromAccount} to admin. Transaction hash: ${tx.transactionHash}`);
      } catch (err) {
        console.log(`Error transferring ETH from ${fromAccount}: ${err.message}`);
      }
    }
  };
  