import keyBy from 'lodash/keyBy';

export type SupportedNetwork = 'mainnet' | 'goerli' | 'polygon' | 'polygon_mumbai';

export type NetworkConfig = {
  networkId: number;
  name: SupportedNetwork;
  label: string;
  networkIcon: string;
  networkIconBig: string;
  switchNetworkData: {
    chainId: string;
    chainName: string;
    nativeCurrency: { name: string; symbol: string; decimals: number };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  };
  l1: SupportedNetwork;
  l2: SupportedNetwork;
  isRoot: boolean;
  safeConfirmations: number;
  etherscanAPIUrl: string;
  etherscanAPIKey: string;
  exitCheckpointUrl?: string;
  web3ProviderFallback?: string;
  subgraphUrl?: string;
};

const PROTO_MAINNET: NetworkConfig = {
  networkId: 1,
  name: 'mainnet',
  label: 'Mainnet',
  networkIcon: '/static/networks/eth.png',
  networkIconBig: '/static/networks/eth_big.png',
  switchNetworkData: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    blockExplorerUrls: ['https://etherscan.io/'],
  },
  l1: 'mainnet',
  l2: 'polygon',
  isRoot: true,
  safeConfirmations: 6,
  etherscanAPIUrl: 'https://api.etherscan.io/',
  etherscanAPIKey: 'BB7U8Q17NPQBX5591EMQPIKQZQ7EKRCXDU',
};

const PROTO_GOERLI: NetworkConfig = {
  networkId: 5,
  name: 'goerli',
  label: 'Goerli',
  networkIcon: '/static/networks/eth.png',
  networkIconBig: '/static/networks/eth_big.png',
  switchNetworkData: {
    chainId: '0x5',
    chainName: 'Goerli Test Network',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    blockExplorerUrls: ['https://goerli.etherscan.io/'],
  },
  l1: 'goerli',
  l2: 'polygon_mumbai',
  isRoot: true,
  safeConfirmations: 6,
  etherscanAPIUrl: 'https://api-goerli.etherscan.io/',
  etherscanAPIKey: 'BB7U8Q17NPQBX5591EMQPIKQZQ7EKRCXDU',
};

const PROTO_POLYGON_MAINNET: NetworkConfig = {
  networkId: 137,
  name: 'polygon',
  label: 'Polygon',
  networkIcon: '/static/networks/polygon.png',
  networkIconBig: '/static/networks/polygon_big.png',
  switchNetworkData: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://www.polygonscan.com/'],
  },
  l1: 'mainnet',
  l2: 'polygon',
  isRoot: false,
  safeConfirmations: 12,
  etherscanAPIUrl: 'https://api.polygonscan.com/',
  etherscanAPIKey: 'DVHE773HKQB5E1SJ1DDPBMFDS67C6TE1F2',
  exitCheckpointUrl: 'https://apis.matic.network/api/v1/mainnet/block-included/',
  web3ProviderFallback: 'https://polygon-rpc.com/',
  subgraphUrl: 'https://api.thegraph.com/subgraphs/name/clumsier/cyberkongz-polygon-subgraph',
};

const PROTO_POLYGON_MUMBAI: NetworkConfig = {
  networkId: 80001,
  name: 'polygon_mumbai',
  label: 'Polygon Mumbai',
  networkIcon: '/static/networks/polygon.png',
  networkIconBig: '/static/networks/polygon_big.png',
  switchNetworkData: {
    chainId: '0x13881',
    chainName: 'Polygon Testnet Mumbai',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
  l1: 'goerli',
  l2: 'polygon_mumbai',
  isRoot: false,
  safeConfirmations: 12,
  etherscanAPIUrl: 'https://api-testnet.polygonscan.com/',
  etherscanAPIKey: 'DVHE773HKQB5E1SJ1DDPBMFDS67C6TE1F2',
  exitCheckpointUrl: 'https://apis.matic.network/api/v1/mumbai/block-included/',
  web3ProviderFallback: 'https://matic-mumbai.chainstacklabs.com/',
  subgraphUrl:
    'https://api.thegraph.com/subgraphs/name/clumsier/cyberkongz-polygon-subgraph-mumbai',
};

export const NETWORK_BY_ID = keyBy(
  [PROTO_MAINNET, PROTO_GOERLI, PROTO_POLYGON_MAINNET, PROTO_POLYGON_MUMBAI],
  'networkId'
);

export const NETWORK_BY_NAME = keyBy(
  [PROTO_MAINNET, PROTO_GOERLI, PROTO_POLYGON_MAINNET, PROTO_POLYGON_MUMBAI],
  'name'
);

export const isTestnet = process.env.WATCHERS_NETWORK === 'goerli';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
