// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICallable {
  event ContractCalled(address indexed target, bytes data, bytes result);

  /**
   * @dev Call the specified contract's function.
   * @param target The address of the target contract to call.
   * @param data The bytecode of the target contract to call function and parameters.
   *
   * You can choose to send ETH to the target contract when calling the function.
   */
  function callContract(address target, bytes calldata data) external payable returns (bytes memory result);

  /**
   * @dev Call the specified contract's function.
   * @param target The address of the target contract to call.
   * @param data The bytecode of the target contract to call function and parameters.
   * @param amount Send a specified amount of ETH from the current contract to the target contract.
   */
  function callContract(address target, bytes calldata data, uint256 amount) external returns (bytes memory result);
}
