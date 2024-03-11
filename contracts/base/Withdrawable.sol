// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IWithdrawable} from "../interface/IWithdrawable.sol";

abstract contract Withdrawable is IWithdrawable {
  error WithdrawableInsufficientBalance(uint256 balance, uint256 needed);
  error WithdrawableERC20InsufficientBalance(address token, uint256 balance, uint256 needed);
  error WithdrawableWithdrawalFailed();

  /**
   * @dev Function that should revert when `msg.sender` is not authorized to withdraw.
   *
   * ```solidity
   * function _authorizeWithdraw(address) internal override(Withdrawable) onlyOwner {}
   * ```
   */
  function _authorizeWithdraw(address sender)
  internal virtual;

  function withdraw()
  external virtual {
    _authorizeWithdraw(msg.sender);
    _withdraw(0);
  }

  function withdraw(uint256 amount)
  external virtual {
    _authorizeWithdraw(msg.sender);
    _withdraw(amount);
  }

  function withdrawERC20(address token)
  external virtual {
    _authorizeWithdraw(msg.sender);
    _withdrawERC20(token, 0);
  }

  function withdrawERC20(address token, uint256 amount)
  external virtual {
    _authorizeWithdraw(msg.sender);
    _withdrawERC20(token, amount);
  }

  function withdrawERC721(address token, uint256 tokenId, bytes calldata data)
  external virtual {
    _authorizeWithdraw(msg.sender);
    _withdrawERC721(token, tokenId, data);
  }

  function withdrawERC1155(address token, uint256 id, uint256 value, bytes calldata data)
  external virtual {
    _authorizeWithdraw(msg.sender);
    _withdrawERC1155(token, id, value, data);
  }

  function withdrawERC1155Batch(address token, uint256[] calldata ids, uint256[] calldata values, bytes calldata data)
  external virtual {
    _authorizeWithdraw(msg.sender);
    _withdrawERC1155Batch(token, ids, values, data);
  }

  function _withdraw(uint256 amount)
  private {
    uint256 balance = address(this).balance;

    if (amount == 0) amount = balance;
    else if (balance < amount) revert WithdrawableInsufficientBalance(balance, amount);

    (bool ok,) = payable(msg.sender).call{value: amount}("");
    if (!ok) revert WithdrawableWithdrawalFailed();

    emit Withdrawal(msg.sender, amount);
  }

  function _withdrawERC20(address token, uint256 amount)
  private {
    (bool success, bytes memory result) = token.call(
      abi.encodeWithSignature("balanceOf(address)", address(this))
    );
    if (!success) revert WithdrawableWithdrawalFailed();
    uint256 balance = abi.decode(result, (uint256));

    if (amount == 0) amount = balance;
    else if (balance < amount) revert WithdrawableERC20InsufficientBalance(token, balance, amount);

    (bool ok,) = token.call(
      abi.encodeWithSignature("transfer(address,uint256)", msg.sender, amount)
    );
    if (!ok) revert WithdrawableWithdrawalFailed();

    emit WithdrawalERC20(msg.sender, token, amount);
  }

  function _withdrawERC721(address token, uint256 tokenId, bytes calldata data)
  private {
    (bool ok,) = token.call(
      abi.encodeWithSignature("safeTransferFrom(address,address,uint256,bytes)", address(this), msg.sender, tokenId, data)
    );
    if (!ok) revert WithdrawableWithdrawalFailed();

    emit WithdrawalERC721(msg.sender, token, tokenId);
  }

  function _withdrawERC1155(address token, uint256 id, uint256 value, bytes calldata data)
  private {
    (bool ok,) = token.call(
      abi.encodeWithSignature("safeTransferFrom(address,address,uint256,uint256,bytes)", address(this), msg.sender, id, value, data)
    );
    if (!ok) revert WithdrawableWithdrawalFailed();

    emit WithdrawalERC1155(msg.sender, token, id, value);
  }

  function _withdrawERC1155Batch(address token, uint256[] calldata ids, uint256[] calldata values, bytes calldata data)
  private {
    (bool ok,) = token.call(
      abi.encodeWithSignature("safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)", address(this), msg.sender, ids, values, data)
    );
    if (!ok) revert WithdrawableWithdrawalFailed();

    emit WithdrawalERC1155Batch(msg.sender, token, ids, values);
  }
}
