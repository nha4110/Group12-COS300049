// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintContract is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId; // Token ID counter

    // ✅ FIX: Correct constructor for OpenZeppelin v5.x
    constructor() ERC721("MyNFT", "NFT") Ownable(msg.sender) {
        _nextTokenId = 0; // ✅ Explicitly initialize token ID
    }

    function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 newItemId = _nextTokenId;
        _nextTokenId++; // ✅ Properly increment token ID

        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}
