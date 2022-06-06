import Head from 'next/head';
import { useState } from 'react';
import { useWeb3Context } from '../providers/Web3Provider';
import { NETWORK_BY_NAME } from '../utils/configNetwork';
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

      // hardcode type
      const type = 'ERC721';
      const exitTxByType =
        // @ts-ignore
        type === 'ERC20'
          ? posClient.erc20(tokenAddress, ROOT).withdrawExit(txHash)
          : type === 'ERC721'
          ? posClient.erc721(tokenAddress, ROOT).withdrawExitMany(txHash)
          : posClient.erc1155(tokenAddress, ROOT).withdrawExit(txHash);

      console.log('start exit', tokenAddress, type);

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
              Sample tx on Mainnet to exit{' '}
              <a href="https://polygonscan.com/tx/0x2bf49d4558528932d8f85ce19b407fab6fd503b8d3bb63a9ae0c5fa26053f8d9">
                0x2bf49d4558528932d8f85ce19b407fab6fd503b8d3bb63a9ae0c5fa26053f8d9
              </a>{' '}
              (this fails)
            </p>
            <p>
              Sample tx on Testnet to exit{' '}
              <a href="https://mumbai.polygonscan.com//tx/0x1f0896c724090fdf58f6addd33b4b4e2ed65cca288efa40e749a049d2bb5e54b">
                0x1f0896c724090fdf58f6addd33b4b4e2ed65cca288efa40e749a049d2bb5e54b
              </a>{' '}
              (this proceeds to Metamask popup)
            </p>
            <input value={txHash} onChange={(e) => setTxHash(e.target.value)} />
            <button onClick={exit}>Exit tx</button>
          </>
        ) : null}
      </main>
    </div>
  );
}
