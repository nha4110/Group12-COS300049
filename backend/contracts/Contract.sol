// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract YourContract {
    address public owner;

    constructor() {
        owner = msg.sender;  // Set the owner to be the deployer of the contract
    }

    // Example function to transfer all funds (ETH) to the owner (admin address)
    function transferAllToOwner() public {
        require(msg.sender == owner, "Only the owner can transfer funds");

        // Transfer all balance to the owner
        payable(owner).transfer(address(this).balance);
    }

    // Fallback function to receive ETH
    receive() external payable {}
}
