import web3 from './web3';
import Dapp from '../../ethereum/build/Dapp.json';

// Enter address of deployed Dapp:
export const address = '0x47c5614a193924FFDfc52134a6c05eAfa7a31527';

const instance = new web3.eth.Contract(JSON.parse(Dapp.interface), address);

export default instance;
