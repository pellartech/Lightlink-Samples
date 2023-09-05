import { ethers, network } from 'hardhat'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { solidity } from 'ethereum-waffle'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { AlphaaIO, AlphaaIO__factory } from '../typechain-types'

chai.use(solidity)
chai.use(chaiAsPromised)
const { expect } = chai

const TEN_E_18 = ethers.utils.parseEther('1')

describe('CWTToken', () => {
  let accounts: SignerWithAddress[]
  let owner: SignerWithAddress, bob: SignerWithAddress, alice: SignerWithAddress, eve: SignerWithAddress
  let mainContract: AlphaaIO

  beforeEach(async () => {
    await network.provider.send('hardhat_reset')

    accounts = await ethers.getSigners()
    owner = accounts[0]
    bob = accounts[1]
    alice = accounts[2]
    eve = accounts[3]

    const factory = (await ethers.getContractFactory('AlphaaIO', owner)) as AlphaaIO__factory
    mainContract = await factory.deploy()
    mainContract.deployed()
    await network.provider.send('evm_mine')
  })

  context('Test case for setTokenURI', () => {
    it('Should correct', async () => {
      await mainContract.connect(owner).safeMint(alice.address, 'abc')

      await mainContract.connect(owner).setTokenURI(0, 'https://google.com')

      expect(Number(await mainContract.getTokenURIsHistorySize(0))).eq(2)

      let tokenURIsHistory = await mainContract.getTokenURIsHistoryRange(0, 0, 1)
      expect(tokenURIsHistory[0]).eq('abc')
      expect(tokenURIsHistory[1]).eq('https://google.com')
    })
  })
})
