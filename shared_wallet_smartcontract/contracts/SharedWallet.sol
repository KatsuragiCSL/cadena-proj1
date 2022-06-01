// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Funds.sol";

contract SharedWallet is Ownable, Funds {

    address public walletOwner;
    string public walletName;

	constructor() {
		totalFunds = 0;
        walletOwner = owner();
	}

    function setwalletName(string memory _name) external {
        require(
            msg.sender == owner(),
            "You must be the owner to set the name of the wallet"
        );
        walletName = _name;
    }

	function getBalance() public view returns (uint) {
        return funds[msg.sender];
    }

    function withdraw(address payable _to, uint _amount) payable public withdrawalCheck(_amount) {
        _to.transfer(_amount);
        totalFunds -= _amount;
        funds[msg.sender] -= _amount;
    }

}