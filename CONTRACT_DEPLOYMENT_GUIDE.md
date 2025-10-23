# YRC Token Contract Deployment Guide

## Overview
This guide will help you deploy the YourCoin (YRC) ERC20 token contract to Polygon Mainnet and configure your application.

## Prerequisites
- MetaMask wallet installed and configured
- MATIC tokens in your wallet for gas fees (get from Polygon bridge or exchange)
- Your contract is located at: `src/contracts/YourCoin.sol`

## Step 1: Deploy Contract Using Remix IDE

### 1.1 Open Remix IDE
- Go to https://remix.ethereum.org

### 1.2 Create Contract File
1. Click on "File Explorer" (folder icon on left)
2. Create a new file: `YourCoin.sol`
3. Copy the entire content from `src/contracts/YourCoin.sol` and paste it into Remix

### 1.3 Install OpenZeppelin Dependencies
1. In Remix, the imports will be automatically resolved
2. If you see any errors, make sure you're using Solidity version 0.8.20 or higher

### 1.4 Compile the Contract
1. Click on "Solidity Compiler" (second icon on left sidebar)
2. Select compiler version: `0.8.20` or higher
3. Enable "Optimization" (set to 200 runs)
4. Click "Compile YourCoin.sol"
5. Ensure there are no errors

### 1.5 Deploy to Polygon Mainnet
1. Click on "Deploy & Run Transactions" (third icon on left)
2. Select Environment: "Injected Provider - MetaMask"
3. MetaMask will prompt you to connect - approve it
4. Make sure MetaMask is connected to **Polygon Mainnet** (Chain ID: 137)
   - If not on Polygon, click the network dropdown in MetaMask and select Polygon
   - If you don't see Polygon, add it from https://chainlist.org
5. In the "Deploy" section:
   - Select contract: `YourCoin`
   - Enter your wallet address in the `INITIALOWNER` field
6. Click "Deploy"
7. Confirm the transaction in MetaMask
8. Wait for deployment (usually 10-30 seconds)
9. **IMPORTANT**: Copy the deployed contract address that appears in the console

## Step 2: Configure Your Application

### 2.1 Update Environment Variables
1. Open your `.env` file
2. Update the contract address:
```env
VITE_YRC_CONTRACT_ADDRESS="YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE"
```
3. Save the file

### 2.2 Update Admin Private Key (for withdrawals)
The admin private key is used by the backend to transfer tokens during withdrawals.

**SECURITY WARNING**: Never commit your real private key to version control!

1. Export your private key from MetaMask:
   - Open MetaMask
   - Click the three dots menu
   - Go to Account Details
   - Click "Show Private Key"
   - Enter your password
   - Copy the private key (without the 0x prefix)

2. Update `.env`:
```env
ADMIN_PRIVATE_KEY="your_private_key_here"
```

3. Make sure the admin wallet has:
   - MATIC for gas fees
   - YRC tokens to distribute (transfer some tokens to this wallet after deployment)

## Step 3: Verify Contract on PolygonScan (Optional but Recommended)

### 3.1 Go to PolygonScan
- Visit https://polygonscan.com
- Search for your contract address

### 3.2 Verify Contract
1. Click "Contract" tab
2. Click "Verify and Publish"
3. Fill in the form:
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.20+commit.xxxx (match your Remix version)
   - License Type: MIT
4. Paste your entire contract code
5. If using optimization, set Optimization: Yes, 200 runs
6. Click "Verify and Publish"
7. Once verified, users can read the contract and interact with it directly on PolygonScan

## Step 4: Add Liquidity on QuickSwap (Optional)

To enable trading of YRC tokens:

1. Go to https://quickswap.exchange
2. Connect your wallet
3. Go to "Pool" section
4. Click "Add Liquidity"
5. Select YRC (paste your contract address) and USDC
6. Add equal value of both tokens
7. Confirm the transaction

## Step 5: Test Your Application

### 5.1 Test "Add YRC to Wallet"
1. Open your application
2. Connect your wallet
3. Click "Add YRC to Wallet"
4. MetaMask should prompt you to add the token
5. Approve, and YRC should appear in your MetaMask token list

### 5.2 Test Treasury Withdrawal
1. Make sure you have some balance in your treasury
2. Go to Treasury page
3. Try withdrawing a small amount
4. The tokens should appear in your MetaMask wallet
5. Check the transaction on PolygonScan

## Troubleshooting

### "Add YRC to Wallet" not working
- Make sure `VITE_YRC_CONTRACT_ADDRESS` is set correctly in `.env`
- Restart your dev server after updating `.env`
- Ensure MetaMask is on Polygon Mainnet

### Withdrawal shows success but tokens don't appear
- Check if the admin wallet has enough MATIC for gas
- Check if the admin wallet has enough YRC tokens
- Verify the transaction hash on PolygonScan
- Make sure `RPC_URL` is set correctly in `.env`

### Contract deployment fails
- Make sure you have enough MATIC for gas (usually ~0.01-0.05 MATIC)
- Check if MetaMask is on the correct network
- Try increasing gas limit manually in MetaMask

## Security Best Practices

1. **Never share your private key**
2. **Use environment variables** for sensitive data
3. **Add `.env` to `.gitignore`** (already done)
4. **Use a separate wallet** for the admin functions
5. **Test on testnet first** (Polygon Amoy) before mainnet
6. **Limit admin wallet balance** to only what's needed
7. **Monitor contract activity** regularly on PolygonScan

## Next Steps

After deployment:
1. Transfer some YRC tokens to the admin wallet for withdrawals
2. Consider setting up monitoring/alerts for contract activity
3. Create documentation for your users on how to add YRC to their wallets
4. Consider implementing additional features like staking or governance

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check PolygonScan for transaction details
3. Verify all environment variables are set correctly
4. Make sure you're on Polygon Mainnet (Chain ID: 137)
