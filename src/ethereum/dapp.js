import web3 from './web3';
import Dapp from '../../ethereum/build/Dapp.json';

// Enter address of deployed Dapp:
export const address = '0xa82E41eE076E2cb5bAE941dbB72725DF7072AB83';

const instance = new web3.eth.Contract(JSON.parse(Dapp.interface), address);

export default instance;
