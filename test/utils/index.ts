import { viem } from 'hardhat'
import { getContract } from 'viem'
import type { Address } from 'viem'
import type {
  PublicClient,
  WalletClient,
} from '@nomicfoundation/hardhat-viem/types'

export async function deployContract(
  owner: WalletClient,
  abi: unknown[],
  bytecode: string,
  args?: unknown[],
) {
  const publicClient = (await viem.getPublicClient()) as PublicClient
  const hash = await owner.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
    args,
  })
  const transaction = await publicClient.waitForTransactionReceipt({ hash })
  return getContract({
    address: transaction.contractAddress as Address,
    abi,
    client: publicClient,
  })
}

export function numberFixed(number: string | number, fixed = 2) {
  return Number(Number(number).toFixed(fixed))
}
