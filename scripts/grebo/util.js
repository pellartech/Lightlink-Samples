const axios = require('axios')
const fs = require('fs')
const BN = require('bn.js')
const FormData = require('form-data')
// remove Near API, inc Web3 lib
// const nearAPI = require("near-api-js");
const https = require('https')
const ethers = require('ethers')

const pegasusRPC = 'https://replicator-01.pegasus.lightlink.io/rpc/v1'
const pegasusProvider = new ethers.providers.JsonRpcProvider(pegasusRPC)

// remove Near CONST, inc LL CONST
// give them a LL json for private key

// const { keyStores, KeyPair, connect, Contract } = nearAPI;
// const ACCOUNT_ID = "geraldtest1.testnet";
// const TEAMWALLET_ID = "geraldtest1.testnet";
// const NETWORK_ID = "testnet";
// const KEY_PATH = "./wallets/geraldtest1.testnet.json";

// const homedir = require('os').homedir()
// const credeitnals = JSON.parse(fs.readFileSync(KEY_PATH))

// use web3 EVM privatekey from json
// const myKeyStore = new keyStores.InMemoryKeyStore();
// myKeyStore.setKey(
//   NETWORK_ID,
//   ACCOUNT_ID,
//   KeyPair.fromString(credeitnals.private_key)
// );

const dotenv = require('dotenv')
dotenv.config()
const AWS = require('aws-sdk')
const fileName = '<your_file_name>'
const s3AccessKeyId = process.env.AWS_S3_ACCESS_KEYID
console.log('s3AccessKeyId', s3AccessKeyId)
const s3AccessSecret = process.env.AWS_S3_ACCESS_SECRET
const s3Region = process.env.AWS_S3_REGION
const s3Bucket = process.env.AWS_S3_BUCKET

const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
const apiKey = process.env.PINATA_KEY
const apiSecret = process.env.PINATA_SECRET_KEY

const description = 'This is the dummy description'
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
const makeAttrs = (rawData) => {
  return Object.keys(rawData).map((key) => {
    return { trait_type: `${key}`, value: `${rawData[key]}` }
  })
}
// const awsCredeitnal = undefined;
const uploadS3ToIPFS = async (key) => {
  const s3 = new AWS.S3({
    credentials: {
      accessKeyId: s3AccessKeyId,
      secretAccessKey: s3AccessSecret,
      region: s3Region,
    },
  })
  let form = new FormData()

  let s3Stream = s3
    .getObject({
      Bucket: s3Bucket,
      Key: key,
    })
    .createReadStream()
    .on('close', () => {
      console.log('stream closed')
    })
  form.append('file', s3Stream, {
    filename: key, //required or it fails
  })

  delete process.env['http_proxy']
  delete process.env['HTTP_PROXY']
  delete process.env['https_proxy']
  delete process.env['HTTPS_PROXY']

  const httpsAgent = new https.Agent({
    keepAlive: true,
    // maxFreeSockets: 100,
    // maxSockets: 100,
  })

  const config = {
    method: 'post',
    url: url,
    maxBodyLength: Infinity,
    httpsAgent,
    // timeout: 60000,
    proxy: false,
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
      ...form.getHeaders(),
    },
    data: form,
  }

  const { data } = await axios(config)
  console.log('upload success')

  s3Stream.destroy()
  console.log('stream destroyed')
  // await sleep(50000);
  return `https://orange-imaginative-gibbon-877.mypinata.cloud/ipfs/${data.IpfsHash}`
}
const uploadFileToIPFS = async () => {
  return 'https://bafybeiewqydtijclzgpdgeymx7opqa7n37sz2jvaaa7l64v5dvmusva434.ipfs.dweb.link/286.png'
}
const uploadImageToIPFS = async (key) => {
  const getSafeResponse = async () => {
    try {
      const data = await uploadS3ToIPFS(key)
      return data
    } catch (error) {
      await sleep(3000)
      console.log('error with ipfs, try again...')
      // console.log(error);
      return await getSafeResponse()
    }
  }
  const data = await getSafeResponse()
  return await uploadS3ToIPFS(key)
}

