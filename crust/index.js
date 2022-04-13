// import { create } from "ipfs-http-client";

// async function addFile() {
//   // 1. Create IPFS instant
//   const ipfs = create("http://localhost:5001");
//   console.log(ipfs);

//   // 2. Add file to ipfs
//   const { cid } = await ipfs.add("something.txt");
//   console.log(cid);

//   // 3. Get file status from ipfs
// }

// addFile();
// import { ApiPromise, WsProvider } from "@polkadot/api";
// import { typesBundleForPolkadot, crustTypes } from "@crustio/type-definitions";
// import { Keyring } from "@polkadot/keyring";
// import { KeyringPair } from "@polkadot/keyring/types";

const polkadot = require("@polkadot/api");
const crustio = require("@crustio/type-definitions");
// const keyring = require("@polkadot/keyring");
const keyringPair = require("@polkadot/keyring/pair");

const { waitReady } = require("@polkadot/wasm-crypto");
const { Keyring } = require("@polkadot/api");

const crustChainEndpoint = "wss://rpc.crust.network";
const Wsprovider = new polkadot.WsProvider(crustChainEndpoint);

const ipfsClient = require("ipfs-http-client");
const express = require("express");
const bodyparser = require("body-parser");
const fileupload = require("express-fileupload");
const fs = require("fs");
const {exec} = require("child_process");



let status1 = false;
async function placeStorageOrder(CID, seed) {
  await waitReady();
  const api = new polkadot.ApiPromise({
    provider: Wsprovider,
    typesBundle: crustio.typesBundleForPolkadot,
  });
  await api.isReady;
  // 1. Construct place-storage-order tx
  const fileCid = CID; // IPFS CID, take `Qm123` as example
  const fileSize = 2 * 1024*1024 ; // Let's say 2 gb(in byte)
  const tips = 0;
  const memo = "";
  const tx = api.tx.market.placeStorageOrder(fileCid, fileSize, tips, memo);

  const keyring = new Keyring({ type: "sr25519" });
  console.log(keyring);
  const krp = keyring.addFromUri(
    seed
  );
  //"subway exact priority help mother knee visit harvest slab unknown elegant hand"
  console.log(krp);

  await api.isReadyOrError;
  return new Promise((resolve, reject) => {
    tx.signAndSend(krp, ({ events = [], status }) => {
      console.log(`💸  Tx status: ${status.type}, nonce: ${tx.nonce}`);


      if (status.isInBlock) {
        events.forEach(({ event: { method, section } }) => {
          if (method === "ExtrinsicSuccess") {
            console.log(`✅  Place storage order success!`);
            
            status1 = true;
            
            resolve(true);
          }
        });
      } else {
        // pass
      }
    }).catch((e) => {
      reject(e);
    });
  });

  // 3. Send transaction
}





console.log(ipfsClient);
const ipfs = ipfsClient.create({
  host: "localhost",
  port: "5001",
  protocol: "http",
});

const app = express();
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(fileupload());

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(5000, () => {
  console.log("SERVER is listening");
});


app.post("/transaction", async (req, res) => {
  
 console.log(req.body.CID);
 var CID = req.body.CID;
 var seed = req.body.seed;
  const order = await placeStorageOrder(CID, seed);
  console.log(status1);

  if (status1){
    //Pass
    res.render("transaction");
  }
  else{
    console.log("Error");
  }
    
});


const addFile = async (file_name, file_path) => {
  const fileBuffer = fs.readFileSync(file_path);
  const fileAdded = await ipfs.add({
    path: file_path,
    content: fileBuffer,
  });

  console.log(fileAdded);
  const fileHash = fileAdded.cid;

  return fileHash;
};

const ethers = require("ethers");
const res = require("express/lib/response");

async function addFileAuth(file_name, file_path) {
  const pair = ethers.Wallet.createRandom();
  console.log(pair);
  const sig = await pair.signMessage(pair.address);
  console.log(sig);
  const authHeaderRaw = `eth-${pair.address}:${sig}`;
  console.log(authHeaderRaw);
  const authHeader = Buffer.from(authHeaderRaw).toString("base64");
  console.log(authHeader);
  const ipfsW3GW = "https://crustipfs.xyz";

  const fileBuffer = fs.readFileSync(file_path);

  const ipfs = ipfsClient.create({
    url: `${ipfsW3GW}/api/v0`,
    headers: {
      authorization: `Basic ${authHeader}`,
    },
  });

  // // 2. Add file to ipfs
  const { cid } = await ipfs.add({
    path: file_path,
    content: fileBuffer,
  });
  console.log("CIDDDDD");
  console.log(cid);

  // // 3. Get file status from ipfs
  const fileStat = await ipfs.files.stat("/ipfs/" + cid);
  console.log("FILESTAT");
  console.log(fileStat);

  // return {
  //     cid: cid.path,
  //     size: fileStat.cumulativeSize
  // };
  return {
    cumulativeSize: fileStat.cumulativeSize,
    cid: fileStat.cid,
  };
}
