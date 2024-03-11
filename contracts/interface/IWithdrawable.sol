// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IWithdrawable {
  event Withdrawal(address indexed sender, uint256 amount);
  event WithdrawalERC20(address indexed sender, address indexed token, uint256 amount);
  event WithdrawalERC721(address indexed sender, address indexed token, uint256 tokenId);
  event WithdrawalERC1155(address indexed sender, address indexed token, uint256 id, uint256 value);
  event WithdrawalERC1155Batch(address indexed sender, address indexed token, uint256[] ids, uint256[] values);

  /**
   * @dev Withdraw all ETH.
   * Can only be called by the authorized.
   */
  function withdraw() external;

  /**
   * @dev Withdraw a specified amount of ETH.
   * Can only be called by the authorized.
   */
  function withdraw(uint256 amount) external;

  /**
   * @dev Withdraw all ERC20 tokens.
   * Can only be called by the authorized.
   */
  function withdrawERC20(address token) external;

  /**
   * @dev Withdraw a specified amount of ERC20 tokens.
   * Can only be called by the authorized.
   */
  function withdrawERC20(address token, uint256 amount) external;

  /**
   * @dev Withdraw a ERC721 token.
   * Can only be called by the authorized.
   */
  function withdrawERC721(address token, uint256 tokenId, bytes calldata data) external;

  /**
   * @dev Withdraw a ERC1155 token.
   * Can only be called by the authorized.
   */
  function withdrawERC1155(address token, uint256 id, uint256 value, bytes calldata data) external;

  /**
   * @dev Withdraw multiple ERC1155 tokens.
   * Can only be called by the authorized.
   */
  function withdrawERC1155Batch(address token, uint256[] calldata ids, uint256[] calldata values, bytes calldata data) external;
}
