import { viem } from 'hardhat'
import { isAddress } from 'viem'

const MY_WALLET_ADDRESS = process.env.MY_WALLET_ADDRESS as string

async function main() {
  if (!MY_WALLET_ADDRESS) {
    throw new Error('Please set the `MY_WALLET_ADDRESS` environment variable.')
  } else if (!isAddress(MY_WALLET_ADDRESS)) {
    throw new Error(`\`${MY_WALLET_ADDRESS}\` is not a valid Ethereum address.`)
  }
  const AssetBox = await viem.deployContract('AssetBox', [MY_WALLET_ADDRESS])
  console.log(`AssetBox deployed to: ${AssetBox.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
