// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract YourContract {
    string public message;

    // Constructor to set the initial message
    constructor(string memory _message) {
        message = _message;
    }

    // Function to update the message
    function updateMessage(string memory _message) public {
        message = _message;
    }

    // Function to get the current message
    function getMessage() public view returns (string memory) {
        return message;
    }
}
