// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract YourContract {
    string public message;
    address public owner;

    constructor(string memory _message) {
        message = _message;
        owner = msg.sender; // Set contract owner to the deployer
    }

    function updateMessage(string memory _message) public {
        message = _message;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }

    receive() external payable {} // Allow the contract to receive ETH
}
