import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Settings, Users, Coins } from 'lucide-react';

export default function Admin() {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    daily_reward_amount: 10,
    cooldown_hours: 24,
    total_supply: 0,
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMined: 0,
  });

  useEffect(() => {
    if (isConnected) {
      checkAdminStatus();
    } else {
      setLoading(false);
    }
  }, [isConnected]);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const hasAdmin = roles?.some(r => r.role === 'admin');
      setIsAdmin(hasAdmin || false);

      if (hasAdmin) {
        await fetchConfig();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from('mining_config')
      .select('*')
      .single();

    if (!error && data) {
      setConfig({
        daily_reward_amount: Number(data.daily_reward_amount),
        cooldown_hours: data.cooldown_hours,
        total_supply: Number(data.total_supply),
      });
    }
  };

  const fetchStats = async () => {
    const { count } = await supabase
      .from('mining_rewards')
      .select('*', { count: 'exact', head: true });

    const { data: rewards } = await supabase
      .from('mining_rewards')
      .select('total_mined');

    const totalMined = rewards?.reduce((sum, r) => sum + Number(r.total_mined), 0) || 0;

    setStats({
      totalUsers: count || 0,
      totalMined,
    });
  };

  const handleUpdateConfig = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('mining_config')
        .update({
          daily_reward_amount: config.daily_reward_amount,
          cooldown_hours: config.cooldown_hours,
          total_supply: config.total_supply,
        })
        .eq('id', (await supabase.from('mining_config').select('id').single()).data?.id);

      if (error) throw error;

      toast({
        title: "Config updated",
        description: "Mining configuration has been updated successfully",
      });

      await fetchConfig();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24">
          <Card className="glass-card p-8 max-w-md mx-auto text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Please connect your wallet to access the admin panel
            </p>
          </Card>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24">
          <Card className="glass-card p-8 max-w-md mx-auto text-center">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have admin privileges to access this page
            </p>
            <div className="space-y-2 text-sm text-left bg-muted/50 p-4 rounded-lg">
              <p className="font-semibold">To get admin access:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Sign up/login at the <a href="/auth" className="text-primary hover:underline">Auth page</a></li>
                <li>Contact the system administrator to grant you admin role</li>
              </ol>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">Admin Panel</h1>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Total Users</h3>
              </div>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Total Mined</h3>
              </div>
              <p className="text-3xl font-bold">{stats.totalMined.toFixed(2)} YRC</p>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Total Supply</h3>
              </div>
              <p className="text-3xl font-bold">{config.total_supply.toFixed(2)} YRC</p>
            </Card>
          </div>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Mining Configuration</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="reward">Daily Reward Amount (YRC)</Label>
                <Input
                  id="reward"
                  type="number"
                  step="0.000001"
                  value={config.daily_reward_amount}
                  onChange={(e) => setConfig({...config, daily_reward_amount: parseFloat(e.target.value) || 0})}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Amount of YRC tokens users receive per mining claim
                </p>
              </div>

              <div>
                <Label htmlFor="cooldown">Cooldown Period (Hours)</Label>
                <Input
                  id="cooldown"
                  type="number"
                  value={config.cooldown_hours}
                  onChange={(e) => setConfig({...config, cooldown_hours: parseInt(e.target.value) || 0})}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Time users must wait between mining claims
                </p>
              </div>

              <div>
                <Label htmlFor="supply">Total Supply (YRC)</Label>
                <Input
                  id="supply"
                  type="number"
                  step="0.000001"
                  value={config.total_supply}
                  onChange={(e) => setConfig({...config, total_supply: parseFloat(e.target.value) || 0})}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Total token supply for tracking purposes
                </p>
              </div>

              <Button
                onClick={handleUpdateConfig}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? 'Updating...' : 'Update Configuration'}
              </Button>
            </div>
          </Card>

          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              <strong>Note:</strong> To grant admin access to a user, you need to add their user ID to the user_roles table with role 'admin'.
              Use the backend interface to manage user roles.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}