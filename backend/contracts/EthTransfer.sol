// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract EthTransfer {
    function transferETH(address payable recipient, uint256 amount) public payable {
        require(msg.value >= amount, "Insufficient ETH sent");
        recipient.transfer(amount);
    }
}