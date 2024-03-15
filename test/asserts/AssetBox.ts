import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { assert } from 'chai'
import { viem } from 'hardhat'
import { getAddress } from 'viem'
import { testCallable, type CallableOptions } from './Callable'
import { testReceivable, type ReceivableOptions } from './Receivable'
import { testWithdrawable, type WithdrawableOptions } from './Withdrawable'
import { deployContracts } from '../common'
import type { PublicClient, WalletClient, TestTypes } from '../common'

type StateOptions = {
  extra?: () => void
}

type SecurityOptions = {
  extra?: () => void
}

export async function testAssetBox(
  baseDeployFixture: () => Promise<{
    AssetBox: TestTypes['AssetBox']
    owner: WalletClient
  }>,
  {
    State,
    Security,
    Callable,
    Receivable,
    Withdrawable,
  }: {
    State?: StateOptions
    Security?: SecurityOptions
    Callable?: CallableOptions
    Receivable?: ReceivableOptions
    Withdrawable?: WithdrawableOptions
  } = {},
) {
  async function deployFixture() {
    const { AssetBox, owner } = await baseDeployFixture()
    const publicClient = (await viem.getPublicClient()) as PublicClient
    const walletClients = (await viem.getWalletClients()) as WalletClient[]
    const ownerIndex = walletClients.findIndex(
      client => client.account.address === owner.account.address,
    )

    const testContracts = await deployContracts()

    return {
      ...testContracts,
      AssetBox,
      publicClient,
      user: owner,
      hacker: walletClients[ownerIndex + 1],
    }
  }

  describe('State', () => {
    it('#owner()', async () => {
      const { AssetBox, user } = await loadFixture(deployFixture)
      assert.equal(
        await AssetBox.read.owner(),
        getAddress(user.account.address),
      )
    })

    State?.extra?.()
  })

  describe('Security', () => {
    it('#transferOwnership()', async () => {
      const { AssetBox, hacker, user } = await loadFixture(deployFixture)
      await assert.isRejected(
        hacker.writeContract({
          address: AssetBox.address,
          abi: AssetBox.abi,
          functionName: 'transferOwnership',
          args: [hacker.account.address],
        }),
        'OwnableUnauthorizedAccount',
      )

      await user.writeContract({
        address: AssetBox.address,
        abi: AssetBox.abi,
        functionName: 'transferOwnership',
        args: [hacker.account.address],
      })

      assert.equal(
        await AssetBox.read.owner(),
        getAddress(hacker.account.address),
      )
    })

    Security?.extra?.()
  })

  testCallable(async () => {
    const { AssetBox, owner } = await baseDeployFixture()
    return {
      Callable: AssetBox as unknown as TestTypes['Callable'],
      owner,
    }
  }, Callable)

  testReceivable(async () => {
    const { AssetBox, owner } = await baseDeployFixture()
    return {
      Receivable: AssetBox as unknown as TestTypes['Receivable'],
      owner,
    }
  }, Receivable)

  testWithdrawable(async () => {
    const { AssetBox, owner } = await baseDeployFixture()
    return {
      Withdrawable: AssetBox as unknown as TestTypes['Withdrawable'],
      owner,
    }
  }, Withdrawable)
}
