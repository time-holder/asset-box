import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import {
  Address,
  getAddress,
  formatEther,
  parseEther,
  parseUnits,
  encodeFunctionData,
} from 'viem'
import { assert } from 'chai'
import { numberFixed } from '../utils'
import type {
  TestTypes,
  TestContracts,
  PublicClient,
  WalletClient,
} from '../common'

export interface TestData extends TestContracts {
  AssetBox: TestTypes['AssetBox']
  publicClient: PublicClient
  user: WalletClient
  hacker: WalletClient
}

type Fixture<T extends TestData> = () => Promise<T>

type ParamState = {
  extra?: () => void
}

type ParamSecurity = {
  extra?: () => void
}

type ParamCallable<T extends TestData> = {
  extra?: () => void
  '#callContract()'?: (
    data: T,
    params: {
      deposit: string
      withdraw: string
      safeTransferFrom: string
    }
  ) => void
}

type ParamWithdrawable<T extends TestData> = {
  '#withdraw()': (data: T) => void
  '#withdrawERC20()': (data: T) => void
  '#withdrawERC721()': (
    data: T,
    params: {
      params: [string | Address, number, string]
      functionSignature: string
    }
  ) => void
  '#withdrawERC1155()': (
    data: T,
    params: {
      params: [string | Address, number, number, string]
      functionSignature: string
    }
  ) => void
  '#withdrawERC1155Batch()': (
    data: T,
    params: {
      params: [string | Address, number[], number[], string]
      functionSignature: string
    }
  ) => void
}

