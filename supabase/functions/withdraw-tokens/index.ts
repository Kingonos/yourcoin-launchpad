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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
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
      throw new Error('Invalid withdrawal amount');
    }

    // Get current balance
    const { data: balanceData, error: balanceError } = await supabaseClient
      .from('balances')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (balanceError) {
      throw new Error('Balance not found');
    }

    const currentBalance = Number(balanceData.balance);

    if (currentBalance < amount) {
      throw new Error('Insufficient balance');
    }

    const newBalance = currentBalance - Number(amount);

    // Update balance
    const { error: updateError } = await supabaseClient
      .from('balances')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Record transaction
    const { error: transactionError } = await supabaseClient
      .from('treasury_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'withdraw',
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
        message: `Successfully withdrew ${amount} YOUR tokens`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Withdrawal error:', error);
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
