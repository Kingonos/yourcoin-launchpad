import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Mint = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState('0.002');

  const handleMint = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      
      // Call backend minting function
      const { data, error } = await supabase.functions.invoke('mint-tokens', {
        body: {
          address,
          amount: parseFloat(amount),
        },
      });

      if (error) throw error;

      toast.success(`Successfully minted ${amount} YRC tokens!`);
      setAmount('100');
    } catch (error: any) {
      console.error('Minting error:', error);
      toast.error(error.message || 'Failed to mint tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">Mint YOUR Tokens</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Mint new YOUR tokens instantly to your wallet
              </p>
            </div>

            <Card className="glass-card p-8">
              <div className="flex items-center justify-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Coins className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="amount" className="text-base mb-2">
                    Amount to Mint
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    className="text-lg h-12"
                    min="1"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Minimum: 1 YOUR • Maximum: 10,000 YOUR
                  </p>
                </div>

                <div className="glass-card p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network</span>
                    <span className="text-foreground">Polygon Mumbai</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Gas Fee</span>
                    <span className="text-foreground">{estimatedGas} MATIC</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border/30">
                    <span className="text-foreground font-semibold">You'll receive</span>
                    <span className="text-primary font-semibold">{amount} YOUR</span>
                  </div>
                </div>

                {!isConnected ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      Please connect your wallet to mint tokens
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={handleMint}
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                    className="w-full h-12 text-lg"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Minting...
                      </>
                    ) : (
                      'Mint Tokens'
                    )}
                  </Button>
                )}

                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Minting is free (you only pay gas fees). YOUR tokens will appear in your wallet
                    within seconds.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mint;
