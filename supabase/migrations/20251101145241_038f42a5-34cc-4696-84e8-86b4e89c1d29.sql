-- Security Fix: Remove dangerous RLS policies that allow users to manipulate financial data
-- Drop policies that allow users to directly modify their own balances and transactions

-- Remove user update policy on balances table
DROP POLICY IF EXISTS "Users can update their own balance" ON public.balances;

-- Remove user insert policy on treasury_transactions table
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.treasury_transactions;

-- Remove user insert and update policies on mining_rewards table
DROP POLICY IF EXISTS "Users can insert their own mining rewards" ON public.mining_rewards;
DROP POLICY IF EXISTS "Users can update their own mining rewards" ON public.mining_rewards;

-- Create a table to track transaction hashes to prevent replay attacks
CREATE TABLE IF NOT EXISTS public.processed_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_hash text UNIQUE NOT NULL,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  processed_at timestamp with time zone DEFAULT now(),
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'withdraw'))
);

ALTER TABLE public.processed_transactions ENABLE ROW LEVEL SECURITY;

-- Only admins can view processed transactions
CREATE POLICY "Admins can view processed transactions"
ON public.processed_transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create admin audit log table for better tracking
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_user_id uuid,
  amount numeric,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_log
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));