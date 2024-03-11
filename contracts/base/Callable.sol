// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ICallable} from "../interface/ICallable.sol";

abstract contract Callable is ICallable {
  error CallableInsufficientBalance(uint256 balance, uint256 needed);
  error CallableContractCallFailed();

  /**
   * @dev Function that should revert when `msg.sender` is not authorized to call.
   *
   * ```solidity
   * function _authorizeCall(address) internal override(Callable) onlyOwner {}
   * ```
   */
  function _authorizeCall(address sender)
  internal virtual;

  function callContract(address target, bytes calldata data)
  external payable virtual
  returns (bytes memory) {
    _authorizeCall(msg.sender);
    (bool success, bytes memory result) = target.call{value: msg.value}(data);
    if (!success) revert CallableContractCallFailed();
    emit ContractCalled(target, data, result);
    return result;
  }

  function callContract(address target, bytes calldata data, uint256 amount)
  external virtual
  returns (bytes memory) {
    _authorizeCall(msg.sender);
    uint256 balance = address(this).balance;
    if (balance < amount) revert CallableInsufficientBalance(balance, amount);
    (bool success, bytes memory result) = target.call{value: amount}(data);
    if (!success) revert CallableContractCallFailed();
    emit ContractCalled(target, data, result);
    return result;
  }
}
