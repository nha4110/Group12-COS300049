const UniqueNFT = artifacts.require("UniqueNFT");

module.exports = function (deployer) {
  deployer.deploy(UniqueNFT);
};
