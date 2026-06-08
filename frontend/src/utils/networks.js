export const NETWORKS = {
  localhost: {
    chainId: '0x539',
    chainIdNum: 1337,
    name: 'Hardhat Local',
    addParams: {
      chainId: '0x539',
      chainName: 'Hardhat Local',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['http://127.0.0.1:8545'],
      blockExplorerUrls: [],
    },
  },
  sepolia: {
    chainId: '0xaa36a7',
    chainIdNum: 11155111,
    name: 'Sepolia',
    addParams: {
      chainId: '0xaa36a7',
      chainName: 'Sepolia',
      nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://rpc.sepolia.org'],
      blockExplorerUrls: ['https://sepolia.etherscan.io'],
    },
  },
};

export async function ensureNetwork(ethereum, networkKey) {
  const target = NETWORKS[networkKey];
  if (!target) return;

  const chainId = await ethereum.request({ method: 'eth_chainId' });
  if (parseInt(chainId, 16) === target.chainIdNum) return;

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: target.chainId }],
    });
  } catch (err) {
    if (err.code === 4902 && target.addParams) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [target.addParams],
      });
    } else {
      throw new Error(`Please switch MetaMask to ${target.name} (chainId ${target.chainIdNum}).`);
    }
  }
}
