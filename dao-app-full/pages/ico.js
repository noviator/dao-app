import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState , useRef} from 'react'
import styles from '../styles/Home.module.css'
import Web3Modal from 'web3modal'
import {BigNumber, utils, Contract, providers} from 'ethers'
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from '../constants'

export default function Home() {

  const zero = BigNumber.from(0);
  // const [connectedWalletAddress, setConnectedWalletAddress] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokensMinted, setTokensMinted] = useState(zero);
  const [balanceof0xGammaToken , setBalanceOf0xGammaToken ] = useState(zero)// keep track of Tokens minted by current address
  const [tokenAmount, setTokenAmount] = useState(zero)// amount of tokens to mint
  const [loading, setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero); // keep track of tokens to be claimed by current address

  const web3ModalRef = useRef(); // to persist the web3Modal instance across pages


  const getProviderOrSigner=async(needSigner = false)=>{
    try{
      // to get access to provider/signer from metamask
      // connects to the current address user is connected to
      const provider = await web3ModalRef.current.connect(); 
      const web3Provider = new providers.Web3Provider(provider); // provider can be different like metamask, walletconnect etc


      // check the network and ask users to switch if not in correct network (goerli here)
      const { chainId }= await web3Provider.getNetwork();
      if(chainId!==5){
          window.alert("Change the network to Goerli");
          throw new Error("Change the network to Goerli");
      }

      // if signer is needed return signer
      // if user needs to sign a transaction. provider - if we want to read only.
      if(needSigner){
        const signer = web3Provider.getSigner();
        return signer;
      }

      return web3Provider;

    }catch(err){
      console.log(error)
    }
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
      
  }


  const onPageLoad = async () => {
    
    connectWallet();
    await getBalanceOf0xGammaToken();
    await getTotalTokenMinted();
    await getTokensToBeClaimed();
  }


  useEffect(()=>{
      if(!walletConnected){
        // initialize web3 modal
        web3ModalRef.current = new Web3Modal({
          network: "goerli",
          providerOptions: {},
          disableInjectedProvider: false, //metamask is the injected web3 provider
        });
        onPageLoad();
    }
  },[walletConnected])

  const get0xGammaṬokenContractInstance = (providerOrSigner) => {
    // function which returns the 0xGamma Token contract instance given a provider or signer
    return new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      providerOrSigner
    );
  };

  const get0xGammaNFTContractInstance = (providerOrSigner) => {
    // function which returns the 0xGamma NFT contract instance given a provider or signer
    return new Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      providerOrSigner
    );
  };


  const getBalanceOf0xGammaToken = async () => {
    // get balance of 0xGamma Token owned by current address
    try {
      const signer = await getProviderOrSigner(true);
      const _0xGammaTokenContract  = get0xGammaṬokenContractInstance(signer);
      const address = await signer.getAddress();
      const balance = await _0xGammaTokenContract.balanceOf(address);
      setBalanceOf0xGammaToken(balance);
    } catch (error) {
      console.error(error);
    }
    
  }

  const getTotalTokenMinted = async () => {
    // get total tokens minted by contract
    try {
      const provider = await getProviderOrSigner();
      const _0xGammaTokenContract  = get0xGammaṬokenContractInstance(provider);

      const _tokensMinted = await _0xGammaTokenContract.totalSupply();
      setTokensMinted(_tokensMinted); 
    } catch (error) {
      console.error(error);
    }
    
  }

  const mint0xGammaToken = async (amount) => {
    try{
      const signer = await getProviderOrSigner(true);
      const _0xGammaTokenContract  = get0xGammaṬokenContractInstance(signer);
      const value = 0.0001*amount;
      const tx = await _0xGammaTokenContract.mint(amount,{
        value: utils.parseEther(value.toString())
      });

      setLoading(true);
      await tx.wait();
      setLoading(false);

      window.alert('Successfully minted 0xGamma Tokens');

      await getBalanceOf0xGammaToken();
      await getTotalTokenMinted();
      await getTokensToBeClaimed();
    }catch(err){
      console.error(err)
    }
  }

  const getTokensToBeClaimed = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const _0xGammaNFTContract  = get0xGammaNFTContractInstance(signer);
      const _0xGammaTokenContract  = get0xGammaṬokenContractInstance(signer);
      const address = await signer.getAddress();
      const balance = await _0xGammaNFTContract.balanceOf(address);

      if(balance===zero){
        setTokensToBeClaimed(zero);
      }else{
        var amount = 0;
        // loop through balance of nfts a user owns
        for(var i=0; i<balance; i++){
          // get the token id of each nft owned by current address
          const tokenId = await nftContract.tokenOfOwnerByIndex(address,i);
          // check if the nft with tokenId has already claimed token or not
          const claimed = await _0xGammaTokenContract.tokenIdsClaimed(tokenId);

          if(!claimed){
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
      
      
    } catch (err) {
      console.log(err);
      setTokensToBeClaimed(zero);
    }
  }

  const claim0xGammaToken  = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const _0xGammaTokenContract  = get0xGammaṬokenContractInstance(signer);
      const tx = await _0xGammaTokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert('Successfully claimed 0xGamma Tokens');

      await getBalanceOf0xGammaToken ();
      await getTotalTokenMinted();
      await getTokensToBeClaimed();
    } catch (error) {
      console.error(error);
    }
  }

  const renderButton = () => {
    if(loading){
      return (
              <div>
                <button className={styles.button} disabled>Loading...</button>
              </div>
      )
    }

    if(tokensToBeClaimed >0){
      return (
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed*10} Tokens can claimed
          </div>
          <button className={styles.button} onClick={claim0xGammaToken }>
            Claim 0xGamma Token
          </button>
        </div>
      )

    }
    return (
      <div style = {{display:"flex-col"}}>
        <div>
          <input type="number" placeholder='Amount of tokens' onChange={(e)=> {setTokenAmount(BigNumber.from(e.target.value))}}/>
          <button className={styles.button} disabled = {!tokenAmount } onClick={()=>mint0xGammaToken (tokenAmount)}>
            Mint Tokens
          </button>
        </div>
      </div>
    )
  }

  const renderBody=()=>{
    if(walletConnected){
      return (
        <div>
          <div className={styles.description}>
            You have minted `{utils.formatEther(balanceof0xGammaToken)}` 0xGamma Token
          </div>

          <div className={styles.description}>
            {/* convert BigNumber to string - utils.formatEther()*/}
            Total {utils.formatEther(tokensMinted)}/10000 of 0xGamma Token have been minted
          </div>
          {renderButton()}
        </div>
      )
    }else{
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      )
    }
  }

  return (
    <div>
      <Head>
        <title>0xGamma Token ICO</title>
        <meta name = "description" content = "ICO-dApp"></meta>
        <link rel="icon" href="./favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to 0xGamma Token ICO</h1>
          <div className={styles.description}>
            You can mint or claim your tokens here
          </div>
          {renderBody()}
        </div>
        <div>
          <img className={styles.image} src="0.svg" alt="0xGamma" />
        </div>
      </div>
      <footer className={styles.footer}>
        0xGamma 2022
      </footer>
    </div>
    )
}
