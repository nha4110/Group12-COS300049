// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract Faucet {
    uint public number = 34;
    int public num = -133;

    // Event for when ETH is transferred
    event Transferred(address indexed from, address indexed to, uint256 value);

    // Function to allow the transfer of ETH from an address to the admin address
    function transferETH(address payable adminAddress) public payable {
        require(msg.value > 0, "No ETH sent");

        // Emit an event on successful transfer
        emit Transferred(msg.sender, adminAddress, msg.value);

        // Transfer the sent ETH to the admin address
        adminAddress.transfer(msg.value);
    }
}
