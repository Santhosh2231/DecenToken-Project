import { useEffect, useState } from "react";
import {
  connectWallet,
  getCurrentWalletConnected,
  mintNFT,
} from "./util/interact.js";
import React, { Component }  from 'react';
import { create } from 'ipfs-http-client'


const client = create('https://ipfs.infura.io:5001/api/v0');

const Minter = (props) => {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setURL] = useState("");
  const [buffer, setBuffer] = useState("");

  const [fileUrl, updateFileUrl] = useState(``);
  const [hash,setHash] = useState("");

  useEffect(async () => {
    document.title = "Decentoken" //Setting title for document
    const { address, status } = await getCurrentWalletConnected();

    setWallet(address);
    setStatus(status);

    addWalletListener();
  }, []);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  


  const onMintPressed = async () => {
    const { success, status } = await mintNFT(url, name, description);
    setStatus(status);
    if (success) {
      setName("");
      setDescription("");
      setURL("");
      window.location.assign('http://localhost:5000/');
    }
  };


  
  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(file)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      
      console.log(url);
      let hash = url.split('/');
      hash = hash[hash.length-1];
      console.log(hash);
      setHash(hash);
      updateFileUrl(url);
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  function copyToClipboard(){

    navigator.clipboard.writeText(url);
    
    
    navigator.clipboard.readText().then(
      alert("Copied the CID of asset: " + navigator.clipboard.readText));

  }

  return (

    <div className="Minter">  
    <nav className="navbar text-white">
  <div className="container-fluid">
    <a className="navbar-brand" href="#">
      <h1 className="nav-text">DecenToken</h1>
    </a>
    <button id="walletButton" className = "h-100" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect your Metamask wallet</span>
        )}
      </button>
  </div>
</nav>

      

     <br></br>
      <div class="card col col-sm-8 offset-sm-2">
       
        <div class="card-body">

          <form>
            <h2>Asset IPFS Link: </h2>
            <input
              type="file"
              placeholder="input file"
              onChange={onChange}
              
            />
            
            <div className = "given_file">
            <center>
            {
            fileUrl && (
              <img src={fileUrl} width="600px" />
            )
            }
            {
            fileUrl && (
              <div>
                <b><p>CID of Asset is: {hash}</p></b>
                <div class = "purple_buttons" id = "hash_of_asset" onClick={copyToClipboard}>
                  Copy text
                </div>
              </div>
            )
            }
            </center> 
            </div>
            
            <br></br>
            <h2> Name: </h2>
            <input
              type="text"
              placeholder="e.g. My first NFT!"
              onChange={(event) => setName(event.target.value)}
            />
            <br></br>
            <h2> Description: </h2>
            <input
              type="text"
              placeholder="e.g. Even cooler than cryptokitties ;)"
              onChange={(event) => setDescription(event.target.value)}
            />
          </form>
            <div className="row" style={{paddingLeft: '12px'}}>
                <button id="mintButton" className = "purple_buttons" onClick={onMintPressed}>
                Mint!
                </button>
              
            </div>
          <p id="status" style={{ color: "red" }}>
            {status}
          </p>
          
        </div>
      </div>

      
    </div>
  );
};

export default Minter;
