const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
  'wrap weekend will noise hobby eagle success pipe denial eager enough journey',
  'https://kovan.infura.io/v3/213d3dde92d54590aedc49f08282827e'
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  // Address of Dai contract on Kovan
  const DAI_ADDRESS = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa';

  // Address of cDai contract on Kovan
  const CDAI_ADDRESS = '0xF0d0EB522cfa50B716B3b1604C4F0fA6f04376AD';

  // Returns an instance of the contract we deployed
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode, arguments: [DAI_ADDRESS, CDAI_ADDRESS] })

    // Important to set gasLimit (21000 is generally the minimum);
    // this was not mentioned in Grider's tutorial
    // Update: Was a web3 issue, now using 1.0.0-beta.35;
    // gasLimit no longer needed!
    .send({ from: accounts[0], gas: '1000000' });

  console.log(interface);
  console.log('Contract deployed to', result.options.address);
};

deploy();

// Contract deployed to 0x4f66fEB7f18dE1927bD07EdD549685435b54b646
