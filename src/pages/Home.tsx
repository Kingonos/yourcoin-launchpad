import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Header } from '@/components/Header';
import { BalanceCard } from '@/components/BalanceCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Coins, Repeat, Vault } from 'lucide-react';
import { formatUnits } from 'viem';
import { supabase } from '@/integrations/supabase/client';

// Detect if backend env is available to avoid runtime crashes in preview
const SUPABASE_READY = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
);


const YOUR_TOKEN_ADDRESS = (import.meta.env.VITE_YRC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as `0x${string}`;

const Home = () => {
  const { address, isConnected } = useAccount();
  const [treasuryBalance, setTreasuryBalance] = useState<number>(0);
  const [loadingTreasury, setLoadingTreasury] = useState(false);

  const yourBalance = useBalance({
    address: address,
    token: YOUR_TOKEN_ADDRESS as `0x${string}`,
  });

  const usdcBalance = useBalance({
    address: address,
    token: USDC_ADDRESS as `0x${string}`,
  });

  useEffect(() => {
    if (isConnected) {
      fetchTreasuryBalance();
    }
  }, [isConnected]);

  const fetchTreasuryBalance = async () => {
    if (!SUPABASE_READY) {
      // Supabase not configured; skip fetching to avoid runtime errors in preview
      setTreasuryBalance(0);
      return;
    }
    setLoadingTreasury(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('balances')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setTreasuryBalance(data?.balance || 0);
    } catch (error) {
      console.error('Error fetching treasury balance:', error);
    } finally {
      setLoadingTreasury(false);
    }
  };

  const addTokenToWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or Trust Wallet');
      return;
    }

    if (YOUR_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
      alert('YRC contract address is not configured. Please deploy your contract and update VITE_YRC_CONTRACT_ADDRESS in .env file.');
      return;
    }

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: YOUR_TOKEN_ADDRESS,
            symbol: 'YRC',
            decimals: 18,
            image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
          },
        },
      });

      if (wasAdded) {
        alert('YRC token successfully added to your wallet!');
      }
    } catch (error) {
      console.error('Error adding token to wallet:', error);
      alert('Failed to add token to wallet. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section with Gradient */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.15),transparent_50%)]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 px-4">
              Welcome to <span className="gradient-text glow-text">YourCoin</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
              The next generation DeFi launchpad on Polygon. Mint, trade, and earn with YRC token.
            </p>

            {!isConnected && (
              <div className="flex flex-col items-center gap-4 px-4">
                <p className="text-base sm:text-lg text-foreground">Connect your wallet to get started</p>
                <p className="text-sm text-muted-foreground">
                  Supports MetaMask, Trust Wallet, WalletConnect, and more
                </p>
              </div>
            )}
          </div>

          {isConnected && address && (
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-center sm:text-left">Your Balances</h2>
                <Button
                  onClick={addTokenToWallet}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Add YRC to Wallet
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                <BalanceCard
                  token="Treasury Balance"
                  balance={treasuryBalance.toLocaleString()}
                  loading={loadingTreasury}
                  icon="🏦"
                />
                <BalanceCard
                  token="YRC Token (Wallet)"
                  balance={yourBalance.data ? formatUnits(yourBalance.data.value, yourBalance.data.decimals) : '0.00'}
                  loading={yourBalance.isLoading}
                  icon="🪙"
                />
                <BalanceCard
                  token="USDC"
                  balance={usdcBalance.data ? formatUnits(usdcBalance.data.value, usdcBalance.data.decimals) : '0.00'}
                  loading={usdcBalance.isLoading}
                  icon="💵"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Link to="/treasury" className="block">
                  <div className="glass-card p-6 sm:p-8 rounded-2xl hover:shadow-glow transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <Vault className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">Treasury</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Deposit and withdraw YRC tokens securely
                    </p>
                  </div>
                </Link>

                <Link to="/mint" className="block">
                  <div className="glass-card p-6 sm:p-8 rounded-2xl hover:shadow-glow transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <Coins className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">Mint YRC</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Mint new YRC tokens instantly with one click
                    </p>
                  </div>
                </Link>

                <Link to="/swap" className="block">
                  <div className="glass-card p-6 sm:p-8 rounded-2xl hover:shadow-glow transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <Repeat className="w-10 h-10 sm:w-12 sm:h-12 text-secondary" />
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">Swap Tokens</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Trade YRC for USDC on QuickSwap with best rates
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
