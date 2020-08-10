const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const DAI_ABI = require('./daiAbi');
const CDAI_ABI = require('./cDaiAbi');

const compiledDapp = require('../ethereum/build/Dapp.json');
const compiledSupply = require('../ethereum/build/Supply.json');

const KOVAN_NODE_URL =
  'https://kovan.infura.io/v3/213d3dde92d54590aedc49f08282827e';

// Only use for testing purposes
// Will generate same set of wallet addresses each time
// CHANGING MNEMONIC WILL BREAK FIRST TEST!
const TESTING_MNEMONIC =
  'clutch captain shoe salt awake harvest setup primary inmate ugly among become';

// Either use Ethplorer/Etherscan to randomly select a large holder of Dai on the network
// so we can send out transactions during testing without the private key,

// Or you can also use your own test account if it has Dai
const UNLOCKED_ADDRESS = '0xF4Cd1Fc53c6146B81b4b50b3C92342E974b739eA';

// Address of Dai contract on Kovan
const DAI_ADDRESS = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa';

// Address of cDai contract on Kovan
const CDAI_ADDRESS = '0xF0d0EB522cfa50B716B3b1604C4F0fA6f04376AD';

const web3 = new Web3(
  ganache.provider({
    fork: KOVAN_NODE_URL,
    network_id: 1,
    mnemonic: TESTING_MNEMONIC,
    unlocked_accounts: [UNLOCKED_ADDRESS],
  })
);

let accounts;

let daiContract = new web3.eth.Contract(DAI_ABI, DAI_ADDRESS);
let cDaiContract = new web3.eth.Contract(CDAI_ABI, CDAI_ADDRESS);

let dappAddress;
let dappContract;

let supplyAddress;
let supplyContract;

before(async function () {
  this.timeout(10000); // All tests in this suite get 10 seconds before timeout

  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  // Transfer Ether to UNLOCKED_ADDRESS to pay for gas costs on transactions
  await web3.eth.sendTransaction({
    to: UNLOCKED_ADDRESS,
    from: accounts[0],
    value: 25000000000000000000,
  });

  // Deploy Dapp contract
  dappContract = await new web3.eth.Contract(JSON.parse(compiledDapp.interface))
    .deploy({
      data: compiledDapp.bytecode,
    })
    .send({ from: accounts[0], gas: '1000000' });

  dappAddress = dappContract.options.address;
});

describe('Test Setup', function () {
  it('Connected to a forked/copy of the Kovan Network with same set of addresses', async function () {
    assert.equal(accounts[0], '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A');
  });

  it('Interfacing with Dai contract on Kovan', async function () {
    const name = await daiContract.methods.name().call();
    assert.equal(name, 'Dai Stablecoin');
  });

  it('Unlocked the account of initial Dai holder (sent 10 Dai to our first wallet address)', async function () {
    await daiContract.methods
      .transfer(accounts[0], web3.utils.toHex(10e18))
      .send({ from: UNLOCKED_ADDRESS });

    const daiBalance = await daiContract.methods.balanceOf(accounts[0]).call();
    assert.notEqual(daiBalance, 0);
  });
});

describe('Dapp Contract', function () {
  it('Dapp (factory contract) deployed', function () {
    assert.ok(dappAddress);
  });

  it('Throws error if no Supply contract is registered for given address', async function () {
    try {
      await dappContract.methods.getDeployedSupply(accounts[1]).call();
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('Can create a Supply contract', async function () {
    await dappContract.methods.createSupply(DAI_ADDRESS, CDAI_ADDRESS).send({
      from: accounts[0],
      gasLimit: web3.utils.toHex(5000000),
      gasPrice: web3.utils.toHex(20000000000),
    });

    const supplyIdFromMapping = await dappContract.methods
      .supplierToSupply(accounts[0])
      .call();

    const supplyAddrFromArray = await dappContract.methods
      .deployedSupplies(supplyIdFromMapping - 1)
      .call();

    const supplyAddrFromFunction = await dappContract.methods
      .getDeployedSupply(accounts[0])
      .call();

    assert.equal(supplyIdFromMapping, 1);
    assert.equal(supplyAddrFromArray, supplyAddrFromFunction);
  });

  it('Cannot create more than one Supply contract', async function () {
    try {
      await dappContract.methods.createSupply(DAI_ADDRESS, CDAI_ADDRESS).send({
        from: accounts[0],
        gasLimit: web3.utils.toHex(5000000),
        gasPrice: web3.utils.toHex(20000000000),
      });

      // Calls same create function twice
      await dappContract.methods.createSupply(DAI_ADDRESS, CDAI_ADDRESS).send({
        from: accounts[0],
        gasLimit: web3.utils.toHex(5000000),
        gasPrice: web3.utils.toHex(20000000000),
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });
});

describe('Supply Contract', function () {
  before(async function () {
    supplyAddress = await dappContract.methods
      .getDeployedSupply(accounts[0])
      .call();

    supplyContract = await new web3.eth.Contract(
      JSON.parse(compiledSupply.interface),
      supplyAddress
    );
  });

  it('Instance of Supply contract deployed', function () {
    assert.ok(supplyAddress);
  });

  it('Cannot supply Dai to Compound unless a sufficient amount of Dai is deposited', async function () {
    try {
      await supplyContract.methods
        .supplyDaiToCompound(web3.utils.toHex(10e18))
        .send({
          from: accounts[0],
          gasLimit: web3.utils.toHex(5000000),
          gasPrice: web3.utils.toHex(20000000000),
        });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('User can deposit Dai to Supply contract', async function () {
    await daiContract.methods
      .transfer(supplyAddress, web3.utils.toHex(10e18))
      .send({ from: accounts[0] });

    const daiBalance = await daiContract.methods
      .balanceOf(supplyAddress)
      .call();
    assert.equal(daiBalance, 10000000000000000000);
  });

  it('Receive correct amount of cDai for supplying Dai to Compound', async function () {
    this.timeout(10000);
    await supplyContract.methods
      .supplyDaiToCompound(web3.utils.toHex(10e18))
      .send({
        from: accounts[0],
        gasLimit: web3.utils.toHex(5000000),
        gasPrice: web3.utils.toHex(20000000000),
      });

    const currentExchangeRate = await cDaiContract.methods
      .exchangeRateCurrent()
      .call();

    const expectedAmount =
      web3.utils.toHex(10e18) / (currentExchangeRate / web3.utils.toHex(1e18));

    const cDaiBalance = await cDaiContract.methods
      .balanceOf(supplyAddress)
      .call();

    assert.equal(Math.trunc(expectedAmount), Math.trunc(cDaiBalance));
  });

  it('Only the address that was set at contract creation can supply tokens from this contract', async function () {
    try {
      await supplyContract.methods
        .supplyDaiToCompound(web3.utils.toHex(10e18))
        .send({
          from: accounts[1],
          gasLimit: web3.utils.toHex(5000000),
          gasPrice: web3.utils.toHex(20000000000),
        });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });
});
