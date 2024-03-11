import { viem } from 'hardhat'
import { deployContracts, getAssets, depositAssets } from './common'
import type { WalletClient, PublicClient } from './common'
import { testAssetBox } from './asserts/AssetBox'

describe('AssetBox',  () => {
  async function deployFixture () {
    const testContracts = await deployContracts()

    const publicClient = await viem.getPublicClient() as PublicClient
    const [
      _,
      user,
      hacker,
    ] = await viem.getWalletClients() as WalletClient[]

    const AssetBox = await viem.deployContract('AssetBox', [
      user.account.address,
    ])

    await getAssets(user, testContracts)
    await depositAssets(user, AssetBox, testContracts)

    return {
      ...testContracts,
      AssetBox,
      publicClient,
      user,
      hacker,
    }
  }

  testAssetBox(deployFixture)
})
