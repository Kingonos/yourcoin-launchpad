-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create mining_rewards table
CREATE TABLE public.mining_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount DECIMAL(20, 6) NOT NULL,
  last_claim_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_mined DECIMAL(20, 6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on mining_rewards
ALTER TABLE public.mining_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for mining_rewards
CREATE POLICY "Users can view their own mining rewards"
  ON public.mining_rewards FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own mining rewards"
  ON public.mining_rewards FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own mining rewards"
  ON public.mining_rewards FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all mining rewards"
  ON public.mining_rewards FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create mining_config table for admin settings
CREATE TABLE public.mining_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_reward_amount DECIMAL(20, 6) NOT NULL DEFAULT 10.0,
  cooldown_hours INTEGER NOT NULL DEFAULT 24,
  total_supply DECIMAL(20, 6) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID
);

-- Enable RLS on mining_config
ALTER TABLE public.mining_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for mining_config
CREATE POLICY "Everyone can view mining config"
  ON public.mining_config FOR SELECT
  USING (true);

CREATE POLICY "Admins can update mining config"
  ON public.mining_config FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default mining config
INSERT INTO public.mining_config (daily_reward_amount, cooldown_hours, total_supply)
VALUES (10.0, 24, 0);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mining_rewards_updated_at
  BEFORE UPDATE ON public.mining_rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mining_config_updated_at
  BEFORE UPDATE ON public.mining_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();