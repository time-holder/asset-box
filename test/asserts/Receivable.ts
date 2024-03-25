import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { assert } from 'chai'
import { viem } from 'hardhat'
import { getAddress, parseEther, parseUnits } from 'viem'
import { deployContracts, claimAssets, depositAssets } from '../common'
import type { PublicClient, WalletClient, TestTypes } from '../common'

export type ReceivableTestOptions = {
  extra?: () => void
}

export function testReceivable(
  baseDeployFixture: () => Promise<{
    Receivable: TestTypes['Receivable']
    owner: WalletClient
  }>,
  options?: ReceivableTestOptions,
) {
  async function deployFixture() {
    const { Receivable, owner } = await baseDeployFixture()
    const publicClient = (await viem.getPublicClient()) as PublicClient
    const walletClients = (await viem.getWalletClients()) as WalletClient[]
    const ownerIndex = walletClients.findIndex(
      client => client.account.address === owner.account.address,
    )

    const testContracts = await deployContracts()
    await claimAssets(owner, testContracts)
    await depositAssets(Receivable.address, owner, testContracts)

    return {
      ...testContracts,
      Receivable,
      publicClient,
      user: owner,
      hacker: walletClients[ownerIndex + 1],
    }
  }

  describe('Receivable', () => {
    it('#receive()', async () => {
      const { WETH, DAI, USDC, NFT721, NFT1155, Receivable, publicClient } =
        await loadFixture(deployFixture)
      assert.equal(
        await publicClient.getBalance({ address: Receivable.address }),
        parseEther('10'),
      )
      assert.equal(
        await WETH.read.balanceOf([Receivable.address]),
        parseUnits('100', 18),
      )
      assert.equal(
        await DAI.read.balanceOf([Receivable.address]),
        parseUnits('20000', 18),
      )
      assert.equal(
        await USDC.read.balanceOf([Receivable.address]),
        parseUnits('10000', 6),
      )
      assert.equal(
        await NFT721.read.ownerOf([999n]),
        getAddress(Receivable.address),
      )
      assert.deepEqual(
        await NFT1155.read.balanceOfBatch([
          [Receivable.address, Receivable.address, Receivable.address],
          [1n, 666n, 888n],
        ]),
        [100n, 1000n, 5000n],
      )
    })

    options?.extra?.()
  })
}
