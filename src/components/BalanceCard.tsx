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
    <Card className="glass-card p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {icon && (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-base sm:text-lg">{icon}</span>
            </div>
          )}
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">{token}</h3>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 sm:h-8 w-24 sm:w-32" />
          <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
        </div>
      ) : (
        <div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1">{balance}</p>
          {usdValue && (
            <p className="text-xs sm:text-sm text-muted-foreground">≈ ${usdValue}</p>
          )}
        </div>
      )}
    </Card>
  );
};
