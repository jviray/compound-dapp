import web3 from './web3';

const address = '0x4f66fEB7f18dE1927bD07EdD549685435b54b646';

const abi = [
  {
    constant: false,
    inputs: [{ name: '_tokenAmount', type: 'uint256' }],
    name: 'supplyDaiToCompound',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getDappDaiBalance',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getDappCompDaiBalance',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_daiContractAddress', type: 'address' },
      { name: '_compDaiContractAddress', type: 'address' },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
];

export default new web3.eth.Contract(abi, address);
