// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 public _nextTokenId; // Tracks the next available token ID for auto-incrementing mints
    mapping(uint256 => bool) private _mintedTokens; // Tracks which token IDs have been minted
    mapping(string => bool) private existingURIs; // Tracks used metadata URIs

    constructor(address initialOwner)
        ERC721("MyNFT", "ETH")
        Ownable(initialOwner)
    {}

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://bafybeif7oettpy7l7j7pe4lpcqzr3hfum7dpd25q4yx5a3moh7x4ubfhqy/";
    }

    // Owner-only mint function (kept as is)
    function safeMint(address to, string memory uri)
        public
        onlyOwner
        returns (uint256)
    {
        require(!existingURIs[uri], "NFT already minted with this URI");

        uint256 tokenId = _nextTokenId++;
        existingURIs[uri] = true;
        _mintedTokens[tokenId] = true;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    // Public mint function with payment and specific tokenId
    function payToMint(address recipient, string memory metadataURI, uint256 tokenId)
        public
        payable
        returns (uint256)
    {
        require(msg.value >= 0.05 ether, "Insufficient funds");
        require(!_mintedTokens[tokenId], "This token ID has already been minted");
        require(!existingURIs[metadataURI], "NFT already minted with this URI");

        _mintedTokens[tokenId] = true;
        existingURIs[metadataURI] = true;

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Update _nextTokenId if necessary (to avoid collisions with auto-incrementing mints)
        if (tokenId >= _nextTokenId) {
            _nextTokenId = tokenId + 1;
        }

        return tokenId;
    }

    // Check if a token ID has been minted
    function isMinted(uint256 tokenId) public view returns (bool) {
        return _mintedTokens[tokenId];
    }

    // Check if a URI is already used
    function isContentOwned(string memory uri) public view returns (bool) {
        return existingURIs[uri];
    }

    // Get the total number of tokens minted
    function getTotalSupply() public view returns (uint256) {
        return _nextTokenId;
    }

    // Withdraw funds (optional, for owner)
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }

    // Required overrides
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