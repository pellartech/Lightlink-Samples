const ethers = require('ethers')

const pegasusRPC = 'https://replicator-01.pegasus.lightlink.io/rpc/v1'
const pegasusProvider = new ethers.providers.JsonRpcProvider(pegasusRPC)

/**
 * example: https://pegasus.lightlink.io/address/0x5C1e26EAA60b042a304822e6449aA8Ef1Ac6aEFE
 */

const mintToken = async (args) => {
  // read args
  let [toAddress, amount] = args

  if (!ethers.utils.isAddress(toAddress)) {
    throw new Error('invalid toAddress')
  }

  if (isNaN(amount)) {
    amount = 1
  }

  // get signer
  const signer = new ethers.Wallet('0x5eb1e7c9b2059d57cc9209194ed01852e22373f77c80189e5b435f180c9afee4', pegasusProvider)

  // get contract
  const contract = new ethers.Contract('0x5C1e26EAA60b042a304822e6449aA8Ef1Ac6aEFE', ['function adminMint(address to, uint256 amount) public'], pegasusProvider)

  const txnData = contract.interface.encodeFunctionData('adminMint', [
    toAddress, //
    ethers.BigNumber.from(amount).mul(ethers.BigNumber.from(10).pow(18)),
  ])
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
}

const main = async () => {
  // read args
  const args = process.argv.slice(2)

  await mintToken(args)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
