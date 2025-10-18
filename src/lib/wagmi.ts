import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonAmoy } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'YourCoin Launchpad',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '7c3a3c9637c79702d72cc7ccc7d99acd', // Get from WalletConnect Cloud
  chains: [polygonAmoy, polygon],
  ssr: false,
});

// Log configuration status for debugging
if (import.meta.env.DEV) {
  console.log('🔌 Wallet Configuration:', {
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ? '✅ Set' : '❌ Missing',
    chains: ['Polygon Mumbai', 'Polygon Mainnet'],
  });
}
