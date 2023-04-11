const Web3 = require('web3')
const { config } = require('dotenv')
config()

const phoenixRPC = 'https://replicator-01.phoenix.lightlink.io/rpc/v1'
const phoenixProvider = new Web3(phoenixRPC)

/**
 * example: https://phoenix.lightlink.io/address/0xfCd6a6f0aeC1585A5D67976E4e902550Bfe81C15#code
 */

const mintToken721 = async (args) => {
  // read args
  let [toAddress, uri] = args

  if (!phoenixProvider.utils.isAddress(toAddress)) {
    throw new Error('invalid toAddress')
  }

  if (!uri) {
    throw new Error('invalid uri')
  }

  // get signer
  const signer = phoenixProvider.eth.accounts.privateKeyToAccount(process.env.PHOENIX_ADMIN_PK)

  // get contract
  const contract = new phoenixProvider.eth.Contract(
    [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'uri',
            type: 'string',
          },
        ],
        name: 'safeMint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    '0xfCd6a6f0aeC1585A5D67976E4e902550Bfe81C15'
  )

  const txnData = contract.methods.safeMint(toAddress, uri).encodeABI()
  const gasEstimate = await contract.methods.safeMint(toAddress, uri).estimateGas({ from: signer.address })
  const populatedTxn = {
    from: signer.address,
    to: contract.options.address,
    data: txnData,
    gasPrice: 0,
    gasLimit: gasEstimate * 3,
    value: 0,
    type: 0,
  }

  const signedTxn = await signer.signTransaction(populatedTxn)

  const txnHash = await phoenixProvider.eth.sendSignedTransaction(signedTxn.rawTransaction)
  console.log('txnHash:', `https://phoenix.lightlink.io/tx/${txnHash.transactionHash}`)
}

const main = async () => {
  // read args
  const args = process.argv.slice(2)

  return await mintToken721(args)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
