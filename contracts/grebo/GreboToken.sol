// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GreboToken is ERC20, Ownable {
  constructor() ERC20("Grebo", "GREBO") Ownable() {}

  function adminMint(address to, uint256 amount) external onlyOwner {
    _mint(to, amount);
  }

  function mint(address to, uint256 amount) external {
    _mint(to, amount);
  }
}
