// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./lib/ERC2981PerTokenRoyalties.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

interface IGrebo {
  function mint(address _to, uint256 _amount) external;

  function balanceOf(address _addr) external returns (uint256);

  function transfer(address recipient, uint256 amount) external returns (bool);

  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract CarbonOffset is ERC721Enumerable, ERC2981PerTokenRoyalties, Ownable, IERC721Receiver {
  using Strings for uint256;
  IGrebo public greboToken;
  uint256 public constant MAX_MINTABLE = 3333;
  uint256 public constant ROYALTY_VALUE = 300;

  uint256 indexerLength;

  uint256 public minted;
  bool public canClaim;
  address withdrawAddress;
  address royaltyAddress;
  uint256 public constant GREBO_PER_OFFSET = 1;
  mapping(uint256 => string) tokenUris;

  event Claim(uint256 indexed _id);

  constructor(address _owner, address _royaltyAddress, address _grebo) ERC721("Grebo", "Grebo") {
    indexerLength = MAX_MINTABLE;
    minted = 0;
    greboToken = IGrebo(_grebo);
    withdrawAddress = _owner;
    royaltyAddress = _royaltyAddress;
  }

  function getInterfaceID_IERC721() public pure returns (bytes4) {
    return type(IERC721).interfaceId;
  }

  function getInterfaceID_Metadata() public pure returns (bytes4) {
    return type(IERC721Metadata).interfaceId;
  }

  // /* *************** */
  // /*     Minting     */
  // /* *************** */

  // mint should be done with ipfs url
  function _singleMint(string calldata _metadataLink) internal {
    tokenUris[minted] = _metadataLink;
    _safeMint(address(this), minted);
    _setTokenRoyalty(minted, royaltyAddress, ROYALTY_VALUE);
    minted += 1;
    // TODO: sent to team wallet?
  }

  function mint(string calldata _metadataLink) public {
    _singleMint(_metadataLink);
  }

  // /* *************** */
  // /*     Claim     */
  // /* *************** */

  function claim(uint256 tokenId) public {
    // should check if claimable
    require(ownerOf(tokenId) == address(this), "this has been claimed");
    // transfer grebo to the contract
    greboToken.transferFrom(msg.sender, address(this), GREBO_PER_OFFSET);
    // transfer offset to the msg.sender
    _transfer(address(this), msg.sender, tokenId);
  }

  // /* ****************** */
  // /*       ERC721       */
  // /* ****************** */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
    return tokenUris[tokenId];
  }

  function supportsInterface(bytes4 interfaceId) public pure override(ERC2981Base, ERC721Enumerable) returns (bool) {
    bytes4 _INTERFACE_ID_ERC721 = 0x80ac58cd;
    bytes4 _INTERFACE_ID_METADATA = 0x5b5e139f;
    bytes4 _INTERFACE_ID_ERC2981 = 0x2a55205a;

    return (interfaceId == _INTERFACE_ID_ERC2981 || interfaceId == _INTERFACE_ID_ERC721 || interfaceId == _INTERFACE_ID_METADATA);
  }

  function setWithdrawAddress(address _withdrawAddress) external onlyOwner {
    withdrawAddress = _withdrawAddress;
  }

  function setRoyaltyAddress(address _royaltyAddress) external onlyOwner {
    royaltyAddress = _royaltyAddress;
  }

  function getWithdrawAddress() external view returns (address) {
    return withdrawAddress;
  }

  function getRoyaltyAddress() external view returns (address) {
    return royaltyAddress;
  }

  function withdraw() external {
    require(withdrawAddress == msg.sender, "Your are not the owner");
    require(address(this).balance > 0, "Nothing to withdraw");
    payable(_msgSender()).transfer(address(this).balance);
  }

  receive() external payable {}

  fallback() external payable {}

  function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
    return IERC721Receiver.onERC721Received.selector;
  }
}
