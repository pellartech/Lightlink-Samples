const ethers = require('ethers')

const pegasusRPC = 'https://replicator-01.pegasus.lightlink.io/rpc/v1'
const pegasusProvider = new ethers.providers.JsonRpcProvider(pegasusRPC)

/**
 * example: https://pegasus.lightlink.io/address/0x91C4e861bCcc57e50BB378438426D26D6E4f0E33#code
 */

const mintToken721 = async (args) => {
  // read args
  let [toAddress, amount] = args

  if (!ethers.utils.isAddress(toAddress)) {
    throw new Error('invalid toAddress')
  }

  if (isNaN(amount)) {
    amount = 1
  }

  // get signer
  const signer = ethers.Wallet.createRandom().connect(pegasusProvider)

  // get contract
  const contract = new ethers.Contract('0x91C4e861bCcc57e50BB378438426D26D6E4f0E33', ['function mint(address _account, uint256 _amount) public'], pegasusProvider)

  const txnData = contract.interface.encodeFunctionData('mint', [toAddress, 1])
  const populatedTxn = await signer.populateTransaction({
    from: signer.address,
    to: contract.address,
    data: txnData,
    gasPrice: ethers.utils.hexValue(0),
    value: ethers.utils.hexValue(0),
    type: 0,
  })

  const signedTxn = await signer.signTransaction(populatedTxn)

  const txnHash = await pegasusProvider.send('eth_sendRawTransaction', [signedTxn])

  console.log('txnHash:', `https://pegasus.lightlink.io/tx/${txnHash}`)
}

/**
 * example: https://pegasus.lightlink.io/address/0x2EDeB63b915255182341aE9D000b39678Fb4373B#code
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
  const signer = ethers.Wallet.createRandom().connect(pegasusProvider)

  // get contract
  const contract = new ethers.Contract('0x2EDeB63b915255182341aE9D000b39678Fb4373B', ['function mintTokens(uint64[] memory _tokenIds, address[] memory _accounts, uint256[] memory _amounts) public'], pegasusProvider)

  const txnData = contract.interface.encodeFunctionData('mintTokens', [[tokenId], [toAddress], [amount]])
  const populatedTxn = await signer.populateTransaction({
    from: signer.address,
    to: contract.address,
    data: txnData,
    gasPrice: ethers.utils.hexValue(0),
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
  const tokenType = args[0]

  if (tokenType === '721') {
    return await mintToken721(args.slice(1))
  }

  if (tokenType === '1155') {
    return await mintToken1155(args.slice(1))
  }

  throw new Error('invalid token type')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
