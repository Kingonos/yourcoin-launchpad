import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, bscTestnet, mainnet, arbitrum } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'YourCoin Launchpad',
  projectId: '7c3a3c9637c79702d72cc7ccc7d99acd',
  chains: [bsc, bscTestnet, mainnet, arbitrum],
  ssr: false,
});

// Log configuration status for debugging
if (import.meta.env.DEV) {
  console.log('🔌 Wallet Configuration:', {
    projectId: '✅ Set',
    chains: ['BSC Mainnet', 'BSC Testnet', 'Ethereum', 'Arbitrum'],
  });
}