export async function testAssetBox<T extends TestData> (
  deployFixture: Fixture<T>,
  {
    State,
    Security,
    Callable,
    Withdrawable,
  }: {
    State?: ParamState
    Security?: ParamSecurity
    Callable?: ParamCallable<T>
    Withdrawable?: ParamWithdrawable<T>
  } = {}
) {
  describe('State', () => {
    it('#owner()', async () => {
      const {
        AssetBox,
        user,
      } = await loadFixture(deployFixture)
      assert.equal(await AssetBox.read.owner(), getAddress(user.account.address))
    })

    State?.extra?.()
  })

  describe('Security', () => {
    it('#transferOwnership()', async () => {
      const {
        AssetBox,
        hacker,
        user,
      } = await loadFixture(deployFixture)
      await assert.isRejected(
        hacker.writeContract({
          address: AssetBox.address,
          abi: AssetBox.abi,
          functionName: 'transferOwnership',
          args: [ hacker.account.address ],
        }),
        'OwnableUnauthorizedAccount'
      )

      await user.writeContract({
        address: AssetBox.address,
        abi: AssetBox.abi,
        functionName: 'transferOwnership',
        args: [ hacker.account.address ]
      })

      assert.equal(await AssetBox.read.owner(), getAddress(hacker.account.address))
    })

    Security?.extra?.()
  })

  describe('Callable', () => {
    it('#callContract()', async () => {
      const data = await loadFixture(deployFixture)
      const {
        publicClient,
        WETH,
        NFT721,
        AssetBox,
        user,
        hacker,
      } = data
      // @ts-ignore
      const deposit = encodeFunctionData({
        abi: WETH.abi,
        functionName: 'deposit'
      })
      // @ts-ignore
      const withdraw = encodeFunctionData({
        abi: WETH.abi,
        functionName: 'withdraw',
        args: [ parseEther('10') ]
      })
      // @ts-ignore
      const safeTransferFrom = encodeFunctionData({
        abi: NFT721.abi,
        functionName: 'safeTransferFrom',
        args: [ AssetBox.address, hacker.account.address, 999n ]
      })

      await Callable?.['#callContract()']?.(data, { deposit, withdraw, safeTransferFrom })

      await assert.isRejected(
        hacker.writeContract({
          address: AssetBox.address,
          abi: AssetBox.abi,
          functionName: 'callContract',
          args: [ WETH.address, deposit, parseEther('10') ],
        }),
        'OwnableUnauthorizedAccount'
      )
      await assert.isRejected(
        hacker.writeContract({
          address: AssetBox.address,
          abi: AssetBox.abi,
          functionName: 'callContract',
          args: [ WETH.address, withdraw ],
        }),
        'OwnableUnauthorizedAccount'
      )
      await assert.isRejected(
        hacker.writeContract({
          address: AssetBox.address,
          abi: AssetBox.abi,
          functionName: 'callContract',
          args: [ NFT721.address, safeTransferFrom ],
        }),
        'OwnableUnauthorizedAccount'
      )

      let ETHBalance = await publicClient.getBalance({ address: AssetBox.address })
      let WETHBalance = await WETH.read.balanceOf([ AssetBox.address ])
      await user.writeContract({
        address: AssetBox.address,
        abi: AssetBox.abi,
        functionName: 'callContract',
        args: [ WETH.address, deposit, parseEther('10') ],
      })
      ETHBalance -= parseEther('10')
      WETHBalance += parseEther('10')
      assert.equal(await publicClient.getBalance({ address: AssetBox.address }), ETHBalance)
      assert.equal(await WETH.read.balanceOf([ AssetBox.address ]), WETHBalance)

      await user.writeContract({
        address: AssetBox.address,
        abi: AssetBox.abi,
        functionName: 'callContract',
        args: [ WETH.address, deposit ],
        value: parseEther('10'),
      })
      WETHBalance += parseEther('10')
      assert.equal(await WETH.read.balanceOf([ AssetBox.address ]), WETHBalance)

      await user.writeContract({
        address: AssetBox.address,
        abi: AssetBox.abi,
        functionName: 'callContract',
        args: [ WETH.address, withdraw ],
      })
      ETHBalance += parseEther('10')
      WETHBalance -= parseEther('10')
      assert.equal(await publicClient.getBalance({ address: AssetBox.address }), ETHBalance)
      assert.equal(await WETH.read.balanceOf([ AssetBox.address ]), WETHBalance)

      await user.writeContract({
        address: AssetBox.address,
        abi: AssetBox.abi,
        functionName: 'callContract',
        args: [ NFT721.address, safeTransferFrom ],
      })
      assert.equal(await NFT721.read.ownerOf([ 999n ]), getAddress(hacker.account.address))
    })

    Callable?.extra?.()
  })

  describe('Receivable', () => {
    it('#receive()', async () => {
      const {
        publicClient,
        WETH,
        DAI,
        USDC,
        NFT721,
        NFT1155,
        AssetBox,
      } = await loadFixture(deployFixture)
      assert.equal(await publicClient.getBalance({ address: AssetBox.address }), parseEther('10'))
      assert.equal(await WETH.read.balanceOf([ AssetBox.address ]), parseUnits('100', 18))
      assert.equal(await DAI.read.balanceOf([ AssetBox.address ]), parseUnits('20000', 18))
      assert.equal(await USDC.read.balanceOf([ AssetBox.address ]), parseUnits('10000', 6))
      assert.equal(await NFT721.read.ownerOf([ 999n ]), getAddress(AssetBox.address))
      assert.deepEqual(
        await NFT1155.read.balanceOfBatch([
          [ AssetBox.address, AssetBox.address, AssetBox.address ],
          [ 1n, 666n, 888n ]
        ]),
        [ 100n, 1000n, 5000n ]
      )
    })
  })

  describe('Withdrawable', () => {
    it('#withdraw()', async () => {
      const data = await loadFixture(deployFixture)
      const {
        publicClient,
        AssetBox,
        user,
        hacker,
      } = data
      await Withdrawable?.['#withdraw()']?.(data)

      await assert.isRejected(
        hacker.writeContract({
          address: AssetBox.address,
          abi: AssetBox.abi,
          functionName: 'withdraw',
          args: [],
        }),
        'OwnableUnauthorizedAccount'
      )

      const userBalance = await publicClient.getBalance({ address: user.account.address })
      const AssetBoxBalance = await publicClient.getBalance({ address: AssetBox.address })
      await user.writeContract({
        address: AssetBox.address,
        abi: AssetBox.abi,
        functionName: 'withdraw',
        args: [ parseEther('3') ],
      })
      assert.equal(await publicClient.getBalance({ address: AssetBox.address }), AssetBoxBalance - parseEther('3'))

      await user.writeContract({
        address: AssetBox.address,
        abi: AssetBox.abi,
        functionName: 'withdraw',
        args: [],
      })
      assert.equal(await publicClient.getBalance({ address: AssetBox.address }), 0n)
      assert.equal(
        numberFixed(formatEther(await publicClient.getBalance({ address: user.account.address }))),
        numberFixed(formatEther(userBalance + AssetBoxBalance))
      )
    })

    it('#withdrawERC20()', async () => {
      const data = await loadFixture(deployFixture)
      const {
        USDC,
        AssetBox,
        hacker,
        user,
      } = data
      await Withdrawable?.['#withdrawERC20()']?.(data)

      await assert.isRejected(
        hacker.writeContract({
          address: AssetBox.address,
          abi: AssetBox.abi,
          functionName: 'withdrawERC20',
          args: [ USDC.address ],
        }),
        'OwnableUnauthorizedAccount'
      )

      const balance = await USDC.read.balanceOf([ user.account.address ])
      await user.writeContract({
        address: AssetBox.address,
        abi: AssetBox.abi,
        functionName: 'withdrawERC20',
        args: [ USDC.address, parseUnits('3000', 6) ],
      })
      assert.equal(await USDC.read.balanceOf([ AssetBox.address ]), parseUnits('7000', 6))

      await user.writeContract({
        address: AssetBox.address,
        abi: AssetBox.abi,
        functionName: 'withdrawERC20',
        args: [ USDC.address ],
      })
      assert.equal(await USDC.read.balanceOf([ AssetBox.address ]), parseUnits('0', 6))
      assert.equal(await USDC.read.balanceOf([ user.account.address ]), balance + parseUnits('10000', 6))
    })

    it('#withdrawERC721()', async () => {
      const data = await loadFixture(deployFixture)
      const {
        NFT721,
        AssetBox,
        hacker,
        user,
      } = data
      const params: [string | Address, number, string] = [ NFT721.address, 999, '0x' ]
      const functionSignature = 'withdrawERC721'

      await Withdrawable?.['#withdrawERC721()']?.(data, { params, functionSignature })

      await assert.isRejected(
        hacker.writeContract({
          address: AssetBox.address,
          abi: AssetBox.abi,
          functionName: functionSignature,
          args: params,
        }),
        'OwnableUnauthorizedAccount'
      )

      await user.writeContract({
        address: AssetBox.address,
        abi: AssetBox.abi,
        functionName: functionSignature,
        args: params,
      })
      assert.equal(await NFT721.read.ownerOf([ 999n ]), getAddress(user.account.address))
    })

    it('#withdrawERC1155()', async () => {
      const data = await loadFixture(deployFixture)
      const {
        NFT1155,
        AssetBox,
        hacker,
        user,
      } = data
      const params: [string | Address, number, number, string] = [ NFT1155.address, 888, 5000, '0x' ]
      const functionSignature = 'withdrawERC1155'

      await Withdrawable?.['#withdrawERC1155()']?.(data, { params, functionSignature })

      await assert.isRejected(
        hacker.writeContract({
          address: AssetBox.address,
          abi: AssetBox.abi,
          functionName: functionSignature,
          args: params,
        }),
        'OwnableUnauthorizedAccount'
      )

      await user.writeContract({
        address: AssetBox.address,
        abi: AssetBox.abi,
        functionName: functionSignature,
        args: params,
      })
      assert.deepEqual(
        await NFT1155.read.balanceOfBatch([
          [ AssetBox.address, AssetBox.address, user.account.address ],
          [ 1n, 666n, 888n ]
        ]),
        [ 100n, 1000n, 5000n ]
      )
    })

    it('#withdrawERC1155Batch()', async () => {
      const data = await loadFixture(deployFixture)
      const {
        NFT1155,
        AssetBox,
        hacker,
        user,
      } = data
      const params: [string | Address, number[], number[], string] = [ NFT1155.address, [ 1, 666 ], [ 100, 1000 ], '0x' ]
      const functionSignature = 'withdrawERC1155Batch'

      await Withdrawable?.['#withdrawERC1155Batch()']?.(data, { params, functionSignature })

      await assert.isRejected(
        hacker.writeContract({
          address: AssetBox.address,
          abi: AssetBox.abi,
          functionName: functionSignature,
          args: params,
        }),
        'OwnableUnauthorizedAccount'
      )

      await user.writeContract({
        address: AssetBox.address,
        abi: AssetBox.abi,
        functionName: functionSignature,
        args: params,
      })
      assert.deepEqual(
        await NFT1155.read.balanceOfBatch([
          [ user.account.address, user.account.address, AssetBox.address ],
          [ 1n, 666n, 888n ]
        ]),
        [ 100n, 1000n, 5000n ]
      )
    })
  })
}
