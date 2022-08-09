// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// Ownable keeps track of owner, change ownership, transfer, revoke ownership
import "@openzeppelin/contracts/access/Ownable.sol";
import "./I0xGammaNFT.sol";

contract OxGammaToken is ERC20, Ownable{
    IOxGammaNFT OxGammaNFT;

    // keep track of tokenId which claimed the tokens
    mapping(uint256 => bool) public tokenIdsClaimed;

    // 10 tokens per nft
    uint256 public constant tokensPerNFT = 10 * 10**18;

    // public mint price of token
    uint256 public constant tokenPrice = 0.0001 ether;

    // max supply is 10000 tokens
    uint256 public constant maxTotalSupply = 10000 * 10**18;

    constructor(address OxGammaNFTContract) ERC20("0xGamma Token", "0GT"){  
        OxGammaNFT = IOxGammaNFT(OxGammaNFTContract);
    }

    function mint(uint256 amount) public payable{
        // address which dont't hold an nft can mint

        // amount is the number of tokens the user want to mint
        uint256 _requiredAmount = tokenPrice*amount;

        require(msg.value>=_requiredAmount, "Ether sent is not sufficient");
        uint256 amountWithDecimals = amount * 10**18;

        require(totalSupply()+amountWithDecimals <= maxTotalSupply, "Max total supply exceeded, cannot mint more than max supply");

        _mint(msg.sender, amountWithDecimals);
    }

    function claim() public{
        // nft holders can claim tokens
        // 1 NFT = 10 tokens
        address sender = msg.sender;
        uint256 balance = OxGammaNFT.balanceOf(sender);
        require(balance>0, "You don't own any 0xGamma NFTs");
        uint256 amount =0; // amount of tokenIds not claimed
        for(uint256 i=0; i<balance; i++){
            // for each index we are getting the tokenId
            uint256 tokenId = OxGammaNFT.tokenOfOwnerByIndex(sender, i);
            if(!tokenIdsClaimed[tokenId]){
                amount++;
                tokenIdsClaimed[tokenId]=true;
            }
        }
        require(amount>0, "You have already claimed all your tokens");
        _mint(msg.sender, amount * tokensPerNFT);
    }


    // when eth is sent to contract these functions should be used
    receive() external payable{}
    fallback() external payable{}


}

