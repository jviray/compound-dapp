pragma solidity ^0.4.26;

// Dai interface
contract DaiInterface {
    function balanceOf(address) public view returns (uint256);

    function approve(address, uint256) external returns (bool);

    function allowance(address _owner, address _spender)
        public
        view
        returns (uint256);
}

contract CompDaiInterface {
    function balanceOf(address _address) public view returns (uint256);

    function mint(uint256) external returns (uint256);
}

contract Dapp {
    DaiInterface daiContract;

    address compDaiContractAddress;
    CompDaiInterface compDaiContract;

    // Kovan Dai Contract: 0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa
    // Kovan cDai Contract: 0xF0d0EB522cfa50B716B3b1604C4F0fA6f04376AD

    constructor(address _daiContractAddress, address _compDaiContractAddress)
        public
    {
        daiContract = DaiInterface(_daiContractAddress);

        compDaiContractAddress = _compDaiContractAddress;
        compDaiContract = CompDaiInterface(_compDaiContractAddress);
    }

    function getDappDaiBalance() public view returns (uint256) {
        return daiContract.balanceOf(address(this));
    }

    function getDappCompDaiBalance() public view returns (uint256) {
        return compDaiContract.balanceOf(address(this));
    }

    function supplyDaiToCompound(uint256 _tokenAmount)
        public
        returns (uint256)
    {
        // Approve transfer on the Dai contract
        daiContract.approve(compDaiContractAddress, _tokenAmount);

        // Mint cDai
        uint256 mintResult = compDaiContract.mint(_tokenAmount);
        return mintResult;
    }
}
