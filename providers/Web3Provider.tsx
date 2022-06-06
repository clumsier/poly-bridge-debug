import { createContext, ReactNode, useContext, useEffect, useReducer, useState } from 'react';
import Web3 from 'web3';
import {
  NetworkConfig,
  NETWORK_BY_ID,
  NETWORK_BY_NAME,
  SupportedNetwork,
} from '../utils/configNetwork';
import Web3Modal from 'web3modal';

export type Web3ProviderAction =
  | { type: 'SET_WEB3'; web3: Web3 }
  | { type: 'SET_USER'; address: string; network: NetworkConfig }
  | { type: 'SET_GAS_CONFIG'; gasConfig?: { maxFeePerGas?: string } }
  | { type: 'RESET' };

export type Web3ProviderDispatch = (action: Web3ProviderAction) => void;

type Web3ContextStateBase = {
  gasConfig?: {
    maxFeePerGas?: string;
  };
  connectWallet?: () => void;
  disconnectWallet?: () => void;
  switchNetwork?: (network: SupportedNetwork) => void;
};

type Web3ContextStateNotConnected = {
  web3?: Web3;
  address?: string;
  network?: NetworkConfig;
} & Web3ContextStateBase;

export type Web3ContextStateConnected = {
  web3: Web3;
  address: string;
  network: NetworkConfig;
} & Web3ContextStateBase;

export type Web3ContextState = Web3ContextStateNotConnected | Web3ContextStateConnected;

export const Web3Context = createContext<Web3ContextState | undefined>(undefined);

function web3ContextReducer(state: Web3ContextState, action: Web3ProviderAction): Web3ContextState {
  switch (action.type) {
    case 'SET_WEB3': {
      return { ...state, web3: action.web3 };
    }
    case 'SET_USER': {
      const { address, network } = action;
      return { ...state, address, network };
    }
    case 'SET_GAS_CONFIG': {
      return { ...state, gasConfig: action.gasConfig };
    }
    case 'RESET': {
      return {};
    }
    default: {
      throw new Error(`Unhandled action: ${action}`);
    }
  }
}

const INFURA = '994a52c649e34309839627fa7b625f0b';

export function Web3Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(web3ContextReducer, {});
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>();
  const [switchingNetworkRequested, setSwitchingNetworkRequested] = useState(false);

  async function connectWallet() {
    console.log('connect');
    if (web3Modal) {
      console.log('try conn');
      const provider = await web3Modal.connect();

      const web3 = new Web3(provider);
      dispatch({ type: 'SET_WEB3', web3: web3 as Web3 });

      // @ts-ignore
      provider.on('chainChanged', (networkId: number) => {
        console.info('Network changed, reloading site...', networkId);
        window.location.reload();
      });
    }
  }

  async function disconnectWallet() {
    dispatch({ type: 'RESET' });
    await web3Modal?.clearCachedProvider();
  }

  useEffect(() => {
    if (web3Modal?.cachedProvider) {
      connectWallet();
    }
  }, [web3Modal]);

  async function switchNetwork(network: SupportedNetwork) {
    const { web3 } = state;
    const networkConfig = NETWORK_BY_NAME[network];

    setSwitchingNetworkRequested(true);

    if (web3?.currentProvider && web3.currentProvider) {
      try {
        // check if the chain to connect to is installed
        // @ts-ignore
        await web3.currentProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networkConfig.switchNetworkData.chainId }],
        });
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if ((error as any).code === 4902) {
          try {
            // @ts-ignore
            await web3.currentProvider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  ...networkConfig.switchNetworkData,
                },
              ],
            });
          } catch (err) {
            console.error(err);
          }
        }
        console.error(error);
      }
    }
  }

  // @ts-ignore
  useEffect(() => {
    const { web3, address } = state;

    if (web3?.currentProvider) {
      const fetchAccounts = async () => {
        web3.eth.getAccounts().then(async (accounts: string[]) => {
          const newAccount = accounts[0];

          if (newAccount !== address) {
            const networkId = await web3.eth.net.getId();
            const network = NETWORK_BY_ID[networkId];

            console.info(
              `Connected account - ${newAccount}, on network ${networkId} - ${network.name}`
            );

            dispatch({ type: 'SET_USER', address: newAccount, network });
          }
        });
      };

      const fetchAccountsInterval = setInterval(fetchAccounts, 2000);
      fetchAccounts();

      return () => clearInterval(fetchAccountsInterval);
    }
  }, [state.web3, state.address]);

  useEffect(() => {
    function initWeb3Modal() {
      const providerOptions = {};

      const newWeb3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions,
      });

      setWeb3Modal(newWeb3Modal);
    }

    initWeb3Modal();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        ...state,
        connectWallet,
        disconnectWallet,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3Context() {
  const context = useContext(Web3Context);

  if (context === undefined) {
    throw new Error('useWeb3Context must be used within a Web3ContextProvider');
  }

  return context;
}
