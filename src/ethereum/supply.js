import web3 from './web3';
import Supply from './Supply.json';

export default (address) => {
  return new web3.eth.Contract(JSON.parse(Supply.interface), address);
};
