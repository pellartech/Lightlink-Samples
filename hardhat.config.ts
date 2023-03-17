import { config } from 'dotenv'

import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'

config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 9999,
          },
        },
      },
      {
        version: '0.8.15',
        settings: {
          optimizer: {
            enabled: true,
            runs: 9999,
          },
        },
      },
      {
        version: '0.8.13',
        settings: {
          optimizer: {
            enabled: true,
            runs: 9999,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0,
      blockGasLimit: 999999999999999,
      accounts: require('./accounts.json'),
    },
    pegasus: {
      url: process.env.PEGASUS_PROVIDER_URL,
      accounts: [process.env.PEGASUS_PRIVATE_KEY],
    },
  },
  mocha: {
    timeout: 200000,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },

  etherscan: {
    apiKey: {
      pegasus: '12345678',
    },
    customChains: [
      {
        network: 'pegasus',
        chainId: 1891,
        urls: {
          apiURL: 'https://pegasus.lightlink.io/api',
          browserURL: 'https://pegasus.lightlink.io',
        },
      },
    ],
  },
}
