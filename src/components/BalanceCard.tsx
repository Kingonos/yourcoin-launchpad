import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface BalanceCardProps {
  token: string;
  balance: string;
  usdValue?: string;
  loading?: boolean;
  icon?: string;
}

export const BalanceCard = ({ token, balance, usdValue, loading, icon }: BalanceCardProps) => {
  return (
    <Card className="glass-card p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-lg">{icon}</span>
            </div>
          )}
          <h3 className="text-lg font-semibold text-foreground">{token}</h3>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : (
        <div>
          <p className="text-3xl font-bold text-foreground mb-1">{balance}</p>
          {usdValue && (
            <p className="text-sm text-muted-foreground">≈ ${usdValue}</p>
          )}
        </div>
      )}
    </Card>
  );
};
