// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract CarbonVesting is Ownable {
  using SafeMath for uint256;

  IERC20 public token;

  struct VestingSchedule {
    address beneficiary;
    uint256 start;
    uint256 duration;
    uint256 milestoneCount;
    uint256 tokensPerMilestone;
    uint256 milestonesClaimed;
  }

  mapping(address => VestingSchedule) public vestingSchedules;

  event TokensClaimed(address beneficiary, uint256 amount, uint256 milestone);

  constructor(IERC20 _token) {
    token = _token;
  }

  function addVestingSchedule(address _beneficiary, uint256 _start, uint256 _duration, uint256 _milestoneCount, uint256 _tokensPerMilestone) public onlyOwner {
    require(_duration > 0, "Duration must be greater than 0");
    require(_milestoneCount > 0, "Milestone count must be greater than 0");
    require(_tokensPerMilestone > 0, "Tokens per milestone must be greater than 0");

    VestingSchedule memory schedule = VestingSchedule({ beneficiary: _beneficiary, start: _start, duration: _duration, milestoneCount: _milestoneCount, tokensPerMilestone: _tokensPerMilestone, milestonesClaimed: 0 });

    vestingSchedules[_beneficiary] = schedule;
  }

  function claimTokens() public {
    VestingSchedule storage schedule = vestingSchedules[msg.sender];
    require(schedule.beneficiary != address(0), "No vesting schedule found");

    uint256 milestonesPassed = (block.timestamp.sub(schedule.start)).div(schedule.duration);
    require(milestonesPassed > schedule.milestonesClaimed, "No milestones passed");

    uint256 tokensToClaim = milestonesPassed.sub(schedule.milestonesClaimed).mul(schedule.tokensPerMilestone);
    schedule.milestonesClaimed = milestonesPassed;

    require(token.transfer(schedule.beneficiary, tokensToClaim), "Token transfer failed");
    emit TokensClaimed(schedule.beneficiary, tokensToClaim, milestonesPassed);
  }
}
