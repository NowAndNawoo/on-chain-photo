// SPDX-FileCopyrightText: 2022 nawoo (@NowAndNawoo)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/sstore2/SSTORE2.sol";
import "./lib/Memory.sol";

struct Token {
    bool frozen;
    uint256 bytesLength;
    address[] addresses;
}

error DataIsFrozen();
error TokenDoesNotExist();
error DataIsEmpty();

contract OnChainPhotoV3 is ERC721("OnChainPhotoV3", "OCP3"), Ownable {
    mapping(uint256 => Token) private tokens;

    function mint(uint256 tokenId) external onlyOwner {
        _safeMint(_msgSender(), tokenId);
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function isFrozen(uint256 tokenId) public view returns (bool) {
        return tokens[tokenId].frozen;
    }

    function freeze(uint256 tokenId) external onlyOwner {
        if (tokens[tokenId].frozen) revert DataIsFrozen();
        if (tokens[tokenId].addresses.length == 0) revert DataIsEmpty();
        tokens[tokenId].frozen = true;
    }

    function appendUri(uint256 tokenId, bytes[] calldata values) public onlyOwner {
        if (tokens[tokenId].frozen) revert DataIsFrozen();
        for (uint256 i = 0; i < values.length; i++) {
            tokens[tokenId].addresses.push(SSTORE2.write(values[i]));
            tokens[tokenId].bytesLength += values[i].length;
        }
    }

    function clearUri(uint256 tokenId) public onlyOwner {
        if (tokens[tokenId].frozen) revert DataIsFrozen();
        delete tokens[tokenId].addresses;
        tokens[tokenId].bytesLength = 0;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        bytes memory uri = new bytes(tokens[tokenId].bytesLength);
        (uint256 uriAddr, ) = Memory.fromBytes(uri);
        for (uint256 i = 0; i < tokens[tokenId].addresses.length; i++) {
            bytes memory data = SSTORE2.read(tokens[tokenId].addresses[i]);
            (uint256 dataAddr, uint256 len) = Memory.fromBytes(data);
            Memory.copy(dataAddr, uriAddr, len);
            uriAddr += len;
        }
        return string(uri);
    }
}
