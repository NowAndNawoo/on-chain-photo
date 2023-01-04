// SPDX-FileCopyrightText: 2022-2023 nawoo (@NowAndNawoo)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/sstore2/SSTORE2.sol";

struct Token {
    bool frozen;
    address[] addresses;
}

error DataIsFrozen();
error TokenDoesNotExist();
error DataIsEmpty();

contract OnChainPhotoV4 is ERC721("OnChainPhotoV4", "OCP4"), Ownable {
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
        }
    }

    function clearUri(uint256 tokenId) public onlyOwner {
        if (tokens[tokenId].frozen) revert DataIsFrozen();
        delete tokens[tokenId].addresses;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        return concatChunks(tokens[tokenId].addresses);
    }

    // concat SSTORE2 chunks
    // I refer to LibraryStorage.sol (https://goerli.etherscan.io/address/0xfccef97532caa9ddd6840a9c87843b8d491370fc#code#F2)
    function concatChunks(address[] memory chunks) private view returns (string memory result) {
        unchecked {
            assembly {
                let len := mload(chunks)
                let totalSize := 0x20 // including header size (first 32 bytes)
                let size
                result := mload(0x40)

                let targetChunk
                for {
                    let i := 0
                } lt(i, len) {
                    i := add(i, 1)
                } {
                    targetChunk := mload(add(chunks, add(0x20, mul(i, 0x20))))
                    size := sub(extcodesize(targetChunk), 1)
                    extcodecopy(targetChunk, add(result, totalSize), 1, size)
                    totalSize := add(totalSize, size)
                }

                // set data size in header
                mstore(result, sub(totalSize, 0x20))
                // update free-memory-pointer
                mstore(0x40, add(result, and(add(totalSize, 0x1f), not(0x1f))))
            }
        }
    }
}
