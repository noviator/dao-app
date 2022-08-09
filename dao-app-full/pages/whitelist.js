import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { Contract, providers } from "ethers";
import { WHITELIST_CONTRACT_ABI, WHITELIST_CONTRACT_ADDRESS } from '../constants';


export default function Home() {
    const [walletConnected,setWalletConnected] = useState(false);
    const [numberOfWhitelisted,setNumberOfWhitelisted] = useState(0);
    const [joinedWhitelist,setJoinedWhitelist] = useState(false);
    const [loading, setLoading] = useState(false);

    // useRef returns a mutable ref object whose `.current` property
    // is initialized to the passed argument (initialValue). 
    // The returned object will persist for the full lifetime of 
    // the component.
    const web3ModalRef = useRef();

    const getWhitelistContractInstance = (providerOrSigner) => {
        return new Contract(WHITELIST_CONTRACT_ADDRESS, WHITELIST_CONTRACT_ABI, providerOrSigner);
    }

    const getProviderOrSigner = async(needSigner = false)=>{
        try{ // providers- just read transactions
            const provider = await web3ModalRef.current.connect();
            const web3Provider = new providers.Web3Provider(provider);

            // console.log(web3Provider)

            const { chainId }= await web3Provider.getNetwork();
            if(chainId!==5){
                window.alert("Change the network to Goerli");
                throw new Error("Change the network to Goerli");
            }
            
            //  signers to sign transactions
            if(needSigner){
                const signer = web3Provider.getSigner();
                return signer;
            }

            return web3Provider;
        }catch(err){
            console.error(err);
        }
    }

    const checkIfAddressIsWhitelisted= async()=>{
        try{
            const signer = await getProviderOrSigner(true);
            const whitelistContract = getWhitelistContractInstance(signer);
            const address = await signer.getAddress();
            const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
            setJoinedWhitelist(_joinedWhitelist);

        }catch(err){
            console.error(err.message);
        }
    }

    const getNumberOfWhitelisted = async()=>{
        try{
            const provider = await getProviderOrSigner();
             const whitelistContract = getWhitelistContractInstance(provider);
            const _numberOfWhiteListed = await whitelistContract.numAddressesWhitelisted();
            setNumberOfWhitelisted(_numberOfWhiteListed)
        }catch(err){
            console.error(err);
        }
    }

    const addAddrToWhitelist = async()=>{
        try{
            const signer = await getProviderOrSigner(true);
            const whitelistContract = getWhitelistContractInstance(signer);

            const tx = await whitelistContract.addAddressToWhitelist();
            setLoading(true);
            await tx.wait();
            setLoading(false);

            // as no of whitelisted has increased now
            await getNumberOfWhitelisted();
            setJoinedWhitelist(true);
        }catch(err){
            console.error(err);
        }
    }

    const renderButton =()=>{
        if(walletConnected){
            if(joinedWhitelist){
                return (
                    <div className={styles.description}>
                        Thanks For joining the WhiteList!
                    </div>
                )
            }else if(loading){
                return (
                    <div className={styles.button}>
                        Loading ...
                    </div>
                )
            }else{
                return (
                    <button onClick={addAddrToWhitelist} styles={styles.button}>
                        Join the WhiteList
                    </button>
                )
            }
        }else{
            return (
                <button onClick={connectWallet} className={styles.button}>
                    Connect your wallet
                </button>
            )
        }
    }

    const connectWallet = async()=>{
        try{
            // signer is used to sign transactions, 
            // provider is used to connect with contract and read functions from contract
            await getProviderOrSigner();
            setWalletConnected(true);

            checkIfAddressIsWhitelisted();
            getNumberOfWhitelisted();
        }catch(err){
            console.error(err);
        }
    }

    useEffect(()=>{
        if(!walletConnected){
            // setting the .current property of useRef() to new Web3Modal instance 
            web3ModalRef.current = new Web3Modal({
                network:"goerli",
                providerOptions:{},
                disabledInjectedProvider:false, // provider which injects code to browser
            });
            connectWallet();
        }

    },[walletConnected])

    return ( <div>
        <div className={styles.main2}>
            <h1 className={styles.title}>Welcome to 0xGamma NFT whitelist</h1>
            <div className={styles.description}>
                {numberOfWhitelisted} have joined the whitelist
            </div>
            <div> 
                {/* <Image src="crypto-devs.svg" alt =""/> */}
                <img className = {styles.image} src="/0.svg" alt="" />
            </div>
            <div>
                {renderButton()}
            </div>
        </div>
        

        <footer className={styles.footer}>
            <small>0xGamma 2022</small>
        </footer>
    </div>);
}