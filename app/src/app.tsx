import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  SolanaMobileWalletAdapter,
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  createDefaultWalletNotFoundHandler,
} from '@solana-mobile/wallet-adapter-mobile';
import { clusterApiUrl } from '@solana/web3.js';
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SongMenuPage = lazy(() => import('./pages/SongMenuPage'));
const GamePage = lazy(() => import('./pages/GamePage'));

function App() {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolanaMobileWalletAdapter({
        addressSelector: createDefaultAddressSelector(),
        appIdentity: {
          name: 'Rhythmforge',
          uri: 'https://worldlabs.com',
          icon: 'icon.svg',
        },
        authorizationResultCache: createDefaultAuthorizationResultCache(),
        cluster: WalletAdapterNetwork.Devnet,
        onWalletNotFound: createDefaultWalletNotFoundHandler(),
      }),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <Suspense fallback={<div className="page-loader">Loading Rhythmforge...</div>}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/songs" element={<SongMenuPage />} />
                <Route path="/play" element={<GamePage />} />
              </Routes>
            </Suspense>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;