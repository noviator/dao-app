// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IWhitelist {
    // we are using functions inside WhiteList.sol inside here
    // contains the functions we are interested in calling.
    // only function declarations present here
    
    // to check if address is in whitelist or not
    function whitelistedAddresses(address) external view returns (bool);
}