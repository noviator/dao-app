// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhiteList.sol";

contract OxGammaNFT is ERC721Enumerable, Ownable{

    string _baseTokenURI;

    IWhitelist whitelist;

    bool public presaleStarted;

    //  timestamp - end in 5 minutes
    uint256 public presaleEnded;

    // max TokenIds available(to mint)
    uint256 public maxTokenIds = 20;

    // keep track of tokenIds minted till now
    uint256 public tokenIds;

    uint256 public _publicPrice = 0.01 ether;
    uint256 public _presalePrice = 0.005 ether;

    bool public _paused;

    modifier onlyWhenNotPaused{
        require(!_paused, "Contract currently paused");
        _;
    }





    // baseURI to get metadata                                     // constructor of ERC721
    constructor (string memory baseURI, address whitelistContract) ERC721("0xGamma NFT", "0GN") {
        _baseTokenURI = baseURI;
        // whitelist contract to call - whitelistContract
        whitelist = IWhitelist(whitelistContract);
    }

    // onlyOwner modifier(from Ownable.sol) makes a function revert if not called by the address registered as the owner
    function startPresale() public onlyOwner{
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;
    }
    // Payable ensures that the function can send and receive Ether
    // Can use this function only when the contract is not paused.
    function presaleMint() public payable onlyWhenNotPaused{
        /* whitelsited addresses can mint nft during the presale period */

        require(presaleStarted && block.timestamp < presaleEnded, "Presale Ended");
        require(whitelist.whitelistedAddresses(msg.sender), "You are not in the whitelist");
        require(tokenIds < maxTokenIds , "Exceeded the limit");
        require(msg.value >= _presalePrice, "Ether sent is not sufficient");

        tokenIds++;
        // minting an nft to sender
        _safeMint(msg.sender, tokenIds);

    }

    function mint() public payable onlyWhenNotPaused{
        require(presaleStarted && block.timestamp >= presaleEnded, "Presale has not ended yet"); 

        require(tokenIds < maxTokenIds , "Exceeded the limit");
        require(msg.value >= _publicPrice, "Ether sent is not sufficient");

        tokenIds++;
        _safeMint(msg.sender, tokenIds);
    }

    // virtual function in ERC721.sol - overriden by child contract.
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }


    // to set _paused, so that we can pause funcitons inside smartContract( to prevent exploits)
    // Eg: we can use a modifier to stop from minting.
    function setPaused(bool val) public onlyOwner{
        _paused = val;
    }


    function withdraw() public onlyOwner{
        address _owner = owner(); // owner function inside ownable.sol
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value:amount}("");
        // (bool sent, bytes memory data) = _owner.call{value:amount}("");
        require(sent, "Failed to send Ether");
    }


    // Function to receive Ether. receive is called when msg.data is empty
    receive() external payable{}

    // Fallback function is called when msg.data is not empty
    fallback() external payable{}

     

}