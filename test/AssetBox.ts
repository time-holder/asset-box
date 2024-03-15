import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { assert } from 'chai'
import { viem } from 'hardhat'
import type { WalletClient } from './common'
import { testAssetBox } from './asserts/AssetBox'

describe('AssetBox', () => {
  async function deployFixture() {
    const [_, user] = (await viem.getWalletClients()) as WalletClient[]

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
      State: {
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
