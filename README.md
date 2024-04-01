# 🎁 Asset Box

[![npm version](https://img.shields.io/npm/v/@timeholder/asset-box/latest.svg)](https://www.npmjs.com/package/@timeholder/asset-box)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://github.com/time-holder/asset-box/actions/workflows/tests.yml/badge.svg)](https://github.com/time-holder/asset-box/actions/workflows/tests.yml)

An Ethereum EVM smart contract wallet is designed to enhance security by isolating commonly used assets from the hot wallet, thereby reducing the risk of asset theft.

## 🤔 Why Use

In the decentralized blockchain world, there are numerous opportunities for sudden wealth, but it also conceals many security risks.

You might face severe financial losses due to the occurrence of the following incidents:

- 🚨 **Private Key Leaked**: Users' carelessness can result in the leakage of cryptocurrency wallet private keys, enabling hackers to empty the wallet.
- 🚨 **Mistaken Authorization**: Users mistakenly authorized phishing programs, leading to assets being stolen by hackers.

So, we need a solution that helps users reduce the risk of asset theft.

## 💡 Our Solutions

- ✅ **EVM Wallet**: Create a **Contract Wallet** that only the user owns. This wallet can hold [Ethereum EVM](https://ethereum.org/en/developers/docs/evm/) assets, including ETH, ERC20, ERC721, and ERC1155.
- ✅ **Flexibility**: Compared to the independent authorization of **Cold Wallet,** the control of **Contract Wallet** still resides in your **Hot Wallet.** Therefore, assets stored in **Contract Wallet** are more flexible. You don't have to frequently transfer assets in and out of **Cold Wallet,** to balance asset security and DeFi interactions.
- ✅ **Privacy**: Since the **Contract Wallet** is essentially separate from the user's **Hot Wallet,** it is not easy to be discovered, and it is difficult for hackers to directly observe its existence through the user's **Hot Wallet.** This means that even if the user's **Hot Wallet** private key is compromised, hackers cannot immediately detect the presence of the **Contract Wallet** and steal assets, unless they scan the records of all transaction addresses and can find the **Contract Wallet.** However, this also buys time for users to transfer the ownership of the **Contract Wallet.**
- ✅ **Security**: Users' **Hot Wallet** should not hold too many assets; long-term reserve assets should be stored in **Cold Wallet,** while DeFi assets that require frequent interaction should be kept in **Contract Wallet.** When users navigate through the vast ocean of Web3 applications, it's inevitable that they might mistakenly authorize some phishing programs, leading to the loss of assets in their **Hot Wallet**. Therefore, diversifying assets between **Cold Wallet** and **Contract Wallet** is currently the safest practice to avoid risks.
- ✅ **Extensibility**: When users wish to interact with other smart contracts within the Ethereum ecosystem, they don't need to withdraw their assets. Instead, they can interact directly with other smart contracts through the **Contract Wallet,** avoiding frequent asset transfers between the **Hot Wallet** and the **Contract Wallet.**

## 👛 Exploring Contract Wallet

We simply defined the differences between **Hot Wallet,** **Cold Wallet,** and **Contract Wallet.**

|                        | **Hot Wallet**                                                                                                     | **Cold Wallet**                                                                                                   | **Contract Wallet**                                                                                                                                                      |
|------------------------|--------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Type                   | Externally Owned Account (EOA)                                                                                     | Externally Owned Account (EOA)                                                                                    | Contact Account (CA)                                                                                                                                                     |
| Private Key            | ⭕️                                                                                                                 | ⭕️                                                                                                                | ❌                                                                                                                                                                        |
| Cross-Chain            | ⭕️                                                                                                                 | ⭕️                                                                                                                | ❌                                                                                                                                                                        |
| Usage                  | Frequent interactions in various Web3 applications often involve signing or authorize to third-party applications. | Does not connect to the internet, does not sign, does not authorize; only sends transactions and receives assets. | Stores various commonly used assets, DeFi tokens, and provides funds to the hot wallet when needed.                                                                      |
| Mistaken Authorization | Authorized assets will be stolen.                                                                                  | Authorized assets will be stolen.                                                                                 | Even if the owner's EOA wallet has mistakenly authorized, it will not have any impact on the CA wallet.                                                                  |
| Private key leaked     | Assets stolen.                                                                                                     | Assets stolen.                                                                                                    | Even if the owner's EOA wallet private key is leaked, users still have a chance to transfer control before hackers discover the CA wallet, thereby keeping their assets. |

In summary, the **Contract Wallet** should be your real **Hot Wallet,** while your **Hot Wallet** acts more like a **Proxy**. When the **Proxy** encounters security risks, please replace it promptly to ensure the safety of your commonly used assets.

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
import { abi, bytecode } from '@timeholder/asset-box/artifacts/contracts/AssetBox.sol/AssetBox.json'
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
  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [
      '<YOUR_WALLET_ADDRESS>'
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

You can directly send assets to your `AssetBox`.

Example:

```javascript
import { createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const AssetBox = {
  address: '<YOUR_ASSETBOX_CONTRACT_ADDRESS>'
}

const walletClient = createWalletClient({
  account: privateKeyToAccount('<YOUR_PRIVATE_KEY>'),
  chain: mainnet,
  transport: http()
})

(async () => {
  const hash = await walletClient.sendTransaction({
    to: AssetBox.address,
    value: parseEther('1')
  })
  // AssetBox ETH balance + 1 ETH
  // Your wallet ETH balance - 1 ETH
})()
```

### Withdraw assets from `AssetBox`

You can withdraw assets from your `AssetBox`.

Example:

```javascript
import { abi as AssetBoxAbi } from '@timeholder/asset-box/artifacts/contracts/AssetBox.sol/AssetBox.json'
import { createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const AssetBox = {
  address: '<YOUR_ASSETBOX_CONTRACT_ADDRESS>',
  abi: AssetBoxAbi
}

const walletClient = createWalletClient({
  account: privateKeyToAccount('<YOUR_PRIVATE_KEY>'),
  chain: mainnet,
  transport: http()
})

(async () => {
  await walletClient.writeContract({
    address: AssetBox.address,
    abi: AssetBox.abi,
    functionName: 'withdraw',
    args: [ parseEther('1') ]
  })
  // AssetBox ETH balance - 1 ETH
  // Your wallet ETH balance + 1 ETH
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
import { mainnet } from 'viem/chains'

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
import { mainnet } from 'viem/chains'

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
  await walletClient.writeContract({
    address: AssetBox.address,
    abi: AssetBox.abi,
    functionName: 'transferOwnership',
    args: [
      '<YOUR_NEW_WALLET_ADDRESS>' // Your new wallet address
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
