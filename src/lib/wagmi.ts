import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, mainnet, bsc, arbitrum } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'YourCoin Launchpad',
  projectId: '7c3a3c9637c79702d72cc7ccc7d99acd',
  chains: [polygon, mainnet, bsc, arbitrum],
  ssr: false,
});

// Log configuration status for debugging
if (import.meta.env.DEV) {
  console.log('🔌 Wallet Configuration:', {
    projectId: '✅ Set',
    chains: ['Polygon', 'Ethereum', 'BSC', 'Arbitrum'],
  });
}
