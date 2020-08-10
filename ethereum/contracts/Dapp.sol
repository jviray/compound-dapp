pragma solidity ^0.4.26;

// Dai interface
contract DaiInterface {
    function balanceOf(address) public view returns (uint256);

    function approve(address, uint256) external returns (bool);
}

contract CompDaiInterface {
    function balanceOf(address _address) public view returns (uint256);

    function mint(uint256) external returns (uint256);
}

// Factory Contract
contract Dapp {
    address[] public deployedSupplies;
    mapping(address => uint256) public supplierToSupply;

    // Kovan Dai Contract: 0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa
    // Kovan cDai Contract: 0xF0d0EB522cfa50B716B3b1604C4F0fA6f04376AD

    function createSupply(
        address _daiContractAddress,
        address _compDaiContractAddress
    ) public returns (address) {
        // Can't make more than one supply contract!
        require(
            supplierToSupply[msg.sender] == 0,
            "A Supply contract is already registered for this account."
        );

        address newSupplyAddr = new Supply(
            _daiContractAddress,
            _compDaiContractAddress,
            msg.sender
        );
        supplierToSupply[msg.sender] = deployedSupplies.push(newSupplyAddr);

        return newSupplyAddr;
    }

    function getDeployedSupply(address _userAddr)
        public
        view
        returns (address)
    {
        require(
            supplierToSupply[_userAddr] != 0,
            "No Supply contract for this account."
        );
        uint256 index = supplierToSupply[_userAddr] - 1;
        return deployedSupplies[index];
    }
}

contract Supply {
    Dapp dapp;
    address public supplier;

    DaiInterface daiContract;

    address compDaiContractAddress;
    CompDaiInterface compDaiContract;

    modifier onlySupplier() {
        require(msg.sender == supplier);
        _;
    }

    constructor(
        address _daiContractAddress,
        address _compDaiContractAddress,
        address _supplier
    ) public {
        dapp = Dapp(msg.sender);
        supplier = _supplier;

        daiContract = DaiInterface(_daiContractAddress);

        compDaiContractAddress = _compDaiContractAddress;
        compDaiContract = CompDaiInterface(_compDaiContractAddress);
    }

    function getDappCompDaiBalance() public view returns (uint256) {
        return compDaiContract.balanceOf(address(this));
    }

    function supplyDaiToCompound(uint256 _tokenAmount)
        public
        onlySupplier
        returns (uint256)
    {
        // Supply contract must have a deposit of Dai greater than or equal to _tokenAmount
        require(
            daiContract.balanceOf(address(this)) >= _tokenAmount,
            "Insufficient amount of Dai deposited to the contract."
        );

        // Approve transfer on the Dai contract
        daiContract.approve(compDaiContractAddress, _tokenAmount);

        // Mint cDai
        uint256 mintResult = compDaiContract.mint(_tokenAmount);
        return mintResult;
    }
}
