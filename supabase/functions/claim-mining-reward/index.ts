import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Processing mining claim for user:', user.id);

    // Get mining config
    const { data: config, error: configError } = await supabase
      .from('mining_config')
      .select('*')
      .single();

    if (configError || !config) {
      throw new Error('Mining config not found');
    }

    // Check or create user mining record
    const { data: miningRecord, error: fetchError } = await supabase
      .from('mining_rewards')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      throw new Error('Error fetching mining record');
    }

    // If no record exists, create one
    if (!miningRecord) {
      const { data: newRecord, error: insertError } = await supabase
        .from('mining_rewards')
        .insert({
          user_id: user.id,
          amount: config.daily_reward_amount,
          total_mined: config.daily_reward_amount,
          last_claim_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw new Error('Error creating mining record');
      }

      console.log('First time claim successful:', newRecord);
      
      return new Response(
        JSON.stringify({
          success: true,
          amount: config.daily_reward_amount,
          total_mined: config.daily_reward_amount,
          next_claim_at: new Date(Date.now() + config.cooldown_hours * 60 * 60 * 1000).toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cooldown
    const lastClaimTime = new Date(miningRecord.last_claim_at).getTime();
    const cooldownMs = config.cooldown_hours * 60 * 60 * 1000;
    const nextClaimTime = lastClaimTime + cooldownMs;
    const now = Date.now();

    if (now < nextClaimTime) {
      const remainingMs = nextClaimTime - now;
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Cooldown active',
          remaining_seconds: Math.floor(remainingMs / 1000),
          next_claim_at: new Date(nextClaimTime).toISOString(),
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update mining record
    const newTotalMined = Number(miningRecord.total_mined) + Number(config.daily_reward_amount);
    const { data: updated, error: updateError } = await supabase
      .from('mining_rewards')
      .update({
        amount: config.daily_reward_amount,
        total_mined: newTotalMined,
        last_claim_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      throw new Error('Error updating mining record');
    }

    console.log('Claim successful:', updated);

    return new Response(
      JSON.stringify({
        success: true,
        amount: config.daily_reward_amount,
        total_mined: newTotalMined,
        next_claim_at: new Date(Date.now() + cooldownMs).toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in claim-mining-reward:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});