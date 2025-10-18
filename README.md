# YourCoin Launchpad 🚀

A modern Web3 DeFi launchpad built on Polygon for minting and swapping YOUR tokens.

## Features

- 🔗 **Wallet Connection** - Connect with MetaMask, Trust Wallet, WalletConnect, and more
- 💰 **Balance Display** - View YOUR token and USDC balances in real-time
- 🪙 **One-Click Minting** - Mint YOUR tokens instantly with gas estimates
- 🔄 **Token Swapping** - Trade YOUR for USDC via QuickSwap integration
- 📱 **Mobile-Friendly** - Responsive design for all devices
- 🎨 **Beautiful UI** - Modern glassmorphism design with smooth animations

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Web3**: Wagmi + Viem + RainbowKit
- **Backend**: Lovable Cloud (Supabase Edge Functions)
- **Blockchain**: Polygon (Mumbai Testnet)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Web3 wallet (MetaMask, Trust Wallet, or any WalletConnect-compatible wallet)
- MATIC tokens on Mumbai testnet ([Get from faucet](https://faucet.polygon.technology/))

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Configuration

### 1. WalletConnect Project ID

1. Get your Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a `.env.local` file in the project root (copy from `.env.example`)
3. Add your Project ID:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_actual_project_id_here
```

**Important:** Without a valid Project ID, wallet connections won't work!

### 2. Token Addresses

Update contract addresses in `src/pages/Home.tsx`:

```typescript
const YOUR_TOKEN_ADDRESS = '0xYOUR_CONTRACT_ADDRESS';
const USDC_ADDRESS = '0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97';
```

### 3. Backend Minting

Configure the minting edge function in `supabase/functions/mint-tokens/index.ts` with your deployed contract details.

## Deployment Guide

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on:

- Deploying YOUR ERC-20 contract to Polygon Mumbai
- Setting up QuickSwap liquidity pools
- Configuring the application for production
- Security best practices

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── Header.tsx       # Navigation header with wallet button
│   ├── WalletButton.tsx # Custom wallet connection button
│   └── BalanceCard.tsx  # Token balance display card
├── pages/
│   ├── Home.tsx         # Landing page with balances
│   ├── Mint.tsx         # Token minting page
│   ├── Swap.tsx         # Token swap guide page
│   └── NotFound.tsx     # 404 page
├── lib/
│   ├── wagmi.ts         # Wagmi configuration
│   └── utils.ts         # Utility functions
└── index.css            # Design system & styles

supabase/
└── functions/
    └── mint-tokens/     # Backend minting endpoint
```

## Design System

The app uses a custom design system with:

- **Colors**: Purple (`--primary`), Cyan (`--secondary`), Dark theme
- **Effects**: Glass-morphism cards, gradient text, glow shadows
- **Animations**: Smooth transitions with cubic-bezier easing
- **Typography**: Clean, modern fonts optimized for readability

All design tokens are defined in `src/index.css` and can be customized.

## Development

### Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment

The app automatically connects to:
- Polygon Mumbai Testnet (for development)
- QuickSwap DEX (for swaps)
- Lovable Cloud (for backend functions)

## Security Notes

⚠️ **Important Security Considerations:**

1. Never commit private keys or secrets to the repository
2. Use environment variables for sensitive data
3. Implement rate limiting on minting endpoints
4. Audit smart contracts before mainnet deployment
5. Test thoroughly on testnet before production

## Switching to Mainnet

When ready for production:

1. Deploy contract to Polygon mainnet
2. Update all RPC URLs and contract addresses
3. Configure mainnet QuickSwap URLs
4. Test with small amounts first
5. Update WalletConnect configuration for mainnet

## Gas Fees

All blockchain transactions require MATIC for gas:

- **Minting**: ~0.002 MATIC
- **Swapping**: ~0.003 MATIC  
- **Approvals**: ~0.001 MATIC

Make sure to keep sufficient MATIC in your wallet!

## Troubleshooting

### Wallet Not Connecting
- Ensure Mumbai network is added to MetaMask
- Check wallet permissions for the site

### Transaction Failures
- Verify sufficient MATIC for gas fees
- Confirm contract addresses are correct
- Check Mumbai network status

### Minting Issues
- Verify backend function is deployed
- Check wallet has owner permissions
- Review Cloud function logs

## Resources

- [Lovable Documentation](https://docs.lovable.dev/)
- [Polygon Documentation](https://docs.polygon.technology/)
- [QuickSwap Docs](https://docs.quickswap.exchange/)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Docs](https://www.rainbowkit.com/)

## Support

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## License

MIT License - feel free to use this project as a template for your own DeFi launchpad!

---

Built with ❤️ using [Lovable](https://lovable.dev)
