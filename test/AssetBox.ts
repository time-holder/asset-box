import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { assert } from 'chai'
import { viem } from 'hardhat'
import { testAssetBox } from './asserts/AssetBox'
import type { WalletClient } from '@nomicfoundation/hardhat-viem/types'

describe('AssetBox', () => {
  async function deployFixture() {
    const [, user] = (await viem.getWalletClients()) as WalletClient[]

    const AssetBox = await viem.deployContract('AssetBox', [
      user.account.address,
    ])

    return {
      AssetBox,
      user,
    }
  }

  testAssetBox(
    async () => {
      const { AssetBox, user } = await deployFixture()
      return {
        AssetBox,
        owner: user,
      }
    },
    {
      stateTest: {
        extra: () => {
          it('#name()', async () => {
            const { AssetBox } = await loadFixture(deployFixture)
            assert.equal(await AssetBox.read.name(), 'AssetBox')
          })
        },
      },
    },
  )
})
