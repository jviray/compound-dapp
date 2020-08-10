const path = require('path');
const solc = require('solc'); // Solidity compiler
const fs = require('fs-extra'); // Gives access to file system

// Deletes the entire build folder if it already exists
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

// Retrieves contents of a specific smart contract
const dappPath = path.resolve(__dirname, 'contracts', 'Dapp.sol');
const source = fs.readFileSync(dappPath, 'utf-8');

// Compiles source and extracts 'contracts' object
const output = solc.compile(source, 1).contracts;

// Re-creates build folder if it does not already exist
fs.ensureDirSync(buildPath);

// Iterates over each key (contract) in the 'contracts' object (output)
for (let contract in output) {
  // Writes a JSON file to a specified location using the key for the filename
  // and specified contents from the 'contracts' object (output)
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(':', '') + '.json'),
    output[contract]
  );
}
