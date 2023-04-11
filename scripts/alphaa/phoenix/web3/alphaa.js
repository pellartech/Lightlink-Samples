const Web3 = require('web3')
const { config } = require('dotenv')
config()

const phoenixRPC = 'https://replicator-01.phoenix.lightlink.io/rpc/v1'
const phoenixProvider = new Web3(phoenixRPC)

/**
 * example: https://phoenix.lightlink.io/address/0xe1C24c79F4eb1AA70B26974cDE1718f84b87697F#code
 */

const mintToken1155 = async (args) => {
  // read args
  let [tokenId, toAddress, amount] = args

  if (isNaN(tokenId)) {
    throw new Error('invalid tokenId')
  }

  if (!phoenixProvider.utils.isAddress(toAddress)) {
    throw new Error('invalid toAddress')
  }

  if (isNaN(amount)) {
    amount = 1
  }

  // get signer by private key and web3
  const signer = phoenixProvider.eth.accounts.privateKeyToAccount(process.env.PHOENIX_ADMIN_PK)

  // get contract
  const contract = new phoenixProvider.eth.Contract(
    [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'account',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'id',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    '0xe1C24c79F4eb1AA70B26974cDE1718f84b87697F'
  )

  const txnData = contract.methods.mint(toAddress, tokenId, amount, '0x').encodeABI()
  const gasEstimate = await contract.methods.mint(toAddress, tokenId, amount, '0x').estimateGas({ from: signer.address })
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

  await mintToken1155(args)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
