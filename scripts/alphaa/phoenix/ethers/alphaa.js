const ethers = require('ethers')
const { config } = require('dotenv')
config()

const phoenixRPC = 'https://replicator-01.phoenix.lightlink.io/rpc/v1'
const phoenixProvider = new ethers.providers.JsonRpcProvider(phoenixRPC)

/**
 * example: https://phoenix.lightlink.io/address/0xe1C24c79F4eb1AA70B26974cDE1718f84b87697F#code
 */

const mintToken1155 = async (args) => {
  // read args
  let [tokenId, toAddress, amount] = args

  if (isNaN(tokenId)) {
    throw new Error('invalid tokenId')
  }

  if (!ethers.utils.isAddress(toAddress)) {
    throw new Error('invalid toAddress')
  }

  if (isNaN(amount)) {
    amount = 1
  }

  // get signer
  const signer = new ethers.Wallet(process.env.PHOENIX_ADMIN_PK, phoenixProvider)

  // get contract
  const contract = new ethers.Contract('0xe1C24c79F4eb1AA70B26974cDE1718f84b87697F', ['function mint(address account, uint256 id, uint256 amount, bytes memory data) public'], phoenixProvider)

  const txnData = contract.interface.encodeFunctionData('mint', [toAddress, tokenId, amount, '0x'])
  const populatedTxn = await signer.populateTransaction({
    from: signer.address,
    to: contract.address,
    data: txnData,
    gasPrice: 0,
    value: ethers.utils.hexValue(0),
    type: 0,
  })

  const signedTxn = await signer.signTransaction(populatedTxn)

  const txnHash = await phoenixProvider.send('eth_sendRawTransaction', [signedTxn])

  console.log('txnHash:', `https://phoenix.lightlink.io/tx/${txnHash}`)
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
