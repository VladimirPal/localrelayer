import { ZeroEx } from '0x.js';

export const loadWeb3 = () =>
  new Promise((resolve) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', () => {
      const { web3 } = window;
      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider.
        const zeroEx = new ZeroEx(web3.currentProvider, { networkId: 50 });
        window.zeroEx = zeroEx;
        console.warn('Injected web3 detected.');
        resolve(zeroEx);
      } else {
        resolve(null);
        console.warn('No web3 instance injected, please use Metamask');
      }
    });
  });

export const getNetworkById = (id: number) => {
  const networks = {
    '1': 'Mainnet',
    '2': 'Morden (deprecated)',
    '3': 'Ropsten Test',
    '4': 'Rinkbery Test',
    '42': 'Kovan Test',
  };
  return networks[id] || 'Unknown network.';
};

export const connectionStatuses = {
  NOT_CONNECTED: 'Not connected to Ethereum',
  CONNECTED: 'Connected',
  LOCKED: 'Locked',
};

export const contracts = {
  'WETH': '0x48bacb9266a570d521063ef5dd96e61686dbe788',
  'ZRX': '0x25b8fe1de9daf8ba351890744ff28cf7dfa8f5e3',
  'exchange': '0xb69e673309512a9d726f87304c6984054f87a93b',
  'proxy': '0x1dc4c1cefef38a777b15aa20260a54e584b16c48',
};
