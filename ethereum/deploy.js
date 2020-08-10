const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledDapp = require('./build/Dapp.json');

const provider = new HDWalletProvider(
  'wrap weekend will noise hobby eagle success pipe denial eager enough journey',
  'https://kovan.infura.io/v3/213d3dde92d54590aedc49f08282827e'
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  // Returns an instance of the contract we deployed
  const result = await new web3.eth.Contract(JSON.parse(compiledDapp.interface))
    .deploy({ data: compiledDapp.bytecode })

    // Important to set gasLimit (21000 is generally the minimum);
    // this was not mentioned in Grider's tutorial
    // Update: Was a web3 issue, now using 1.0.0-beta.35;
    // gasLimit no longer needed!
    .send({ from: accounts[0], gas: '1000000' });

  console.log('Contract deployed to', result.options.address);
};

deploy();

// Contract deployed to 0xa82E41eE076E2cb5bAE941dbB72725DF7072AB83
