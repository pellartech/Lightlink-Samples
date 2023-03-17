import { ethers, network } from 'hardhat'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { solidity } from 'ethereum-waffle'

// import { CWTToken, CWTToken__factory } from '../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

chai.use(solidity)
chai.use(chaiAsPromised)
const { expect } = chai

const TEN_E_18 = ethers.utils.parseEther('1')

describe('CWTToken', () => {
  // let accounts: SignerWithAddress[]
  // let owner: SignerWithAddress, bob: SignerWithAddress, alice: SignerWithAddress, eve: SignerWithAddress
  // let cwtToken: CWTToken

  // beforeEach(async () => {
  //   await network.provider.send('hardhat_reset')

  //   accounts = await ethers.getSigners()
  //   owner = accounts[0]
  //   bob = accounts[1]
  //   alice = accounts[2]
  //   eve = accounts[3]

  //   const factory = (await ethers.getContractFactory('CWTToken', owner)) as CWTToken__factory
  //   cwtToken = await factory.deploy()
  //   cwtToken.deployed()
  //   await network.provider.send('evm_mine')
  // })

  // context('Requirements', () => {
  //   it('Should have symbol CWT and name CWT', async () => {
  //     const name = await cwtToken.name()
  //     const symbol = await cwtToken.symbol()

  //     expect(name).to.equal('CWT')
  //     expect(symbol).to.equal('CWT')
  //   })

  //   it('Should have 18 decimals', async () => {
  //     const decimals = await cwtToken.decimals()
  //     expect(decimals).to.equal(18)
  //   })

  //   it('Should mint 140 million CWT to owner on deploy', async () => {
  //     const ownerBalance = await cwtToken.balanceOf(owner.address)
  //     const MAX_SUPPLY = await cwtToken.MAX_SUPPLY()

  //     expect(ownerBalance).to.equal(MAX_SUPPLY)
  //   })
  // })
})
