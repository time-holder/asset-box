import { viem } from 'hardhat'
import { Address, parseEther, parseUnits } from 'viem'
import type {
  GetBalanceReturnType,
  WriteContractReturnType,
  SendTransactionReturnType,
} from 'viem'
import type {
  GetContractReturnType,
  PublicClient as BasePublicClient,
  WalletClient as BaseWalletClient,
} from '@nomicfoundation/hardhat-viem/types'
import type { ArtifactsMap } from 'hardhat/types'

export interface TestTypes {
  WETH: GetContractReturnType<ArtifactsMap['WETH']['abi']>
  DAI: GetContractReturnType<ArtifactsMap['DAI']['abi']>
  USDC: GetContractReturnType<ArtifactsMap['USDC']['abi']>
  NFT721: GetContractReturnType<ArtifactsMap['NFT721']['abi']>
  NFT1155: GetContractReturnType<ArtifactsMap['NFT1155']['abi']>
  AssetBox: GetContractReturnType<ArtifactsMap['AssetBox']['abi']>
  Callable: GetContractReturnType<ArtifactsMap['Callable']['abi']>
  Receivable: GetContractReturnType<ArtifactsMap['Receivable']['abi']>
  Withdrawable: GetContractReturnType<ArtifactsMap['Withdrawable']['abi']>
}

// Fixed the viem@1.15 Type check problem
export interface PublicClient extends BasePublicClient {
  getBalance: (params: any) => Promise<GetBalanceReturnType>
}

// Fixed the viem@1.15 Type check problem
export interface WalletClient extends BaseWalletClient {
  writeContract: (params: any) => Promise<WriteContractReturnType>
  sendTransaction: (params: any) => Promise<SendTransactionReturnType>
}

export interface TestClients {
  publicClient: PublicClient
  user: WalletClient
  hacker: WalletClient
}

export interface TestContracts {
  WETH: TestTypes['WETH']
  DAI: TestTypes['DAI']
  USDC: TestTypes['USDC']
  NFT721: TestTypes['NFT721']
  NFT1155: TestTypes['NFT1155']
}

export async function deployContracts(): Promise<TestContracts> {
  const WETH = await viem.deployContract('WETH')
  const DAI = await viem.deployContract('DAI')
  const USDC = await viem.deployContract('USDC')
  const NFT721 = await viem.deployContract('NFT721')
  const NFT1155 = await viem.deployContract('NFT1155')

  return {
    WETH,
    DAI,
    USDC,
    NFT721,
    NFT1155,
  }
}

export async function claimAssets(
  user: WalletClient,
  { WETH, DAI, USDC, NFT721, NFT1155 }: TestContracts,
) {
  await user.writeContract({
    address: WETH.address,
    abi: WETH.abi,
    functionName: 'deposit',
    args: [],
    value: parseEther('100'),
  })
  await user.writeContract({
    address: DAI.address,
    abi: DAI.abi,
    functionName: 'mint',
    args: [parseUnits('20000', 18)],
  })
  await user.writeContract({
    address: USDC.address,
    abi: USDC.abi,
    functionName: 'mint',
    args: [parseUnits('10000', 6)],
  })
  await user.writeContract({
    address: NFT721.address,
    abi: NFT721.abi,
    functionName: 'safeMint',
    args: [user.account.address, 999],
  })
  await user.writeContract({
    address: NFT1155.address,
    abi: NFT1155.abi,
    functionName: 'mintBatch',
    args: [user.account.address, [1, 666, 888], [100, 1000, 5000], '0x'],
  })
}

export async function depositAssets(
  address: Address,
  user: WalletClient,
  { WETH, DAI, USDC, NFT721, NFT1155 }: TestContracts,
) {
  await user.sendTransaction({ to: address, value: parseEther('10') })
  await user.writeContract({
    address: WETH.address,
    abi: WETH.abi,
    functionName: 'transfer',
    args: [address, parseUnits('100', 18)],
  })
  await user.writeContract({
    address: DAI.address,
    abi: DAI.abi,
    functionName: 'transfer',
    args: [address, parseUnits('20000', 18)],
  })
  await user.writeContract({
    address: USDC.address,
    abi: USDC.abi,
    functionName: 'transfer',
    args: [address, parseUnits('10000', 6)],
  })
  await user.writeContract({
    address: NFT721.address,
    abi: NFT721.abi,
    functionName: 'safeTransferFrom',
    args: [user.account.address, address, 999],
  })
  await user.writeContract({
    address: NFT1155.address,
    abi: NFT1155.abi,
    functionName: 'safeBatchTransferFrom',
    args: [
      user.account.address,
      address,
      [1, 666, 888],
      [100, 1000, 5000],
      '0x',
    ],
  })
}
