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
import { Loader2, Vault, TrendingUp, TrendingDown, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Treasury() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected) {
      fetchBalance();
      fetchTransactions();
    }
  }, [isConnected]);

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
    if (!isConnected) {
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
        body: { amount },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Treasury Vault
            </h1>
            <p className="text-muted-foreground">
              Deposit and withdraw YOUR tokens securely
            </p>
          </div>

          <Card className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Vault className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-3xl font-bold">{balance.toLocaleString()} YOUR</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="deposit" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
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
                    Available: {balance.toLocaleString()} YOUR
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
                      Withdraw Tokens
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
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          {tx.transaction_type === "deposit" ? (
                            <TrendingUp className="w-5 h-5 text-green-500" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium capitalize">{tx.transaction_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(tx.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {tx.transaction_type === "deposit" ? "+" : "-"}
                            {Number(tx.amount).toLocaleString()} YOUR
                          </p>
                          <p className="text-sm text-muted-foreground">
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
