// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Funds is Ownable {

	uint internal totalFunds;

	mapping(address => uint) public funds;

	modifier withdrawalCheck(uint _amount) {
        require(msg.sender == owner() || funds[msg.sender] >= _amount, "You are not allowed");
        _;
    }

	function addFund(address _user, uint _amount) public onlyOwner {
        require(totalFunds + _amount<= address(this).balance , "You can't add funds that even more than that is available in the contract.");
        funds[_user] += _amount;
        totalFunds += _amount;
    }

    function reduceFund(address _user, uint _amount) internal{
    	require(funds[_user] - _amount >= 0, "You can't make one's balance be negative.");
        funds[_user] -= _amount;
    }
}