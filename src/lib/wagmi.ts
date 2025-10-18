import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonAmoy } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'YourCoin Launchpad',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [polygonAmoy, polygon],
  ssr: false,
});
