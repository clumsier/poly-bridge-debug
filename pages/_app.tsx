import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Web3Provider } from '../providers/Web3Provider';
import { POSPolygonProvider } from './POSPolygonProvider';

const globalStyles = `
  html,
  body,
  body > div:first-of-type,
  div#__next {
    height: 100%;
    width: 100%;
  }

  body, html {
    overflow-x: hidden;
  }

  div#__next {
    display: flex;
    flex-direction: column;
    justify-content: space-between; 
  }

  #WEB3_CONNECT_MODAL_ID {
    position: fixed;
    z-index: 10;
  }

  // body.ReactModal__Body--open {
  //   // width: 100%;
  //   // padding-right: 0;
  //   // overflow-y: scroll;
  // }

  @font-face {
    font-family: "Perfect DOS VGA 437";
    font-weight: 500;
    src: url("/static/font/Perfect_DOS_VGA_437.ttf") format("truetype");
    font-display: swap;
  }
`;

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <Web3Provider>
      <POSPolygonProvider>
        <Component {...pageProps} />
      </POSPolygonProvider>
    </Web3Provider>
  );
}

export default App;
