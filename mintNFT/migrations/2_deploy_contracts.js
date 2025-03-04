const MintContract = artifacts.require("MintContract");

module.exports = function (deployer) {
  deployer.deploy(MintContract, { gas: 3000000 }); // ✅ Increase gas allocation
};
