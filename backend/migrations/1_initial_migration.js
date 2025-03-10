// SPDX-License-Identifier: MIT

const EthTransfer = artifacts.require("EthTransfer");

module.exports = async function (deployer) {
    await deployer.deploy(EthTransfer);
};
