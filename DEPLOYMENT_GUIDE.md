# YourCoin Launchpad - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Deploy ERC-20 Contract on Polygon Mumbai Testnet](#deploy-erc-20-contract)
3. [Set Up QuickSwap Liquidity Pool](#set-up-quickswap-liquidity)
4. [Configure Frontend](#configure-frontend)
5. [Configure Backend](#configure-backend)
6. [Local Development](#local-development)
7. [Production Deployment](#production-deployment)

---

## Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or higher) and npm installed
- Web3 wallet installed (MetaMask, Trust Wallet, or any WalletConnect-compatible wallet)
- MATIC tokens on Mumbai testnet (get from [Mumbai Faucet](https://faucet.polygon.technology/))
- Basic understanding of Ethereum/Polygon blockchain
- A WalletConnect Project ID (get from [WalletConnect Cloud](https://cloud.walletconnect.com/))

---

## Deploy ERC-20 Contract on Polygon Mumbai Testnet

### Step 1: Create Your ERC-20 Token Contract

Create a file named `YourCoin.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YourCoin is ERC20, Ownable {
    constructor() ERC20("YourCoin", "YOUR") Ownable(msg.sender) {
        // Mint initial supply to deployer (1 million tokens)
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // Mint function - only owner can mint
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

### Step 2: Deploy Using Remix IDE

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file `YourCoin.sol` and paste the contract code
3. Install OpenZeppelin contracts:
   - Click on "Plugin Manager"
   - Activate "OpenZeppelin"
4. Compile the contract:
   - Go to "Solidity Compiler" tab
   - Select compiler version `0.8.20`
   - Click "Compile YourCoin.sol"
5. Deploy to Mumbai:
   - Go to "Deploy & Run Transactions" tab
   - Select "Injected Provider - MetaMask"
   - Ensure MetaMask is connected to Mumbai Testnet
   - Click "Deploy"
   - Confirm the transaction in MetaMask
6. **Save the deployed contract address** - you'll need it!

### Step 3: Verify Contract on PolygonScan

1. Go to [Mumbai PolygonScan](https://mumbai.polygonscan.com/)
2. Search for your contract address
3. Click "Contract" > "Verify and Publish"
4. Fill in the details matching your deployment
5. Verify the contract

---

## Set Up QuickSwap Liquidity Pool

### Prerequisites
- YOUR tokens deployed and in your wallet
- USDC tokens on Mumbai (address: `0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97`)
- Sufficient MATIC for gas fees

### Step 1: Get USDC on Mumbai

Use a Mumbai faucet or bridge to get some USDC test tokens.

### Step 2: Create Liquidity Pool

1. Go to [QuickSwap Mumbai](https://quickswap.exchange/#/pool)
2. Connect your wallet
3. Click "Create a pair"
4. Select YOUR token (paste your contract address)
5. Select USDC
6. Add liquidity with desired ratio (e.g., 1000 YOUR : 100 USDC for 1:0.1 ratio)
7. Confirm transaction

### Step 3: Note Pool Address

After creating the pool, save the pool/pair address for reference.

---

## Configure Frontend

### Step 1: Update Token Addresses

In `src/pages/Home.tsx`, update these addresses:

```typescript
const YOUR_TOKEN_ADDRESS = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS';
const USDC_ADDRESS = '0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97';
```

### Step 2: Update WalletConnect Project ID

In `src/lib/wagmi.ts`, update:

```typescript
export const config = getDefaultConfig({
  appName: 'YourCoin Launchpad',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from cloud.walletconnect.com
  chains: [polygonAmoy, polygon],
  ssr: false,
});
```

### Step 3: Update QuickSwap URLs

In `src/pages/Swap.tsx`, you can customize the QuickSwap URL to pre-fill the swap:

```typescript
const openQuickSwap = () => {
  const url = `https://quickswap.exchange/#/swap?inputCurrency=${YOUR_TOKEN_ADDRESS}&outputCurrency=${USDC_ADDRESS}`;
  window.open(url, '_blank');
};
```

---

## Configure Backend

### Step 1: Set Up Contract Interaction

The backend minting function needs to interact with your deployed contract. You'll need:

1. **Private Key** - for the wallet that will execute minting (owner wallet)
2. **RPC URL** - Polygon Mumbai RPC endpoint
3. **Contract ABI** - from your compiled contract

### Step 2: Update Edge Function

In `supabase/functions/mint-tokens/index.ts`, uncomment and configure the Web3 logic:

```typescript
// Install ethers in your edge function
import { ethers } from 'https://esm.sh/ethers@6.7.0';

// Your contract ABI (get from Remix or PolygonScan)
const CONTRACT_ABI = [
  "function mint(address to, uint256 amount) public"
];

const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
const RPC_URL = 'https://rpc-mumbai.maticvigil.com/'; // Or your preferred RPC

// In your function:
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider); // Store PRIVATE_KEY in secrets
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

const amountInWei = ethers.parseUnits(amount.toString(), 18);
const tx = await contract.mint(address, amountInWei);
await tx.wait();
```

### Step 3: Secure Your Private Key

**NEVER** commit private keys to your code! Use Lovable Cloud secrets:

1. In Lovable, go to your project
2. Open "Cloud" tab
3. Go to "Secrets"
4. Add a new secret: `MINTER_PRIVATE_KEY`
5. In your edge function, access it: `Deno.env.get('MINTER_PRIVATE_KEY')`

---

## Local Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Test Locally

1. Connect MetaMask to Mumbai testnet
2. Get Mumbai MATIC from faucet
3. Connect wallet in the app
4. Test minting and swapping features

---

## Production Deployment

### Option 1: Deploy on Lovable

1. Your app is already deployed on Lovable at your project URL
2. Click "Publish" to make it live
3. Optionally connect a custom domain

### Option 2: Deploy Elsewhere

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to:
   - Vercel: `vercel --prod`
   - Netlify: `netlify deploy --prod`
   - AWS S3 + CloudFront
   - Any static hosting service

3. Set environment variables in your hosting platform

---

## Important Notes

### Gas Fees

- All transactions require MATIC for gas
- Minting costs ~50,000-100,000 gas
- Swaps cost ~150,000-300,000 gas
- Keep MATIC buffer in your wallet

### Security Best Practices

1. **Never expose private keys** - use environment variables/secrets
2. **Implement rate limiting** on minting endpoint
3. **Add access control** - consider whitelist for minting
4. **Audit smart contracts** before mainnet deployment
5. **Test thoroughly** on testnet before deploying to Polygon mainnet

### Switching to Mainnet

When ready for production:

1. Deploy contract to Polygon mainnet
2. Update all contract addresses in code
3. Change RPC URLs to mainnet
4. Update QuickSwap URLs to mainnet version
5. Test with small amounts first!

---

## Troubleshooting

### MetaMask Not Connecting
- Ensure Mumbai network is added to MetaMask
- Check if site is allowed in MetaMask permissions

### Transaction Failing
- Check if you have enough MATIC for gas
- Verify contract addresses are correct
- Check Mumbai network status

### Minting Not Working
- Verify backend function is deployed
- Check if wallet has minting permissions (is owner)
- Review edge function logs in Lovable Cloud

### QuickSwap Issues
- Ensure liquidity pool exists
- Check token approvals
- Verify slippage tolerance

---

## Support & Resources

- [Polygon Documentation](https://docs.polygon.technology/)
- [QuickSwap Docs](https://docs.quickswap.exchange/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Lovable Documentation](https://docs.lovable.dev/)
- [WalletConnect Docs](https://docs.walletconnect.com/)

---

## Next Steps

After deployment, consider:
1. Adding token analytics dashboard
2. Implementing staking features
3. Creating governance mechanisms
4. Adding more trading pairs
5. Building a community!

Good luck with your launchpad! 🚀
