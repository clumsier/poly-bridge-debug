import { POSClient, use } from '@maticnetwork/maticjs';
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import Web3 from 'web3';
import { useWeb3Context } from '../providers/Web3Provider';
import { NETWORK_BY_NAME } from '../utils/configNetwork';

interface POSPolygonContextState {
  posClient?: POSClient;
}

// Matic boilerplate
use(Web3ClientPlugin);
const posClient = new POSClient();

const POSPolygonContext = createContext<POSPolygonContextState>({} as POSPolygonContextState);

export function POSPolygonProvider({ children }: { children: ReactNode }) {
  const { web3, address, network } = useWeb3Context();
  const [state, setState] = useState<POSPolygonContextState>({});

  useEffect(() => {
    if (address && web3 && network) {
      const l2Data = NETWORK_BY_NAME[network.l2];
      const isMainnet = network.l1 === 'mainnet';

      const POSNetwork = isMainnet ? 'mainnet' : 'testnet';
      const POSVersion = isMainnet ? 'v1' : 'mumbai';
      const POSChildProvider = isMainnet
        ? 'https://matic-mainnet.chainstacklabs.com'
        : 'https://rpc-mumbai.maticvigil.com/';

      const setupPOSClient = async () => {
        await posClient.init({
          log: false,
          network: POSNetwork,
          version: POSVersion,
          parent: {
            provider: web3.currentProvider,
            defaultConfig: {
              from: address,
            },
          },
          child: {
            provider: network.isRoot
              ? new Web3(
                  new Web3.providers.HttpProvider(l2Data.web3ProviderFallback || POSChildProvider)
                )
              : web3.currentProvider,
            defaultConfig: {
              from: address,
            },
          },
        });

        setState((prevState) => ({ ...prevState, posClient }));
      };

      setupPOSClient();
    }
  }, [address, web3]);

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
    }));
  }, []);

  return <POSPolygonContext.Provider value={state}>{children}</POSPolygonContext.Provider>;
}

export function usePOSPolygon() {
  const context = useContext(POSPolygonContext);

  if (context === undefined) {
    throw new Error('usePOSPolygon must be used within a POSPolygonProvider');
  }

  return context;
}
