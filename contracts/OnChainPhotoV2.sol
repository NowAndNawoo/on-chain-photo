// SPDX-FileCopyrightText: 2022 nawoo (@NowAndNawoo)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/sstore2/SSTORE2.sol";

struct Token {
    bool frozen;
    address[] addresses; // max length is 36
}

error DataIsFrozen();
error DataIsEmpty();
error TokenDoesNotExist();
error TooManyValues();

contract OnChainPhotoV2 is ERC721("OnChainPhotoV2", "OCP2"), Ownable {
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
        if (tokens[tokenId].addresses.length + values.length > 36) revert TooManyValues();
        for (uint256 i = 0; i < values.length; i++) {
            tokens[tokenId].addresses.push(SSTORE2.write(values[i]));
        }
    }

    function clearUri(uint256 tokenId) public onlyOwner {
        if (tokens[tokenId].frozen) revert DataIsFrozen();
        delete tokens[tokenId].addresses;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        address[36] memory addresses;
        for (uint256 i = 0; i < tokens[tokenId].addresses.length; i++) {
            addresses[i] = tokens[tokenId].addresses[i];
        }
        bytes memory uri = bytes.concat(
            bytes.concat(
                SSTORE2.read(addresses[0]),
                SSTORE2.read(addresses[1]),
                SSTORE2.read(addresses[2]),
                SSTORE2.read(addresses[3]),
                SSTORE2.read(addresses[4]),
                SSTORE2.read(addresses[5]),
                SSTORE2.read(addresses[6]),
                SSTORE2.read(addresses[7]),
                SSTORE2.read(addresses[8])
            ),
            bytes.concat(
                SSTORE2.read(addresses[9]),
                SSTORE2.read(addresses[10]),
                SSTORE2.read(addresses[11]),
                SSTORE2.read(addresses[12]),
                SSTORE2.read(addresses[13]),
                SSTORE2.read(addresses[14]),
                SSTORE2.read(addresses[15]),
                SSTORE2.read(addresses[16]),
                SSTORE2.read(addresses[17])
            ),
            bytes.concat(
                SSTORE2.read(addresses[18]),
                SSTORE2.read(addresses[19]),
                SSTORE2.read(addresses[20]),
                SSTORE2.read(addresses[21]),
                SSTORE2.read(addresses[22]),
                SSTORE2.read(addresses[23]),
                SSTORE2.read(addresses[24]),
                SSTORE2.read(addresses[25]),
                SSTORE2.read(addresses[26])
            ),
            bytes.concat(
                SSTORE2.read(addresses[27]),
                SSTORE2.read(addresses[28]),
                SSTORE2.read(addresses[29]),
                SSTORE2.read(addresses[30]),
                SSTORE2.read(addresses[31]),
                SSTORE2.read(addresses[32]),
                SSTORE2.read(addresses[33]),
                SSTORE2.read(addresses[34]),
                SSTORE2.read(addresses[35])
            )
        );
        return string(uri);
    }
}
