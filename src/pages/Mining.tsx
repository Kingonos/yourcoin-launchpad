import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Pickaxe, Clock, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Mining() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [miningData, setMiningData] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (isConnected) {
      fetchMiningData();
      fetchConfig();
    }
  }, [isConnected]);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime]);

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from('mining_config')
      .select('*')
      .single();

    if (!error && data) {
      setConfig(data);
    }
  };

  const fetchMiningData = async () => {
    const { data, error } = await supabase
      .from('mining_rewards')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setMiningData(data);
      calculateRemainingTime(data.last_claim_at);
    }
  };

  const calculateRemainingTime = (lastClaimAt: string) => {
    const lastClaim = new Date(lastClaimAt).getTime();
    const cooldown = (config?.cooldown_hours || 24) * 60 * 60 * 1000;
    const nextClaim = lastClaim + cooldown;
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((nextClaim - now) / 1000));
    setRemainingTime(remaining);
  };

  const handleStartMining = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to start mining",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('claim-mining-reward');

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Mining successful! ⛏️",
          description: `You mined ${data.amount} YRC tokens`,
        });
        fetchMiningData();
        fetchConfig();
      } else if (data.error === 'Cooldown active') {
        setRemainingTime(data.remaining_seconds);
        toast({
          title: "Cooldown active",
          description: "Please wait before mining again",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Mining error:', error);
      toast({
        title: "Mining failed",
        description: error.message || "Failed to mine tokens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4">Mining YourCoin</h1>
            <p className="text-muted-foreground">
              Mine YRC tokens daily and grow your holdings
            </p>
          </div>

          {!isConnected ? (
            <Card className="glass-card p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Please connect your wallet to start mining
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Pickaxe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Daily Mining</h2>
                    <p className="text-sm text-muted-foreground">
                      Claim {config?.daily_reward_amount || 10} YRC every {config?.cooldown_hours || 24} hours
                    </p>
                  </div>
                </div>

                {remainingTime > 0 ? (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Next claim available in:</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatTime(remainingTime)}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="text-sm text-green-500 font-medium">
                      ✓ Ready to claim!
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleStartMining}
                  disabled={loading || remainingTime > 0}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner" />
                      Mining...
                    </>
                  ) : remainingTime > 0 ? (
                    'Cooldown Active'
                  ) : (
                    <>
                      <Pickaxe className="mr-2" />
                      Start Mining
                    </>
                  )}
                </Button>
              </Card>

              <Card className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Coins className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Mining Stats</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Mined</span>
                    <span className="font-bold">{miningData?.total_mined || 0} YRC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Reward</span>
                    <span className="font-bold">{config?.daily_reward_amount || 10} YRC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cooldown Period</span>
                    <span className="font-bold">{config?.cooldown_hours || 24} hours</span>
                  </div>
                </div>
              </Card>

              <div className="text-center text-sm text-muted-foreground">
                <p>Mining rewards are simulated. For actual token distribution,</p>
                <p>
                  visit the <Link to="/mint" className="text-primary hover:underline">Mint page</Link> to mint real tokens.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}