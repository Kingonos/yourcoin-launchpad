# Admin Setup and Adding Tokens

## How to Add Tokens to Your Treasury

### Step 1: Grant Yourself Admin Access

You need to be an admin to access the admin panel. Here's how:

1. **Sign up/Login** at `/auth` page
2. **Get your User ID**:
   - After logging in, open browser console (F12)
   - Run this command:
   ```javascript
   const { data: { user } } = await supabase.auth.getUser();
   console.log('Your User ID:', user.id);
   ```
   - Copy the user ID

3. **Add Admin Role in Supabase Dashboard**:
   - Go to your Supabase project: https://jduhrgqfyuqbphquwrqc.supabase.co
   - Go to SQL Editor
   - Run this SQL (replace YOUR_USER_ID with the actual ID):
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('YOUR_USER_ID', 'admin')
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

### Step 2: Add Tokens to Your Treasury

1. **Go to Admin Page** at `/admin`
2. **Scroll to "Add Tokens to Your Treasury"** section
3. **Enter the amount** you want (e.g., `10000000000000000000000000000000000000`)
4. **Click "Add Tokens to Treasury"**
5. The tokens will be added to your treasury balance immediately!

### Step 3: Withdraw Tokens to Your Wallet

1. **Go to Treasury Page** at `/treasury`
2. **Enter the amount** you want to withdraw
3. **Click "Withdraw"**
4. The tokens will be transferred from your treasury to your MetaMask wallet
5. You should see them in MetaMask (after adding YRC token)

## About USDC Balance

The USDC balance showing 0.00 is **NORMAL** because:

### USDC is a Real Token on Polygon
- USDC address on Polygon: `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`
- This is a real token that you need to actually have in your wallet
- It's not created by your contract - it's an existing stablecoin

### How to Get USDC on Polygon

You have several options:

#### Option 1: Buy on Exchange
1. Buy USDC on a centralized exchange (Binance, Coinbase, etc.)
2. Withdraw to Polygon network
3. Send to your MetaMask address

#### Option 2: Bridge from Another Chain
1. Use Polygon Bridge: https://portal.polygon.technology/
2. Bridge USDC from Ethereum or other chains to Polygon
3. Pay bridge fees (usually small)

#### Option 3: Swap on QuickSwap
1. Go to https://quickswap.exchange
2. Swap MATIC → USDC
3. You'll need some MATIC for gas + the amount to swap

#### Option 4: Get Testnet USDC (for testing only)
If you're testing, use Polygon Amoy testnet:
1. Get test MATIC from faucet
2. Get test USDC from DeFi protocols on testnet

### Why Your YRC Balance Works But USDC Doesn't

- **YRC**: Your custom token that you control and can mint
- **USDC**: An existing stablecoin that you need to acquire from external sources

The app is working correctly - it's just showing your real USDC balance (which is 0 because you don't have any yet).

## Summary

1. **Treasury Balance**: Stored in database, controlled by your app
2. **YRC Wallet Balance**: Tokens in your MetaMask on Polygon blockchain
3. **USDC Balance**: Real USDC tokens you need to acquire separately

You can add unlimited YRC tokens to your treasury using the admin panel, but USDC is a real token you need to buy/bridge/swap from external sources.
