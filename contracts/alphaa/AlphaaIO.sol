// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @custom:security-contact alex@alphaainc.com
contract AlphaaIO is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIdCounter;
  mapping(uint256 => string[]) private _tokenURIsHistories;

  event TokenURIChanged(uint256 indexed tokenId, string tokenURI);

  constructor() ERC721("AlphaaIO", "AIO") {}

  function _baseURI() internal pure override returns (string memory) {
    return "";
  }

  function safeMint(address to, string memory uri) public onlyOwner {
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(to, tokenId);
    _setTokenURI(tokenId, uri);
  }

  // The following functions are overrides required by Solidity.

  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    super._burn(tokenId);
  }

  function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal override(ERC721URIStorage) {
    super._setTokenURI(tokenId, _tokenURI);
    _tokenURIsHistories[tokenId].push(_tokenURI);
    emit TokenURIChanged(tokenId, _tokenURI);
  }

  function setTokenURI(uint256 tokenId, string memory _tokenURI) public onlyOwner {
    _setTokenURI(tokenId, _tokenURI);
  }

  function getTokenURIsHistorySize(uint256 tokenId) public view returns (uint256) {
    return _tokenURIsHistories[tokenId].length;
  }

  function getTokenURIHistoryByIndex(uint256 tokenId, uint256 index) public view returns (string memory) {
    return _tokenURIsHistories[tokenId][index];
  }

  function getTokenURIsHistoryRange(uint256 tokenId, uint256 start, uint256 end) public view returns (string[] memory) {
    require(start <= end, "AlphaaIO: start must be less than or equal to end");
    if (end >= _tokenURIsHistories[tokenId].length) {
      end = _tokenURIsHistories[tokenId].length - 1;
    }
    string[] memory tokenURIs = new string[](end - start + 1);
    for (uint256 i = start; i <= end; i++) {
      tokenURIs[i - start] = _tokenURIsHistories[tokenId][i];
    }
    return tokenURIs;
  }
}
