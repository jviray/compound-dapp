const path = require('path');
const fs = require('fs');
const solc = require('solc');

const dappPath = path.resolve(__dirname, 'contracts', 'Dapp.sol');
const source = fs.readFileSync(dappPath, 'utf8');

module.exports = solc.compile(source, 1).contracts[':Dapp'];
