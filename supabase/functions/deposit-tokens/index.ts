import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    console.log('User check:', { user: !!user, error: userError });

    if (userError) {
      console.error('Auth error:', userError);
      throw new Error(`Authentication failed: ${userError.message}`);
    }
    
    if (!user) {
      throw new Error('User not found');
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error('Invalid deposit amount');
    }

    // Get current balance
    const { data: balanceData, error: balanceError } = await supabaseClient
      .from('balances')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    if (balanceError) {
      throw balanceError;
    }

    const currentBalance = balanceData?.balance || 0;
    const newBalance = Number(currentBalance) + Number(amount);

    // Upsert balance
    const { error: upsertError } = await supabaseClient
      .from('balances')
      .upsert({
        user_id: user.id,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      throw upsertError;
    }

    // Record transaction
    const { error: transactionError } = await supabaseClient
      .from('treasury_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'deposit',
        amount: amount,
        balance_after: newBalance,
      });

    if (transactionError) {
      throw transactionError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        newBalance: newBalance,
        message: `Successfully deposited ${amount} YOUR tokens`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Deposit error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
