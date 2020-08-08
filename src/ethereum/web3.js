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
  // Write code to cover when user does not have Metamask
  console.log(
    'Browser not equipped to access Ethereum. Consider installing MetaMask!'
  );
}

export default web3;
