import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Repeat, ExternalLink, Info } from 'lucide-react';

const Swap = () => {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState('100');
  const [slippage, setSlippage] = useState('0.5');
  
  // Mock price calculation (1 YOUR = 0.1 USDC)
  const estimatedOutput = (parseFloat(amount || '0') * 0.1).toFixed(2);
  const priceImpact = '0.12';

  const openPancakeSwap = () => {
    window.open('https://pancakeswap.finance/swap', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">Swap Tokens</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Trade YRC for USDT on PancakeSwap with best rates
              </p>
            </div>

            <Card className="glass-card p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-center mb-8">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Repeat className="w-8 h-8 text-secondary" />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="swap-amount" className="text-base mb-2">
                    You Pay
                  </Label>
                  <div className="relative">
                    <Input
                      id="swap-amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100"
                      className="text-lg h-12 pr-20"
                      min="0"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground font-semibold text-sm sm:text-base">
                      YRC
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
                    <Repeat className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="receive-amount" className="text-base mb-2">
                    You Receive (estimated)
                  </Label>
                  <div className="relative">
                    <Input
                      id="receive-amount"
                      type="text"
                      value={estimatedOutput}
                      readOnly
                      className="text-lg h-12 pr-20 bg-muted/30"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground font-semibold text-sm sm:text-base">
                      USDT
                    </div>
                  </div>
                </div>

                <div className="glass-card p-3 sm:p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="text-foreground">1 YRC = 0.1 USDT</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Price Impact</span>
                    <span className="text-green-500">&lt; {priceImpact}%</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Slippage Tolerance</span>
                    <span className="text-foreground">{slippage}%</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Network Fee</span>
                    <span className="text-foreground">~0.003 BNB</span>
                  </div>
                </div>

                <div className="glass-card p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 bg-primary/10">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <p className="text-foreground mb-2">
                      Swaps are executed on PancakeSwap DEX. You'll be redirected to complete the trade
                      with the current market rates.
                    </p>
                    <p className="text-muted-foreground">
                      Make sure you have BNB for gas fees and YRC tokens approved for trading.
                    </p>
                  </div>
                </div>

                {!isConnected ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      Please connect your wallet to swap tokens
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={openPancakeSwap}
                    className="w-full h-12 text-base sm:text-lg"
                    size="lg"
                  >
                    Continue to PancakeSwap
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Button>
                )}

                <div className="text-center pt-2">
                  <a
                    href="https://docs.pancakeswap.finance/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Learn about PancakeSwap
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
