import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Vault, TrendingUp, TrendingDown, History, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";

export default function Treasury() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (session && isConnected) {
      fetchBalance();
      fetchTransactions();
    }
  }, [session, isConnected]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (!session) {
        toast.error("Please sign in to access Treasury");
        navigate("/auth");
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsAuthChecking(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("balances")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setBalance(data?.balance || 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("treasury_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to deposit");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("deposit-tokens", {
        body: { amount },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        setDepositAmount("");
        await fetchBalance();
        await fetchTransactions();
      } else {
        toast.error(data.error || "Deposit failed");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error("Failed to deposit tokens");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to withdraw");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("withdraw-tokens", {
        body: {
          amount,
          walletAddress: address
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        if (data.transactionHash) {
          toast.success(`Transaction hash: ${data.transactionHash.slice(0, 10)}...`);
        }
        setWithdrawAmount("");
        await fetchBalance();
        await fetchTransactions();
      } else {
        toast.error(data.error || "Withdrawal failed");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to withdraw tokens");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <main className="container mx-auto px-4 py-8 mt-20">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <main className="container mx-auto px-4 py-8 mt-20">
          <Card className="glass-card p-8 max-w-md mx-auto text-center">
            <LogIn className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to access the Treasury
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Go to Sign In
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Treasury Vault
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Deposit and withdraw YRC tokens securely
            </p>
          </div>

          <Card className="glass-card p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Vault className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-2xl sm:text-3xl font-bold">{balance.toLocaleString()} YRC</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="deposit" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="deposit" className="text-xs sm:text-sm">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw" className="text-xs sm:text-sm">Withdraw</TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
              </TabsList>

              <TabsContent value="deposit" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Deposit Amount</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="Enter amount to deposit"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button
                  onClick={handleDeposit}
                  disabled={loading || !isConnected}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Deposit Tokens
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="withdraw" className="space-y-4 mt-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4 mb-4">
                  <p className="text-xs sm:text-sm text-blue-400">
                    ℹ️ Withdrawing transfers YRC tokens from your Treasury balance to your connected wallet
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Withdraw Amount</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="Enter amount to withdraw"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    disabled={loading}
                    max={balance}
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: {balance.toLocaleString()} YRC
                  </p>
                </div>
                <Button
                  onClick={handleWithdraw}
                  disabled={loading || !isConnected}
                  className="w-full"
                  size="lg"
                  variant="destructive"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <TrendingDown className="mr-2 h-4 w-4" />
                      Withdraw to Wallet
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No transactions yet</p>
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 sm:p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          {tx.transaction_type === "deposit" ? (
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                          )}
                          <div>
                            <p className="text-sm sm:text-base font-medium capitalize">{tx.transaction_type}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(tx.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm sm:text-base font-bold">
                            {tx.transaction_type === "deposit" ? "+" : "-"}
                            {Number(tx.amount).toLocaleString()} YRC
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Balance: {Number(tx.balance_after).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
}
