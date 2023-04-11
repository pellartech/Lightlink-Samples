const ethers = require('ethers')
const { config } = require('dotenv')
config()

const phoenixRPC = 'https://replicator-01.phoenix.lightlink.io/rpc/v1'
const phoenixProvider = new ethers.providers.JsonRpcProvider(phoenixRPC)

/**
 * example: https://phoenix.lightlink.io/address/0xfCd6a6f0aeC1585A5D67976E4e902550Bfe81C15#code
 */

const mintToken721 = async (args) => {
  // read args
  let [toAddress, uri] = args

  if (!ethers.utils.isAddress(toAddress)) {
    throw new Error('invalid toAddress')
  }

  if (!uri) {
    throw new Error('invalid uri')
  }

  // get signer
  const signer = new ethers.Wallet(process.env.PHOENIX_ADMIN_PK, phoenixProvider)

  // get contract
  const contract = new ethers.Contract('0xfCd6a6f0aeC1585A5D67976E4e902550Bfe81C15', ['function safeMint(address to, string memory uri) public'], phoenixProvider)

  const txnData = contract.interface.encodeFunctionData('safeMint', [toAddress, uri])
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

  return await mintToken721(args)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
