const { ethers } = require("hardhat")
require("dotenv").config();
import METADATA_URL from "./constants/index.js";

async function main() {
    // Deploy the whitelist contract
    const whitelistContract = await ethers.getContractFactory("Whitelist");
    const deployedWhitelistContract = await whitelistContract.deploy(10);
    await deployedWhitelistContract.deployed();

    const whitelistContractAddress = deployedWhitelistContract.address;
    console.log(`\nWhitelist contract address : ${whitelistContractAddress}\n`);

    // Deploy the NFT contract
    const metadataURL = METADATA_URL;
    const _0xGammaNFT = await ethers.getContractFactory("0xGammaNFT")

    const deployed0xGammaNFTContract = await _0xGammaNFT.deploy(metadataURL, whitelistContractAddress);
    await deployed0xGammaNFTContract.deployed();
    const _0xGammaNFTContractAddress = deployed0xGammaNFTContract.address;
    console.log(`\n NFT contract address of deployed contract = ${_0xGammaNFTContractAddress}\n`);


    // Deploy the ICO token contract
    const _0xGammaTokenContract = await ethers.getContractFactory("OxGammaToken");
    const deployed0xGammaTokenContract  = await _0xGammaTokenContract.deploy(_0xGammaNFTContractAddress);
    const _0xGammaTokenContractAddress = deployed0xGammaTokenContract.address;
    console.log(`\o0xGamma Contract Address : ${_0xGammaTokenContractAddress}\n`)



  // Deploy the FakeNFTMarketplace contract first
  const FakeNFTMarketplace = await ethers.getContractFactory("FakeNFTMarketplace");
  const fakeNftMarketplace = await FakeNFTMarketplace.deploy();
  await fakeNftMarketplace.deployed();
  const fakeNftMarketplaceAddress = fakeNftMarketplace.address;
  console.log(`\nFakeNFTMarketplace deployed to: ${fakeNftMarketplaceAddress}\n`);

  // Deploy the 0xGammaDAO contract
  const OxGammaDAOContract = await ethers.getContractFactory("OxGammaDAO");
  const deployedOxGammaDAOContract = await OxGammaDAOContract.deploy( fakeNftMarketplaceAddress, _0xGammaNFTContractAddress,
    {
      value: ethers.utils.parseEther("0.1"),
    }
  );
  await deployedOxGammaDAOContract.deployed();

  const OxGammaDAOContractAddress = deployedOxGammaDAOContract.address;
  console.log(`\o0xGammaDAO Address : ${OxGammaDAOContractAddress}\n`)

}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })