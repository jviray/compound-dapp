const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const DAI_ABI = require('./daiAbi');
const CDAI_ABI = require('./cDaiAbi');
const { interface, bytecode } = require('../ethereum/compile');

const KOVAN_NODE_URL =
  'https://kovan.infura.io/v3/213d3dde92d54590aedc49f08282827e';

// Only use for testing purposes
// Will generate same set of wallet addresses each time
// CHANGING MNEMONIC WILL BREAK FIRST TEST!
const TESTING_MNEMONIC =
  'clutch captain shoe salt awake harvest setup primary inmate ugly among become';

// Either use Ethplorer/Etherscan to randomly select a large holder of Dai on the network
// so we can send out transactions during testing without the private key

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

before(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  // Transfer Ether to UNLOCKED_ADDRESS to pay for gas costs on transactions
  await web3.eth.sendTransaction({
    to: UNLOCKED_ADDRESS,
    from: accounts[0],
    value: 25000000000000000000,
  });

  // Deploy Dapp contract
  dappContract = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
      arguments: [DAI_ADDRESS, CDAI_ADDRESS],
    })
    .send({ from: accounts[0], gas: '1000000' });

  dappAddress = dappContract.options.address;
});

describe('Web3 and DAI Configuration', () => {
  it('Connected to the forked Main Network with same set of addresses', async () => {
    assert.equal(accounts[0], '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A');
  });

  it("Interfaces with MKR's Dai contract on mainnet", async () => {
    const name = await daiContract.methods.name().call();
    assert.equal(name, 'Dai Stablecoin');
  });

  it('Unlocked the account of a Dai holder (sent Dai to our first wallet address)', async () => {
    await daiContract.methods
      .transfer(accounts[0], web3.utils.toHex(10e18))
      .send({ from: UNLOCKED_ADDRESS });

    const daiBalance = await daiContract.methods.balanceOf(accounts[0]).call();
    assert.notEqual(daiBalance, 0);
  });
});

describe('Dapp Contract', () => {
  it('Has been deployed', () => {
    assert.ok(dappAddress);
  });

  it('Receives Dai from user and can check amount', async () => {
    await daiContract.methods
      .transfer(dappAddress, web3.utils.toHex(10e18))
      .send({ from: accounts[0] });

    const daiBalance = await daiContract.methods.balanceOf(dappAddress).call();
    const dappDaiBalance = await dappContract.methods
      .getDappDaiBalance()
      .call();
    assert.equal(daiBalance, dappDaiBalance);
  });

  it('Supply Dai to Compound for cDai', async () => {
    await dappContract.methods
      .supplyDaiToCompound(web3.utils.toHex(10e18))
      .send({
        from: accounts[0],
        gasLimit: web3.utils.toHex(5000000),
        gasPrice: web3.utils.toHex(20000000000),
      });

    const cDaiBalance = await cDaiContract.methods
      .balanceOf(dappAddress)
      .call();

    const dappCompDaiBalance = await dappContract.methods
      .getDappCompDaiBalance()
      .call();

    assert.equal(cDaiBalance, dappCompDaiBalance);
  });
});
