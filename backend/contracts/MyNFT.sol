// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 public _nextTokenId; // ✅ Made public for easy tracking
    mapping(string => bool) private existingURIs; // ✅ Changed uint8 to bool for clarity

    constructor(address initialOwner)
        ERC721("MyNFT", "ETH")
        Ownable(initialOwner)
    {}

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function safeMint(address to, string memory uri)
        public
        onlyOwner
        returns (uint256)
    {
        require(!existingURIs[uri], "NFT already minted"); // ✅ Prevent duplicate URIs

        uint256 tokenId = _nextTokenId++;
        existingURIs[uri] = true; // ✅ Mark URI as used

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    function payToMint(address recipient, string memory metadataURI)
        public
        payable
        returns (uint256)
    {
        require(msg.value >= 0.05 ether, "Insufficient funds");
        require(!existingURIs[metadataURI], "NFT already minted"); // ✅ Prevent duplicate minting

        uint256 newItemID = _nextTokenId++;
        existingURIs[metadataURI] = true;

        _safeMint(recipient, newItemID);
        _setTokenURI(newItemID, metadataURI);

        return newItemID;
    }

    function isContentOwned(string memory uri) public view returns (bool) {
        return existingURIs[uri]; // ✅ More efficient than using `== 1`
    }

    function getTotalSupply() public view returns (uint256) {
        return _nextTokenId; // ✅ Renamed `count()` to `getTotalSupply()`
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
