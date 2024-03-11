// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Withdrawable} from "./base/Withdrawable.sol";
import {Receivable} from "./base/Receivable.sol";
import {Callable} from "./base/Callable.sol";
import {NFTHolder} from "./base/NFTHolder.sol";

contract AssetBox is Ownable, Withdrawable, Callable, Receivable, NFTHolder {
  function version()
  external pure virtual
  returns (string memory) {
    return "1.0.0";
  }

  constructor(address initialOwner) Ownable(initialOwner) {}

  function _authorizeWithdraw(address)
  internal view virtual override(Withdrawable) onlyOwner {}

  function _authorizeCall(address)
  internal view virtual override(Callable) onlyOwner {}
}
