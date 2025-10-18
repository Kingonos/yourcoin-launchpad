import { useAccount, useBalance } from 'wagmi';
import { Header } from '@/components/Header';
import { BalanceCard } from '@/components/BalanceCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Coins, Repeat } from 'lucide-react';
import { formatUnits } from 'viem';

// YOUR token contract address on Polygon Mumbai testnet
const YOUR_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual address
const USDC_ADDRESS = '0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97'; // USDC on Mumbai

const Home = () => {
  const { address, isConnected } = useAccount();

  const yourBalance = useBalance({
    address: address,
    token: YOUR_TOKEN_ADDRESS as `0x${string}`,
  });

  const usdcBalance = useBalance({
    address: address,
    token: USDC_ADDRESS as `0x${string}`,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section with Gradient */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.15),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Welcome to <span className="gradient-text glow-text">YourCoin</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              The next generation DeFi launchpad on Polygon. Mint, trade, and earn with YOUR token.
            </p>
            
            {!isConnected && (
              <div className="flex flex-col items-center gap-4">
                <p className="text-lg text-foreground">Connect your wallet to get started</p>
              </div>
            )}
          </div>

          {isConnected && address && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">Your Balances</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <BalanceCard
                  token="YOUR Token"
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

              <div className="grid md:grid-cols-2 gap-6">
                <Link to="/mint" className="block">
                  <div className="glass-card p-8 rounded-2xl hover:shadow-glow transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <Coins className="w-12 h-12 text-primary" />
                      <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Mint YOUR</h3>
                    <p className="text-muted-foreground">
                      Mint new YOUR tokens instantly with one click
                    </p>
                  </div>
                </Link>

                <Link to="/swap" className="block">
                  <div className="glass-card p-8 rounded-2xl hover:shadow-glow transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <Repeat className="w-12 h-12 text-secondary" />
                      <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Swap Tokens</h3>
                    <p className="text-muted-foreground">
                      Trade YOUR for USDC on QuickSwap with best rates
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
