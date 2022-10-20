// SPDX-FileCopyrightText: 2022 nawoo (@NowAndNawoo)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct Token {
    bool frozen;
    bytes uri;
}

error DataIsFrozen();
error DataIsEmpty();
error TokenDoesNotExist();

contract OnChainPhotoV1 is ERC721("OnChainPhotoV1", "OCP1"), Ownable {
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

    function appendUri(uint256 tokenId, bytes calldata value) external onlyOwner {
        if (tokens[tokenId].frozen) revert DataIsFrozen();
        tokens[tokenId].uri = bytes.concat(tokens[tokenId].uri, value);
    }

    function clearUri(uint256 tokenId) external onlyOwner {
        if (tokens[tokenId].frozen) revert DataIsFrozen();
        tokens[tokenId].uri = "";
    }

    function freeze(uint256 tokenId) external onlyOwner {
        if (tokens[tokenId].frozen) revert DataIsFrozen();
        if (tokens[tokenId].uri.length == 0) revert DataIsEmpty();
        tokens[tokenId].frozen = true;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        return string(tokens[tokenId].uri);
    }
}
