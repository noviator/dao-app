import Head from 'next/head'
import Image from 'next/image'
import Web3Modal from "web3modal"
import {providers, Contract, utils} from "ethers"
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS, WHITELIST_CONTRACT_ABI, WHITELIST_CONTRACT_ADDRESS } from '../constants'

//  Web3Modal is an easy-to-use library to help developers add support 
// for multiple providers in their apps with a simple customizable 
// configuration. By default Web3Modal Library supports injected providers 
// like (Metamask, Dapper, Gnosis Safe, Frame, Web3 Browsers, etc), 
// You can also easily configure the library to support Portis, Fortmatic, Squarelink, Torus, Authereum, D'CENT Wallet and Arkane.



export default function Home() {
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isOwner, setIsOwner] = useState(false)
  const [presaleEnded, setPresaleEnded] = useState(false)
  const [loading, setLoading] = useState(false);
  const [whitelisted, setWhitelisted] = useState(false);

  const [numTokensMinted, setNumTokensMinted] = useState("");

  const web3ModalRef = useRef();

  const checkIfWhiteListed = async()=>{
    try{

      const signer = await getProviderOrSigner(true);

      // get an instance of WhiteList contract
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        WHITELIST_CONTRACT_ABI,
        signer
      )

      const userAddress = await signer.getAddress();

      const isWhiteListed = await whitelistContract.whitelistedAddresses(userAddress);// returns big number
      setWhitelisted(isWhiteListed);

    }catch(err){
      console.log(err);
    }
  }

  const getNumMintedTokens = async()=>{
    try{

      const provider = await getProviderOrSigner();

      // get an instance of NFT contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      )

      const numTokenIds = await nftContract.tokenIds();// returns big number
      setNumTokensMinted(numTokenIds.toString());

    }catch(err){
      console.log(err);
    }
  }

  const presaleMint = async()=>{
    // Mint nft during presale
    setLoading(true)
    try{
      const signer = await getProviderOrSigner(true);

      const nftContract= new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);

      const txn = await nftContract.presaleMint({
        value: utils.parseEther("0.005")
      })


      await txn.wait(); 

      window.alert("Successfully minted 0xGammaNFT in presale");
    }catch(err){
      console.log(err);
    }
    setLoading(false)
  }

  const publicMint = async()=>{
    // mint nft after presale
    setLoading(true)
    try{
      const signer = await getProviderOrSigner(true);

      const nftContract= new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);

      const txn = await nftContract.mint({
        value: utils.parseEther("0.01")
      })


      await txn.wait(); 


      window.alert("Successfully minted 0xGammaNFT");
    }catch(err){
      console.log(err);
    }
    setLoading(false)
  }

  const checkIfPresaleEnded = async()=>{
    try{
      const provider = await getProviderOrSigner();

      // get an instance of NFT contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      )

      // returns a BigNumber as presaleEnded is uint256
      // returns timestamp in seconds
      const presaleEndTime = await nftContract.presaleEnded();

      const currentTimeInSeconds = Date.now()/1000;

      // since it's a BigNumber use .lt() - less than
      const hasPresaleEnded = presaleEndTime.lt(Math.floor(currentTimeInSeconds));

      setPresaleEnded(hasPresaleEnded);

    }catch(err){
      console.log(err);
    }
  }

  const getOwner = async()=>{
    // only the owner can see the button to start presale
    try{
      
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS,NFT_CONTRACT_ABI, signer);

      const owner = await nftContract.owner();
      const userAddress = await signer.getAddress();

      // if the owner address is same as the current connected user 
      if(owner.toLowerCase() === userAddress.toLowerCase()){
        setIsOwner(true)
      }

    }catch(err){
      console.log(err);
    }
  }

  const startPresale = async()=>{
    try{
      setLoading(true)
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS,NFT_CONTRACT_ABI, signer);

      const txn = await nftContract.startPresale();
      setLoading(true);
      await txn.wait();
      setLoading(false);

      setPresaleStarted(true);
    }catch(err){
      console.log(err);
    }
    setLoading(false)
  }

  const checkIfPresaleStarted = async()=>{
    try{
      const provider = await getProviderOrSigner();

      // get an instance of NFT contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      )
      

      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted); 

      return isPresaleStarted;
    }catch(err){
      console.log(err.message)
      return false;
    }
  }


  const connectWallet = async()=>{
    try{
      await getProviderOrSigner();
      setWalletConnected(true);
    }catch(err){
      console.log(err.message);
    }
  }

  const getProviderOrSigner=async(needSigner = false)=>{
    try{
      // to get access to provider/signer from metamask
      const provider = await web3ModalRef.current.connect(); 
      const web3Provider = new providers.Web3Provider(provider);


      // check the network and ask users to switch if not in correct network (goerli here)
      const { chainId }= await web3Provider.getNetwork();
      if(chainId!==5){
          window.alert("Change the network to Goerli");
          throw new Error("Change the network to Goerli");
      }

      // if signer is needed return signer
      if(needSigner){
        const signer = web3Provider.getSigner();
        return signer;
      }

      return web3Provider;

    }catch(err){
      console.log(error)
    }
  }

  const onPageLoad = async()=>{
    await connectWallet();
    await getOwner();
    await checkIfWhiteListed();

    const presaleStarted = await checkIfPresaleStarted();
    if(presaleStarted){
      await checkIfPresaleEnded();
    }

    // track minted nft nos
    setInterval(async()=>{
      await getNumMintedTokens();
    }, 5*1000)

    // track if presale is started/ ended
    setInterval(async()=>{
      const presaleStarted = await checkIfPresaleStarted();
      if(presaleStarted){
        await checkIfPresaleEnded();
      }
    }, 5*1000)

  }

  useEffect(()=>{
      if(!walletConnected){
        web3ModalRef.current = new Web3Modal({
          network: "goerli",
          providerOptions: {},
          disableInjectedProvider: false,
        });
        onPageLoad();
    }
  },[walletConnected])

  function renderBody(){
    if(!walletConnected){
      // render a button to connect wallet
      return(
          <button onClick={connectWallet} className={styles.button}>
          Connect wallet
          </button>
        )
    }

    if(loading){
      return <span className={styles.description}>
        Loading...
        </span>
    }
 
    if(isOwner && ! presaleStarted){
      // render a button to start presale
      return(<button onClick={startPresale} className={styles.button}>Start Presale</button>)
    }

    if(!presaleStarted){
      // if presale is not started and user is not the owner
      return (
        <div>
          <span className={styles.description}>
            Presale has not started yet. Come back later.
          </span>

        </div>
      )
    }

    if(presaleStarted && !presaleEnded){
      // allow users in whitelist to mint in presale
      if(whitelisted){
        return (
          <div className={styles.nftmint}>
            <span className={styles.description}>
              Presale has started, If your address is whitelisted, you can mint a 0xGammaNFT.
            </span>
            <button className={styles.button} onClick={presaleMint}>
              Presale Mint
            </button>
          </div>
        )
      }else{
        return (
          <div>
            <span className={styles.description}>
              Presale has started, Your Address is not whitelisted. You can wait for public sale.
            </span>
          </div>
        )
      }

    }

    if(presaleEnded){
      // allow users to mint(public sale)
        return (
        <div className={styles.nftmint}>
          <span className={styles.description}>
            Presale has ended, you can mint a 0xGammaNFT in public sale if any remains.
          </span>
          <button className={styles.button} onClick={publicMint}>
            Public Sale Mint
          </button>
        </div>
      )
    }
  }

  return (
    <div>
      <Head> 
        <title>0xGammaNFT</title>
      </Head>
      <div className={styles.main2}>
        <span className={styles.description}>
          {numTokensMinted}/20  :  0xGammaNFT has been minted
        </span>
        {renderBody()}
      </div>
    </div>
  )
}
