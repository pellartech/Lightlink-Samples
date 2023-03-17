// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { map } = require('lodash')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const provider = hre.ethers.getDefaultProvider(hre.network.config.url)
  const wallet = new hre.ethers.Wallet(hre.network.config.accounts[0], provider)

  const Factories = ['TokenERC1155']

  // const [wallet] = await hre.ethers.getSigners()

  let nonce = Number(await wallet.getTransactionCount())

  const resultsAddr = []
  for (const factory of Factories) {
    const Factory = await hre.ethers.getContractFactory(factory)
    const txn = await (
      await wallet.sendTransaction({
        data: Factory.bytecode,
        gasLimit: 10000000,
        gasPrice: 1000000000,
        nonce,
        from: wallet.address,
        value: 0,
        type: 0,
      })
    ).wait()
    console.log(`Contract ${factory} deployed to:`, txn.contractAddress)
    resultsAddr.push(txn.contractAddress)
    nonce += 1
  }

  console.log('Waiting for 3 seconds to verify contract')
  await sleep(3000)

  await Promise.all(
    map(resultsAddr, (addr, idx) => {
      return hre.run('verify:verify', {
        address: addr,
        constructorArguments: [],
      })
    })
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
