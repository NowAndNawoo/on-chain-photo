pragma solidity ^0.8.13;

import "./sstore2/SSTORE2.sol";

// https://goerli.etherscan.io/address/0xfccef97532caa9ddd6840a9c87843b8d491370fc#code#F2
contract LibraryStorage {
    mapping(string => address[]) _libraries2;

    address public owner;

    error NotOwner();

    constructor() {
        owner = msg.sender;
    }

    modifier isOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    function addChunk(string calldata name, string calldata chunk) public isOwner {
        _libraries2[name].push(SSTORE2.write(bytes(chunk)));
    }

    function getLibrary(string calldata name) public view returns (string memory o_code) {
        address[] memory chunks = _libraries2[name];

        unchecked {
            assembly {
                let len := mload(chunks)
                let totalSize := 0x20
                let size
                o_code := mload(0x40)

                // loop through all chunk addresses
                // - get address
                // - get data size
                // - get code and add to o_code
                // - update total size
                let targetChunk
                for {
                    let i := 0
                } lt(i, len) {
                    i := add(i, 1)
                } {
                    targetChunk := mload(add(chunks, add(0x20, mul(i, 0x20))))
                    size := sub(extcodesize(targetChunk), 1)
                    extcodecopy(targetChunk, add(o_code, totalSize), 1, size)
                    totalSize := add(totalSize, size)
                }

                // update o_code size
                mstore(o_code, sub(totalSize, 0x20))
                // store o_code
                mstore(0x40, add(o_code, and(add(totalSize, 0x1f), not(0x1f))))
            }
        }
    }
}
