// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../lib/sstore2/SSTORE2.sol";

contract Sstore2Test is Ownable {
    address public addr;

    function writeData(bytes calldata data) external onlyOwner {
        addr = SSTORE2.write(data);
    }

    function readData() public view returns (bytes memory) {
        return SSTORE2.read(addr);
    }
}
