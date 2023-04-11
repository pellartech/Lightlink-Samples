const ethers = require('ethers')
const moment = require('moment')

const pegasusRPC = 'https://replicator-01.pegasus.lightlink.io/rpc/v1'
const pegasusProvider = new ethers.providers.JsonRpcProvider(pegasusRPC)

/**
 * example: https://pegasus.lightlink.io/address/0x7751831EfDEB56b4E60f79bCEb8e867A6C5Eb695
 */

const vestingToken = async (args) => {
  // read args
  let [toAddress] = args

  if (!ethers.utils.isAddress(toAddress)) {
    throw new Error('invalid toAddress')
  }

  const currentTime = moment.utc().unix()
  const duration = 2 * 60 // 2 minutes
  const milestoneCount = 2
  const tokensPerMilestone = 100

  // get signer
  const signer = new ethers.Wallet('0x5eb1e7c9b2059d57cc9209194ed01852e22373f77c80189e5b435f180c9afee4', pegasusProvider)

  // get contract
  const contract = new ethers.Contract(
    '0x7751831EfDEB56b4E60f79bCEb8e867A6C5Eb695', //
    ['function addVestingSchedule(address _beneficiary, uint256 _start, uint256 _duration, uint256 _milestoneCount, uint256 _tokensPerMilestone) public'],
    pegasusProvider
  )

  const txnData = contract.interface.encodeFunctionData('addVestingSchedule', [toAddress, currentTime, duration, milestoneCount, tokensPerMilestone])
  const populatedTxn = await signer.populateTransaction({
    from: signer.address,
    to: contract.address,
    data: txnData,
    gasPrice: 0,
    value: ethers.utils.hexValue(0),
    gasLimit: 10000000,
    type: 0,
  })

  const signedTxn = await signer.signTransaction(populatedTxn)

  const txnHash = await pegasusProvider.send('eth_sendRawTransaction', [signedTxn])

  console.log('txnHash:', `https://pegasus.lightlink.io/tx/${txnHash}`)
}

const main = async () => {
  // read args
  const args = process.argv.slice(2)

  return await vestingToken(args)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
