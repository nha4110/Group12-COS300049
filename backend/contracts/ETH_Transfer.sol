// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ETH_Transfer {
    function transferETH(address payable recipient) public payable {
        require(msg.value > 0, "ETH amount must be greater than 0");
        recipient.transfer(msg.value);
    }
}