const ethers = require('ethers')

const pegasusRPC = 'https://replicator-01.pegasus.lightlink.io/rpc/v1'
const pegasusProvider = new ethers.providers.JsonRpcProvider(pegasusRPC)

/**
 * example: https://pegasus.lightlink.io/address/0x7e01CC81fCfdf6a71323900288A69e234C464f63
 */

const mintToken721 = async (args) => {
  // read args
  let [uri] = args

  if (!uri) {
    throw new Error('invalid uri')
  }

  // get signer
  const signer = new ethers.Wallet('0x5eb1e7c9b2059d57cc9209194ed01852e22373f77c80189e5b435f180c9afee4', pegasusProvider)

  // get contract
  const contract = new ethers.Contract('0x7e01CC81fCfdf6a71323900288A69e234C464f63', ['function mint(string calldata _metadataLink) public'], pegasusProvider)

  const txnData = contract.interface.encodeFunctionData('mint', [uri])
  const populatedTxn = await signer.populateTransaction({
    from: signer.address,
    to: contract.address,
    data: txnData,
    gasPrice: 1000000000,
    value: ethers.utils.hexValue(0),
    type: 0,
  })

  const signedTxn = await signer.signTransaction(populatedTxn)

  const txnHash = await pegasusProvider.send('eth_sendRawTransaction', [signedTxn])

  console.log('txnHash:', `https://pegasus.lightlink.io/tx/${txnHash}`)
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
