-- Create balances table to track user token balances
CREATE TABLE IF NOT EXISTS public.balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create treasury_transactions table to track deposits and withdrawals
CREATE TABLE IF NOT EXISTS public.treasury_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'withdraw')),
  amount numeric NOT NULL,
  balance_after numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for balances
CREATE POLICY "Users can view their own balance"
  ON public.balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balance"
  ON public.balances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance"
  ON public.balances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all balances"
  ON public.balances FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for treasury_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.treasury_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.treasury_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON public.treasury_transactions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating updated_at
CREATE TRIGGER update_balances_updated_at
  BEFORE UPDATE ON public.balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial balance for admin user (1,000,000 YOUR tokens)
INSERT INTO public.balances (user_id, balance)
VALUES ('e63ee8e1-f057-4ca4-a7dc-b9b543bec05f'::uuid, 1000000)
ON CONFLICT (user_id) DO UPDATE SET balance = balances.balance + 1000000;