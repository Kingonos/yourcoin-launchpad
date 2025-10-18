# YourCoin (YRC) DeFi Platform - Complete Deployment Guide

## 🎯 Overview

This platform provides a complete DeFi ecosystem including:
- **Dashboard**: View wallet balance, YRC and USDC holdings
- **Mining**: Daily reward system with 24-hour cooldown
- **Swap**: Integration with QuickSwap DEX
- **Mint**: Token minting functionality
- **Admin Panel**: Control mining rewards and view statistics

## 📋 Prerequisites

1. **MetaMask Wallet** installed and configured
2. **Polygon Amoy Testnet** added to MetaMask
   - Network Name: Polygon Amoy Testnet
   - RPC URL: https://rpc-amoy.polygon.technology/
   - Chain ID: 80002
   - Currency Symbol: MATIC
   - Block Explorer: https://amoy.polygonscan.com/

3. **Test MATIC** from faucet: https://faucet.polygon.technology/

## 🚀 Step 1: Deploy Smart Contract

### Using Remix IDE (Recommended)

1. **Open Remix**: https://remix.ethereum.org

2. **Create Contract File**:
   - Create new file: `YourCoin.sol`
   - Copy code from `src/contracts/YourCoin.sol`

3. **Compile**:
   - Select Solidity compiler version: `0.8.20` or higher
   - Enable optimization (200 runs recommended)
   - Click "Compile YourCoin.sol"

4. **Deploy**:
   - Go to "Deploy & Run Transactions" tab
   - Environment: Select "Injected Provider - MetaMask"
   - Make sure MetaMask is on Polygon Amoy Testnet
   - Contract: Select "YourCoin"
   - Constructor parameter `initialOwner`: Enter your wallet address
   - Click "Deploy"
   - Confirm transaction in MetaMask

5. **Save Contract Address**:
   - Copy the deployed contract address
   - You'll need this for frontend configuration

### Verify Contract (Optional but Recommended)

1. Go to https://amoy.polygonscan.com
2. Find your contract using the address
3. Click "Contract" tab → "Verify and Publish"
4. Settings:
   - Compiler: v0.8.20+
   - Optimization: Yes (200 runs)
   - License: MIT
5. Paste flattened contract source code
6. Verify

## 🔧 Step 2: Configure Frontend

### Update Contract Address

Edit `src/pages/Home.tsx`:

```typescript
const YOUR_TOKEN_ADDRESS = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS';
const USDC_ADDRESS = '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582'; // Polygon Amoy USDC
```

### WalletConnect Project ID

Already configured with: `7c3a3c9637c79702d72cc7ccc7d99acd`

For production, get your own from: https://cloud.walletconnect.com/

## 👤 Step 3: Create Admin User

After deploying, you need to grant admin access:

1. **Sign up** on your deployed app at `/auth`

2. **Get User ID**:
   - Go to backend interface (click "View Backend" in Lovable)
   - Navigate to Authentication → Users
   - Copy your user ID

3. **Add Admin Role**:
   - Go to Table Editor → `user_roles`
   - Click "Insert row"
   - Fields:
     - `user_id`: [Your copied user ID]
     - `role`: Select "admin"
   - Click "Save"

4. **Verify Admin Access**:
   - Visit `/admin` on your app
   - You should now see the admin panel

## 💰 Step 4: Add Liquidity on QuickSwap

### Create YRC/USDC Pool

1. **Get Test USDC**:
   - USDC Testnet Faucet or use Amoy USDC: `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582`

2. **Approve Tokens**:
   - Use PolygonScan to approve QuickSwap router to spend your YRC
   - QuickSwap Router: `0x8954AfA98594b838bda56FE4C12a09D7739D179b`

3. **Add Liquidity**:
   - Go to https://quickswap.exchange/#/pool
   - Connect wallet
   - Select "Add Liquidity"
   - Token A: YRC (paste your contract address)
   - Token B: USDC
   - Set amounts (e.g., 1000 YRC : 100 USDC = $0.10 per YRC)
   - Approve and add liquidity

## ⛏️ Step 5: Configure Mining

### Default Configuration

Mining is pre-configured with:
- Daily Reward: 10 YRC
- Cooldown: 24 hours
- Total Supply tracking

### Adjust Settings (Admin Only)

1. Visit `/admin`
2. Update:
   - Daily Reward Amount
   - Cooldown Period (hours)
   - Total Supply
3. Click "Update Configuration"

## 🔐 Step 6: Security Setup

### Authentication

✅ Auto-confirm email is enabled (no email verification needed for testing)

For production:
1. Configure email provider in Lovable Cloud backend
2. Disable auto-confirm
3. Enable email verification

### Row Level Security (RLS)

All tables have RLS enabled:
- Users can only access their own data
- Admins have elevated permissions
- Mining config is publicly readable

## 🧪 Step 7: Testing

### Test Wallet Connection

1. Visit homepage
2. Click "Connect Wallet"
3. Select your wallet provider
4. Approve connection

### Test Mining

1. Go to `/mining`
2. Click "Start Mining"
3. Wait 5 seconds for transaction
4. Verify reward in dashboard

### Test Swap

1. Go to `/swap`
2. Enter amount of YRC to swap
3. Click "Continue to QuickSwap"
4. Complete swap on QuickSwap

### Test Admin Panel

1. Go to `/admin` (requires admin role)
2. View statistics
3. Update mining configuration
4. Verify changes take effect

## 📱 Step 8: Production Deployment

### Deploy to Lovable Cloud

1. Click "Publish" in Lovable editor
2. Your app will be live at: `yourapp.lovable.app`

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

### Environment Variables

For production, set:
```
VITE_WALLETCONNECT_PROJECT_ID=your_production_project_id
```

## 🎨 Customization

### Branding

Update in `src/components/Header.tsx`:
- Logo
- App name
- Color scheme in `src/index.css`

### Token Details

Update contract details:
- Name: "YourCoin"
- Symbol: "YRC"
- Decimals: 18

### Swap Integration

To use different DEX:
1. Update router address in Swap.tsx
2. Modify swap link URL
3. Update liquidity instructions

## 🐛 Troubleshooting

### "Insufficient funds" Error

- Ensure you have test MATIC for gas fees
- Get from: https://faucet.polygon.technology/

### Wallet Not Connecting

- Check MetaMask is on Polygon Amoy
- Clear browser cache
- Try different browser

### Mining Cooldown Issues

- Check system time is correct
- Verify cooldown hasn't expired
- Check browser console for errors

### Admin Access Denied

- Verify user_id is correct in database
- Check role is set to 'admin'
- Clear cookies and re-login

## 📚 Technical Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Wallet**: RainbowKit + Wagmi
- **Backend**: Lovable Cloud (Supabase)
- **Blockchain**: Polygon (Amoy Testnet)
- **Smart Contract**: Solidity 0.8.20

## 🔗 Useful Links

- **Polygon Amoy Explorer**: https://amoy.polygonscan.com/
- **QuickSwap**: https://quickswap.exchange/
- **MATIC Faucet**: https://faucet.polygon.technology/
- **WalletConnect**: https://cloud.walletconnect.com/
- **Remix IDE**: https://remix.ethereum.org

## 📞 Support

For issues:
1. Check console logs (F12 → Console)
2. Check network requests (F12 → Network)
3. Verify contract on PolygonScan
4. Check backend logs in Lovable Cloud

## 🎉 Next Steps

1. ✅ Deploy smart contract
2. ✅ Configure frontend
3. ✅ Create admin user
4. ✅ Add liquidity
5. ✅ Test all features
6. 🚀 Go live!

Your YourCoin DeFi platform is now ready! 🎊