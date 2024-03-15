import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { assert } from 'chai'
import { viem } from 'hardhat'
import { Address, formatEther, getAddress, parseEther, parseUnits } from 'viem'
import { numberFixed } from '../utils'
import { deployContracts, claimAssets, depositAssets } from '../common'
import type {
  PublicClient,
  WalletClient,
  TestContracts,
  TestClients,
  TestTypes,
} from '../common'

interface TestData extends TestContracts, TestClients {
  Withdrawable: TestTypes['Withdrawable']
}

export type WithdrawableOptions = {
  extra?: () => void
  '#withdraw()'?: (data: TestData) => void
  '#withdrawERC20()'?: (data: TestData) => void
  '#withdrawERC721()'?: (
    data: TestData,
    params: {
      params: [string | Address, number, string]
      functionSignature: string
    },
  ) => void
  '#withdrawERC1155()'?: (
    data: TestData,
    params: {
      params: [string | Address, number, number, string]
      functionSignature: string
    },
  ) => void
  '#withdrawERC1155Batch()'?: (
    data: TestData,
    params: {
      params: [string | Address, number[], number[], string]
      functionSignature: string
    },
  ) => void
}

export async function testWithdrawable(
  baseDeployFixture: () => Promise<{
    Withdrawable: TestTypes['Withdrawable']
    owner: WalletClient
  }>,
  options?: WithdrawableOptions,
) {
  async function deployFixture() {
    const { Withdrawable, owner } = await baseDeployFixture()
    const publicClient = (await viem.getPublicClient()) as PublicClient
    const walletClients = (await viem.getWalletClients()) as WalletClient[]
    const ownerIndex = walletClients.findIndex(
      client => client.account.address === owner.account.address,
    )

    const testContracts = await deployContracts()
    await claimAssets(owner, testContracts)
    await depositAssets(Withdrawable.address, owner, testContracts)

    return {
      ...testContracts,
      Withdrawable,
      publicClient,
      user: owner,
      hacker: walletClients[ownerIndex + 1],
    }
  }

  describe('Withdrawable', () => {
    it('#withdraw()', async () => {
      const data = await loadFixture(deployFixture)
      const { Withdrawable, publicClient, user, hacker } = data
      await options?.['#withdraw()']?.(data)

      await assert.isRejected(
        hacker.writeContract({
          address: Withdrawable.address,
          abi: Withdrawable.abi,
          functionName: 'withdraw',
          args: [],
        }),
        'OwnableUnauthorizedAccount',
      )

      const userBalance = await publicClient.getBalance({
        address: user.account.address,
      })
      const WithdrawableBalance = await publicClient.getBalance({
        address: Withdrawable.address,
      })
      await user.writeContract({
        address: Withdrawable.address,
        abi: Withdrawable.abi,
        functionName: 'withdraw',
        args: [parseEther('3')],
      })
      assert.equal(
        await publicClient.getBalance({ address: Withdrawable.address }),
        WithdrawableBalance - parseEther('3'),
      )

      await user.writeContract({
        address: Withdrawable.address,
        abi: Withdrawable.abi,
        functionName: 'withdraw',
        args: [],
      })
      assert.equal(
        await publicClient.getBalance({ address: Withdrawable.address }),
        0n,
      )
      assert.equal(
        numberFixed(
          formatEther(
            await publicClient.getBalance({ address: user.account.address }),
          ),
        ),
        numberFixed(formatEther(userBalance + WithdrawableBalance)),
      )
    })

    it('#withdrawERC20()', async () => {
      const data = await loadFixture(deployFixture)
      const { USDC, Withdrawable, hacker, user } = data
      await options?.['#withdrawERC20()']?.(data)

      await assert.isRejected(
        hacker.writeContract({
          address: Withdrawable.address,
          abi: Withdrawable.abi,
          functionName: 'withdrawERC20',
          args: [USDC.address],
        }),
        'OwnableUnauthorizedAccount',
      )

      const balance = await USDC.read.balanceOf([user.account.address])
      await user.writeContract({
        address: Withdrawable.address,
        abi: Withdrawable.abi,
        functionName: 'withdrawERC20',
        args: [USDC.address, parseUnits('3000', 6)],
      })
      assert.equal(
        await USDC.read.balanceOf([Withdrawable.address]),
        parseUnits('7000', 6),
      )

      await user.writeContract({
        address: Withdrawable.address,
        abi: Withdrawable.abi,
        functionName: 'withdrawERC20',
        args: [USDC.address],
      })
      assert.equal(
        await USDC.read.balanceOf([Withdrawable.address]),
        parseUnits('0', 6),
      )
      assert.equal(
        await USDC.read.balanceOf([user.account.address]),
        balance + parseUnits('10000', 6),
      )
    })

    it('#withdrawERC721()', async () => {
      const data = await loadFixture(deployFixture)
      const { NFT721, Withdrawable, hacker, user } = data
      const params: [string | Address, number, string] = [
        NFT721.address,
        999,
        '0x',
      ]
      const functionSignature = 'withdrawERC721'

      await options?.['#withdrawERC721()']?.(data, {
        params,
        functionSignature,
      })

      await assert.isRejected(
        hacker.writeContract({
          address: Withdrawable.address,
          abi: Withdrawable.abi,
          functionName: functionSignature,
          args: params,
        }),
        'OwnableUnauthorizedAccount',
      )

      await user.writeContract({
        address: Withdrawable.address,
        abi: Withdrawable.abi,
        functionName: functionSignature,
        args: params,
      })
      assert.equal(
        await NFT721.read.ownerOf([999n]),
        getAddress(user.account.address),
      )
    })

    it('#withdrawERC1155()', async () => {
      const data = await loadFixture(deployFixture)
      const { NFT1155, Withdrawable, hacker, user } = data
      const params: [string | Address, number, number, string] = [
        NFT1155.address,
        888,
        5000,
        '0x',
      ]
      const functionSignature = 'withdrawERC1155'

      await options?.['#withdrawERC1155()']?.(data, {
        params,
        functionSignature,
      })

      await assert.isRejected(
        hacker.writeContract({
          address: Withdrawable.address,
          abi: Withdrawable.abi,
          functionName: functionSignature,
          args: params,
        }),
        'OwnableUnauthorizedAccount',
      )

      await user.writeContract({
        address: Withdrawable.address,
        abi: Withdrawable.abi,
        functionName: functionSignature,
        args: params,
      })
      assert.deepEqual(
        await NFT1155.read.balanceOfBatch([
          [Withdrawable.address, Withdrawable.address, user.account.address],
          [1n, 666n, 888n],
        ]),
        [100n, 1000n, 5000n],
      )
    })

    it('#withdrawERC1155Batch()', async () => {
      const data = await loadFixture(deployFixture)
      const { NFT1155, Withdrawable, hacker, user } = data
      const params: [string | Address, number[], number[], string] = [
        NFT1155.address,
        [1, 666],
        [100, 1000],
        '0x',
      ]
      const functionSignature = 'withdrawERC1155Batch'

      await options?.['#withdrawERC1155Batch()']?.(data, {
        params,
        functionSignature,
      })

      await assert.isRejected(
        hacker.writeContract({
          address: Withdrawable.address,
          abi: Withdrawable.abi,
          functionName: functionSignature,
          args: params,
        }),
        'OwnableUnauthorizedAccount',
      )

      await user.writeContract({
        address: Withdrawable.address,
        abi: Withdrawable.abi,
        functionName: functionSignature,
        args: params,
      })
      assert.deepEqual(
        await NFT1155.read.balanceOfBatch([
          [user.account.address, user.account.address, Withdrawable.address],
          [1n, 666n, 888n],
        ]),
        [100n, 1000n, 5000n],
      )
    })

    options?.extra?.()
  })
}
