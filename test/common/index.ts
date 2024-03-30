import { viem } from 'hardhat'
import { parseEther, parseUnits } from 'viem'
import { deployContract } from '../utils'
import type { Address } from 'viem'
import type {
  GetContractReturnType,
  PublicClient,
  WalletClient,
} from '@nomicfoundation/hardhat-viem/types'
import type { ArtifactsMap } from 'hardhat/types'
import {
  abi as WETHAbi,
  bytecode as WETHBytecode,
} from '../../artifacts/contracts/test/WETH.sol/WETH.json'
import {
  abi as DAIAbi,
  bytecode as DAIBytecode,
} from '../../artifacts/contracts/test/DAI.sol/DAI.json'
import {
  abi as USDCAbi,
  bytecode as USDCBytecode,
} from '../../artifacts/contracts/test/USDC.sol/USDC.json'
import {
  abi as NFT721Abi,
  bytecode as NFT721Bytecode,
} from '../../artifacts/contracts/test/NFT721.sol/NFT721.json'
import {
  abi as NFT1155Abi,
  bytecode as NFT1155Bytecode,
} from '../../artifacts/contracts/test/NFT1155.sol/NFT1155.json'

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
  const [owner] = (await viem.getWalletClients()) as WalletClient[]
  const WETH = (await deployContract(
    owner,
    WETHAbi,
    WETHBytecode,
  )) as unknown as TestTypes['WETH']
  const DAI = (await deployContract(
    owner,
    DAIAbi,
    DAIBytecode,
  )) as unknown as TestTypes['DAI']
  const USDC = (await deployContract(
    owner,
    USDCAbi,
    USDCBytecode,
  )) as unknown as TestTypes['USDC']
  const NFT721 = (await deployContract(
    owner,
    NFT721Abi,
    NFT721Bytecode,
  )) as unknown as TestTypes['NFT721']
  const NFT1155 = (await deployContract(
    owner,
    NFT1155Abi,
    NFT1155Bytecode,
  )) as unknown as TestTypes['NFT1155']

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
    args: [user.account.address, 999n],
  })
  await user.writeContract({
    address: NFT1155.address,
    abi: NFT1155.abi,
    functionName: 'mintBatch',
    args: [user.account.address, [1n, 666n, 888n], [100n, 1000n, 5000n], '0x'],
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
    args: [user.account.address, address, 999n],
  })
  await user.writeContract({
    address: NFT1155.address,
    abi: NFT1155.abi,
    functionName: 'safeBatchTransferFrom',
    args: [
      user.account.address,
      address,
      [1n, 666n, 888n],
      [100n, 1000n, 5000n],
      '0x',
    ],
  })
}
