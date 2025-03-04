const FirstContract = artifacts.require("FirstContract"); // ✅ Ensure this matches the contract name exactly

module.exports = function (deployer) {
    deployer.deploy(FirstContract);
};
