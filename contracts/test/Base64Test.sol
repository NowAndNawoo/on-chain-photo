// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Base64.sol";
import "./MemoryTest.sol";

contract Base64Test is MemoryTest {
    function base64encode() public view returns (string memory) {
        bytes memory fullData = getFullData();
        return Base64.encode(fullData);
    }
}
