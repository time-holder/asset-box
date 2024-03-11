# 🎁 Asset Box

[![Tests](https://github.com/time-holder/asset-box/actions/workflows/tests.yml/badge.svg)](https://github.com/time-holder/asset-box/actions/workflows/tests.yml)
[![npm version](https://img.shields.io/npm/v/@timeholder/asset-box/latest.svg)](https://www.npmjs.com/package/@timeholder/asset-box)

A Solidity-implemented Ethereum EVM asset management contract designed to enhance security by segregating assets from wallets, thereby reducing the risk of asset theft.

## 🤔 Why Use

In the decentralized blockchain world, there are numerous opportunities for sudden wealth, but it also conceals many security risks.

You might face severe financial losses due to the occurrence of the following incidents:

- 🚨 **Private Key Leaked**: Users' carelessness can result in the leakage of cryptocurrency wallet private keys, enabling hackers to empty the wallet.
- 🚨 **Erroneous Authorization**: Users inadvertently grant permissions to untrustworthy contracts, enabling hackers to siphon off assets to which they've been granted access.

So, we need a solution that helps users reduce the risk of asset theft.

## 💡 Our Solutions

- ✅ **Secure Storage**: Creates a contract owned by the user's wallet to store a wide range of assets on the Ethereum Virtual Machine (EVM), including ETH, ERC20, ERC721, and ERC1155.
- ✅ **Inherent Separation**: The contract is inherently separate from the user's wallet, making it invisible and untraceable to hackers via the user's wallet interface. This means that, even in the event of the user's wallet private key being compromised, the attacker cannot detect the existence of the contract, nor can they transfer assets held within it.
- ✅ **Indirect Asset Ownership**: Users do not need to hold assets directly in their wallets; instead, assets are held within the contract. This arrangement acts much like a private bank for users, offering a higher level of security for assets than if stored directly in a personal wallet.
- ✅ **DeFi Ecosystem Interaction**: When users wish to interact with other smart contracts within the Ethereum ecosystem, they don't need to withdraw their assets. Instead, they can directly engage with other smart contracts through this contract, reducing the inconvenience caused by frequent asset transactions.

## 🛠️ Technology Stack

Our project leverages a range of technologies to ensure robust smart contract development, testing, and deployment. Below is a detailed list of the technology stack we use:

- [**Solidity**](https://soliditylang.org/): The primary programming language for writing our smart contracts. Solidity is a statically-typed programming language designed for developing smart contracts that run on the Ethereum Virtual Machine (EVM).

- [**OpenZeppelin**](https://openzeppelin.com/contracts/): A library for secure smart contract development. OpenZeppelin Contracts is a library of modular, reusable, secure smart contracts, written in Solidity. It's an open-source framework for the Ethereum community.

- [**Hardhat**](https://hardhat.org/): A development environment to compile, deploy, test, and debug Ethereum software. Hardhat is designed to help developers manage and automate the recurring tasks inherent to the process of building smart contracts and dApps.

- [**Viem**](https://viem.sh/): A TypeScript Interface for Ethereum that provides low-level stateless primitives for interacting with Ethereum. An alternative to `ethers.js` and `web3.js` with a focus on reliability, efficiency, and excellent developer experience.

- [**Chai**](https://www.chaijs.com/): An assertion library for node and the browser that can be delightfully paired with any javascript testing framework. Chai is often used as the testing framework for writing tests for Ethereum smart contracts.

This technology stack provides us with the tools necessary to ensure our smart contracts are secure, reliable, and efficient. We encourage contributors to familiarize themselves with these technologies to better understand our development and testing processes.

## 🔍 Running Tests

To ensure the reliability and security of our smart contracts, we have implemented comprehensive test suites using the Chai testing framework. Follow the steps below to run the tests and verify the contracts' functionalities.

Before running the tests, make sure you have the following installed:
- Node.js (recommend using the latest stable version)
- npm (Node.js package manager)

```shell
npm install
npm run test
```

After running the tests, you'll see output in the terminal indicating whether each test has passed or failed.

## 📖 How To Use

Before starting, please make sure that the npm package `@timeholder/asset-box` has already been installed.

If it is not installed, please execute the following code to install:

```shell
npm install @timeholder/asset-box
```

### Create your own `AssetBox`

Use JavaScript to create deployment code `deploy.js`.

Example:

```javascript
import {
  abi,
  bytecode,
} from '@timeholder/asset-box/artifacts/contracts/AssetBox.sol/AssetBox.json'
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

const walletClient = createWalletClient({
  account: privateKeyToAccount('<YOUR_PRIVATE_KEY>'),
  chain: mainnet,
  transport: http()
})

(async () => {
  const [ address ] = await walletClient.getAddresses()

  const hash = await walletClient.deployContract({
    account: address,
    abi,
    bytecode,
    args: [
      '<YOUR_PUBLIC_KEY>' // Your wallet address
    ]
  })

  const transaction = await publicClient.waitForTransactionReceipt({ hash })
  console.log(`AssetBox deployed to: ${transaction.contractAddress}`)
})()
```
    
Finally, run the script to complete the deployment 🎉.
    
```shell
node deploy.js
```

### Send assets to your `AssetBox`

You can directly send token assets to your `AssetBox` contract address, or you can transfer using `JavaScript`.

Example:

```javascript
import { createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const walletClient = createWalletClient({
  account: privateKeyToAccount('<YOUR_PRIVATE_KEY>'),
  chain: mainnet,
  transport: http()
})

(async () => {
  const [ address ] = await walletClient.getAddresses()

  const hash = await walletClient.sendTransaction({
    account: address,
    to: '<YOUR_ASSETBOX_CONTRACT_ADDRESS>',
    value: parseEther('1')
  })
  // AssetBox ETH balance + 1 ETH
})()
```

### Using `AssetBox` to call other smart contracts

Suppose 1 ETH has already been deposited into `AssetBox`. 

Example:

```javascript
import { abi as AssetBoxAbi } from '@timeholder/asset-box/artifacts/contracts/AssetBox.sol/AssetBox.json'
import { abi as WETHAbi } from '@timeholder/asset-box/artifacts/contracts/test/WETH.sol/WETH.json'
import { createWalletClient, http, parseEther, encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const AssetBox = {
  address: '<YOUR_ASSETBOX_CONTRACT_ADDRESS>',
  abi: AssetBoxAbi
}

const WETH = {
  address: '<WETH_CONTRACT_ADDRESS>',
  abi: WETHAbi
}

const walletClient = createWalletClient({
  account: privateKeyToAccount('<YOUR_PRIVATE_KEY>'),
  chain: mainnet,
  transport: http()
})

(async () => {
  const [ address ] = await walletClient.getAddresses()

  const deposit = encodeFunctionData({
    abi: WETH.abi,
    functionName: 'deposit',
    args: []
  })
  const withdraw = encodeFunctionData({
    abi: WETH.abi,
    functionName: 'withdraw',
    args: [ parseEther('1') ]
  })

  // Using AssetBox deposit 1 ETH to WETH
  await walletClient.writeContract({
    account: address,
    address: AssetBox.address,
    abi: AssetBox.abi,
    functionName: 'callContract',
    args: [ WETH.abi, deposit ], 
    value: parseEther('1')
  })
  // AssetBox ETH balance - 1 ETH
  // AssetBox WETH balance + 1 ETH

  // Using AssetBox withdraw 1 ETH from WETH
  await walletClient.writeContract({
    account: address,
    address: AssetBox.address,
    abi: AssetBox.abi,
    functionName: 'callContract',
    args: [ WETH.abi, withdraw ]
  })
  // AssetBox ETH balance + 1 ETH
  // AssetBox WETH balance - 1 ETH
})()
```

### Transfer ownership to the new wallet

You can transfer ownership of the `AssetBox` contract to a new wallet address.

Example:

```javascript
import { abi } from '@timeholder/asset-box/artifacts/contracts/AssetBox.sol/AssetBox.json'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const AssetBox = {
  address: '<YOUR_ASSETBOX_CONTRACT_ADDRESS>',
  abi
}

const walletClient = createWalletClient({
  account: privateKeyToAccount('<YOUR_PRIVATE_KEY>'),
  chain: mainnet,
  transport: http()
})

(async () => {
  const [ address ] = await walletClient.getAddresses()
    
  await walletClient.writeContract({
    account: address,
    address: AssetBox.address,
    abi: AssetBox.abi,
    functionName: 'transferOwnership',
    args: [
      '<YOUR_NEW_PUBLIC_KEY>' // Your new wallet address
    ]
  })
})()
```

## 🧑‍💻 Solidity Developer

You can extend your smart contract based on the `AssetBox`.

Example:

```solidity
import {AssetBox} from "@timeholder/asset-box/contracts/AssetBox.sol";

contract MyContract is AssetBox {
  constructor(address initialOwner) AssetBox(initialOwner) {
    // ...
  }
}
```

## Licensing

See [LICENSE](LICENSE).
