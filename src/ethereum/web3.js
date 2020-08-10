import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  async function requestAccess() {
    web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
  }

  requestAccess();
} else if (
  typeof window !== 'undefined' &&
  typeof window.web3 !== 'undefined'
) {
  web3 = new Web3(window.web3.currentProvider);
} else {
  // When user does not have Metamask
  // const provider = new Web3.providers.HttpProvider(
  //   'https://kovan.infura.io/v3/213d3dde92d54590aedc49f08282827e'
  // );

  // web3 = new Web3(provider);

  console.log(
    'Browser not equipped to access Ethereum. Consider connecting w/ MetaMask!'
  );
}

export default web3;
