import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { assert } from 'chai'
import { viem } from 'hardhat'
import { getAddress } from 'viem'
import { testCallable, type CallableTestOptions } from './Callable'
import { testReceivable, type ReceivableTestOptions } from './Receivable'
import { testWithdrawable, type WithdrawableTestOptions } from './Withdrawable'
import { deployContracts } from '../common'
import type { PublicClient, WalletClient, TestTypes } from '../common'

type StateTestOptions = {
  extra?: () => void
}

type SecurityTestOptions = {
  extra?: () => void
}

export function testAssetBox(
  baseDeployFixture: () => Promise<{
    AssetBox: TestTypes['AssetBox']
    owner: WalletClient
  }>,
  {
    stateTest,
    securityTest,
    callableTest,
    receivableTest,
    withdrawableTest,
  }: {
    stateTest?: StateTestOptions
    securityTest?: SecurityTestOptions
    callableTest?: CallableTestOptions
    receivableTest?: ReceivableTestOptions
    withdrawableTest?: WithdrawableTestOptions
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

    stateTest?.extra?.()
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

    securityTest?.extra?.()
  })

  testCallable(async () => {
    const { AssetBox, owner } = await baseDeployFixture()
    return {
      Callable: AssetBox as unknown as TestTypes['Callable'],
      owner,
    }
  }, callableTest)

  testReceivable(async () => {
    const { AssetBox, owner } = await baseDeployFixture()
    return {
      Receivable: AssetBox as unknown as TestTypes['Receivable'],
      owner,
    }
  }, receivableTest)

  testWithdrawable(async () => {
    const { AssetBox, owner } = await baseDeployFixture()
    return {
      Withdrawable: AssetBox as unknown as TestTypes['Withdrawable'],
      owner,
    }
  }, withdrawableTest)
}
