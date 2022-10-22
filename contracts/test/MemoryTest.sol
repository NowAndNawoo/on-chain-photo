// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../lib/sstore2/SSTORE2.sol";
import "../lib/Memory.sol";

contract MemoryTest is Ownable {
    address[] private addresses;
    uint256 private fullLength;

    function appendData(bytes[] calldata values) external onlyOwner {
        for (uint256 i = 0; i < values.length; i++) {
            addresses.push(SSTORE2.write(values[i]));
            fullLength += values[i].length;
        }
    }

    function clearData() external onlyOwner {
        delete addresses;
        fullLength = 0;
    }

    function getFullData() public view returns (bytes memory) {
        bytes memory result = new bytes(fullLength);
        (uint256 resultAddr, ) = Memory.fromBytes(result);
        for (uint256 i = 0; i < addresses.length; i++) {
            bytes memory data = SSTORE2.read(addresses[i]);
            (uint256 dataAddr, uint256 dataLength) = Memory.fromBytes(data);
            Memory.copy(dataAddr, resultAddr, dataLength);
            resultAddr += dataLength;
        }
        return result;
    }
}
