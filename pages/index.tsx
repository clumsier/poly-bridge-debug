import Head from 'next/head';
import { useState } from 'react';
import { useWeb3Context } from '../providers/Web3Provider';
import { NETWORK_BY_NAME } from '../utils/configNetwork';
import { fetchHttp } from '../utils/http';
import { usePOSPolygon } from './POSPolygonProvider';

const ROOT = true;

export default function Home() {
  const { address, network, connectWallet } = useWeb3Context();
  const { posClient } = usePOSPolygon();
  const [txHash, setTxHash] = useState<string>('');

  async function exit() {
    if (posClient && network) {
      const tokenAddress =
        NETWORK_BY_NAME[network.name].l1 === 'mainnet'
          ? '0x7EA3Cca10668B8346aeC0bf1844A49e995527c8B'
          : '0x95A55667F4B6A28aA1C28f8346f912c054937586';

      const l2Data = NETWORK_BY_NAME[network.l2];

      // hardcode type
      const type = 'ERC721';

      // fetch txData!
      const res = await fetchHttp<{
        result?: {
          to: string;
          logs: {
            topics: string[];
          }[];
        };
      }>(
        `${l2Data.etherscanAPIUrl}/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${l2Data.etherscanAPIKey}`
      );

      let count = 0;

      if (res.result) {
        if (type === 'ERC721' && network.isRoot) {
          const { logs } = res.result;
          const TRANSFER_SIG = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

          logs.forEach(async ({ topics }) => {
            const isTransfer = topics.some((topic) => topic === TRANSFER_SIG);

            if (isTransfer) {
              count += 1;
            }
          });
        }
      }

      console.log(`Total items ${count}`);

      // check which are exited
      if (count > 1) {
        for (let i = 0; i < count; i = i + 1) {
          try {
            const isExited = await posClient
              .erc721(tokenAddress, ROOT)
              .isWithdrawExitedOnIndex(txHash, i);

            console.log(`Is exited at index ${i} - ${isExited}`);

            console.log(`Try to exit - ${i}`);
            await posClient.erc721(tokenAddress, ROOT).withdrawExitOnIndex(txHash, i);
          } catch (err) {
            console.error(err);
          }
        }
      } else {
        const exitTxByType =
          // @ts-ignore
          type === 'ERC20'
            ? posClient.erc20(tokenAddress, ROOT).withdrawExit(txHash)
            : type === 'ERC721'
            ? posClient.erc721(tokenAddress, ROOT).withdrawExit(txHash)
            : posClient.erc1155(tokenAddress, ROOT).withdrawExit(txHash);

        try {
          const tx = await exitTxByType;
          if (tx) {
            const exitTxHash = await tx.getTransactionHash();
            console.log('exit in progress');

            await tx.getReceipt();
            console.log('exit in completed');
          }
        } catch (err) {
          console.error(`Something went wrong`, err);
        }
      }
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {address ? (
          <div>
            Connected with {address} on network {network?.name}
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
        {address ? (
          <>
            <p>
              Sample tx of 2 items on Mainnet{' '}
              <a href="https://polygonscan.com/tx/0x8390fb6dd844a647d639be2e04bdab585815e5099ec35c668fb1c61819da2780">
                0x8390fb6dd844a647d639be2e04bdab585815e5099ec35c668fb1c61819da2780
              </a>{' '}
              (isWithdrawExitedOnIndex returns true for all indexes, even though only 1 item was
              exited)
            </p>
            <p>
              Sample tx of 4 items on Mainnet{' '}
              <a href="https://polygonscan.com//tx/0x745de6139122008ae474d17724b4741cf6b887bd2707e459053ede7ee821e1e5">
                0x745de6139122008ae474d17724b4741cf6b887bd2707e459053ede7ee821e1e5
              </a>{' '}
              (this tx is not even being triggered)
            </p>
            <input value={txHash} onChange={(e) => setTxHash(e.target.value)} />
            <button onClick={exit}>Exit tx</button>
          </>
        ) : null}
      </main>
    </div>
  );
}
