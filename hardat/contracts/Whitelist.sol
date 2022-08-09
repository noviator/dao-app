// SPDX-License-Identifier: MIT
pragma solidity^0.8.9;

contract Whitelist {

    uint8 public maxWhitelistedAddresses;
    
    // keep track of number of addresses whitelisted
    uint8 public numAddressesWhitelisted ;

    // to check if address is whitelisted or not
    mapping(address=>bool) public whitelistedAddresses;

    constructor(uint8 _maxWhitelistedAddresses){
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    function addAddressToWhitelist() public{
        // check in map if address is whitelisted or not
        require(!whitelistedAddresses[msg.sender],"Sender already whitelisted");
        
        require(numAddressesWhitelisted  < maxWhitelistedAddresses,"Max whitelist limit reached");

        numAddressesWhitelisted++;

        whitelistedAddresses[msg.sender]= true;
        
    }

}