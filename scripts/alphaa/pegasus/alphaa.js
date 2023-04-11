const ethers = require('ethers')

const pegasusRPC = 'https://replicator-01.pegasus.lightlink.io/rpc/v1'
const pegasusProvider = new ethers.providers.JsonRpcProvider(pegasusRPC)

/**
 * example: https://pegasus.lightlink.io/address/0x8c23874f41d6F89819Be4B211C8A06Aa156ab953#code
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
  const signer = new ethers.Wallet('0x5eb1e7c9b2059d57cc9209194ed01852e22373f77c80189e5b435f180c9afee4', pegasusProvider)

  // get contract
  const contract = new ethers.Contract('0x8c23874f41d6F89819Be4B211C8A06Aa156ab953', ['function mint(address account, uint256 id, uint256 amount, bytes memory data) public'], pegasusProvider)

  const txnData = contract.interface.encodeFunctionData('mint', [toAddress, tokenId, amount, '0x'])
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

  await mintToken1155(args)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
