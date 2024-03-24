import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { assert } from 'chai'
import { viem } from 'hardhat'
import { encodeFunctionData, getAddress, parseEther } from 'viem'
import { deployContracts, claimAssets, depositAssets } from '../common'
import type {
  PublicClient,
  WalletClient,
  TestContracts,
  TestClients,
  TestTypes,
} from '../common'

interface TestData extends TestContracts, TestClients {
  Callable: TestTypes['Callable']
}

export type CallableOptions = {
  extra?: () => void
  '#callContract()'?: (
    data: TestData,
    params: {
      deposit: string
      withdraw: string
      safeTransferFrom: string
    },
  ) => void
}

export async function testCallable(
  baseDeployFixture: () => Promise<{
    Callable: TestTypes['Callable']
    owner: WalletClient
  }>,
  options?: CallableOptions,
) {
  async function deployFixture() {
    const { Callable, owner } = await baseDeployFixture()
    const publicClient = (await viem.getPublicClient()) as PublicClient
    const walletClients = (await viem.getWalletClients()) as WalletClient[]
    const ownerIndex = walletClients.findIndex(
      client => client.account.address === owner.account.address,
    )

    const testContracts = await deployContracts()
    await claimAssets(owner, testContracts)
    await depositAssets(Callable.address, owner, testContracts)

    return {
      ...testContracts,
      Callable,
      publicClient,
      user: owner,
      hacker: walletClients[ownerIndex + 1],
    }
  }

  describe('Callable', () => {
    it('#callContract()', async () => {
      const data = await loadFixture(deployFixture)
      const { WETH, NFT721, Callable, publicClient, user, hacker } = data

      const deposit = encodeFunctionData({
        abi: WETH.abi,
        functionName: 'deposit',
        args: [],
      })

      const withdraw = encodeFunctionData({
        abi: WETH.abi,
        functionName: 'withdraw',
        args: [parseEther('10')],
      })

      const safeTransferFrom = encodeFunctionData({
        abi: NFT721.abi,
        functionName: 'safeTransferFrom',
        args: [Callable.address, hacker.account.address, 999n],
      })

      await options?.['#callContract()']?.(data, {
        deposit,
        withdraw,
        safeTransferFrom,
      })

      await assert.isRejected(
        hacker.writeContract({
          address: Callable.address,
          abi: Callable.abi,
          functionName: 'callContract',
          args: [WETH.address, deposit, parseEther('10')],
        }),
        'OwnableUnauthorizedAccount',
      )
      await assert.isRejected(
        hacker.writeContract({
          address: Callable.address,
          abi: Callable.abi,
          functionName: 'callContract',
          args: [WETH.address, withdraw],
        }),
        'OwnableUnauthorizedAccount',
      )
      await assert.isRejected(
        hacker.writeContract({
          address: Callable.address,
          abi: Callable.abi,
          functionName: 'callContract',
          args: [NFT721.address, safeTransferFrom],
        }),
        'OwnableUnauthorizedAccount',
      )

      let ETHBalance = await publicClient.getBalance({
        address: Callable.address,
      })
      let WETHBalance = await WETH.read.balanceOf([Callable.address])
      await user.writeContract({
        address: Callable.address,
        abi: Callable.abi,
        functionName: 'callContract',
        args: [WETH.address, deposit, parseEther('10')],
      })
      ETHBalance -= parseEther('10')
      WETHBalance += parseEther('10')
      assert.equal(
        await publicClient.getBalance({ address: Callable.address }),
        ETHBalance,
      )
      assert.equal(await WETH.read.balanceOf([Callable.address]), WETHBalance)

      await user.writeContract({
        address: Callable.address,
        abi: Callable.abi,
        functionName: 'callContract',
        args: [WETH.address, deposit],
        value: parseEther('10'),
      })
      WETHBalance += parseEther('10')
      assert.equal(await WETH.read.balanceOf([Callable.address]), WETHBalance)

      await user.writeContract({
        address: Callable.address,
        abi: Callable.abi,
        functionName: 'callContract',
        args: [WETH.address, withdraw],
      })
      ETHBalance += parseEther('10')
      WETHBalance -= parseEther('10')
      assert.equal(
        await publicClient.getBalance({ address: Callable.address }),
        ETHBalance,
      )
      assert.equal(await WETH.read.balanceOf([Callable.address]), WETHBalance)

      await user.writeContract({
        address: Callable.address,
        abi: Callable.abi,
        functionName: 'callContract',
        args: [NFT721.address, safeTransferFrom],
      })
      assert.equal(
        await NFT721.read.ownerOf([999n]),
        getAddress(hacker.account.address),
      )
    })

    options?.extra?.()
  })
}
