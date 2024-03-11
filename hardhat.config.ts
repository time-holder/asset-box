import type { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox-viem'
import 'dotenv/config'

const config: HardhatUserConfig = {
  solidity: '0.8.20',
}

export default config