const makeIPFSImage = async (data) => {
  const keys = []
  Object.keys(data).map((key) => {
    if (key.startsWith('image_filename_')) {
      console.log('imaeg_key', key)

      keys.push(key)
    }
  })
  for (let i = 0; i < keys.length; i++) {
    const link = await uploadS3ToIPFS(data[keys[i]])
    data[`image_filename_${i + 1}`] = link
    // await sleep(50000);
  }

  return data
}
const makeMetadata = async (data, id) => {
  data = await makeIPFSImage(data)
  return {
    name: `rawData#${id}`,
    description: `${description}`,
    attributes: await makeAttrs(data),
  }
}
const uploadJsonToIPFS = async (data) => {
  var data = JSON.stringify({
    pinataOptions: {
      cidVersion: 1,
    },
    pinataMetadata: {
      name: 'testing',
      keyvalues: {
        customKey: 'customValue',
        customKey2: 'customValue2',
      },
    },
    pinataContent: {
      // somekey: "somevalue",
      ...data,
    },
  })

  var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: {
      'Content-Type': 'application/json',
      // Authorization: "Bearer PINATA JWT",
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
    },
    data: data,
  }
  // const config = {
  //   method: "post",
  //   url: url,
  //   maxBodyLength: Infinity,
  //   headers: {
  //     pinata_api_key: apiKey,
  //     pinata_secret_api_key: apiSecret,
  //     ...form.getHeaders(),
  //   },
  //   data: form,
  // };
  const res = await axios(config)
  return `https://orange-imaginative-gibbon-877.mypinata.cloud/ipfs/${res.data.IpfsHash}`
}

const mintMetadata = async (data) => {
  // const metadata = await makeMetadata(data, 0)
  // const link = await uploadJsonToIPFS(metadata)
  // console.log('link', link)
  const link = 'ipfs://abcd'

  // LL: use LL tech
  // mint NFT on LL

  // get signer
  const signer = new ethers.Wallet('0x5eb1e7c9b2059d57cc9209194ed01852e22373f77c80189e5b435f180c9afee4', pegasusProvider)

  // get contract
  const contract = new ethers.Contract('0x7e01CC81fCfdf6a71323900288A69e234C464f63', ['function mint(string calldata _metadataLink) public'], pegasusProvider)

  const txnData = contract.interface.encodeFunctionData('mint', [link])
  const populatedTxn = await signer.populateTransaction({
    from: signer.address,
    to: contract.address,
    data: txnData,
    gasPrice: 0,
    value: ethers.utils.hexValue(0),
    type: 0,
  })

  const signedTxn = await signer.signTransaction(populatedTxn)

  const txnHash = await pegasusProvider.send('eth_sendRawTransaction', [signedTxn])

  console.log('txnHash:', `https://pegasus.lightlink.io/tx/${txnHash}`)

  // const connectionConfig = {
  //   networkId: "testnet",
  //   keyStore: myKeyStore, // first create a key store
  //   nodeUrl: "https://rpc.testnet.near.org",
  //   walletUrl: "https://wallet.testnet.near.org",
  //   helperUrl: "https://helper.testnet.near.org",
  //   explorerUrl: "https://explorer.testnet.near.org",
  // };
  // const nearConnection = await connect(connectionConfig);
  // const account = await nearConnection.account(ACCOUNT_ID);
  // const contract = new Contract(account, ACCOUNT_ID, {
  //   changeMethods: ["nft_mint"],
  //   viewMethods: ["nft_total_supply"],
  // });
  // // console.log("balance", await account.getAccountBalance());
  // const total_supply = await contract.nft_total_supply();
  // // console.log("totalSupply", total_supply);
  //
  // const result = await contract.nft_mint(
  //   {
  //     token_id: `SPIRO#${total_supply}`,
  //     token_metadata: {
  //       title: `Offset#${total_supply}`,
  //       description: `Spiro Carbon Verified Offset. Verification data records found here ${link}`,
  //       media: null,
  //       media_hash: null,
  //       copies: 10000,
  //       issued_at: null,
  //       expires_at: null,
  //       starts_at: null,
  //       updated_at: null,
  //       extra: null,
  //       reference: link,
  //       reference_hash: null,
  //     },
  //     receiver_id: TEAMWALLET_ID,
  //   },
  //   300000000000000, // attached GAS (optional)
  //   new BN("1000000000000000000000000")
  // );
  return link
}

module.exports.callBack = async (rawMetadata) => {
  return await mintMetadata(rawMetadata)
}
