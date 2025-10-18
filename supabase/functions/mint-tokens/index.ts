import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, amount } = await req.json();

    console.log('Minting request:', { address, amount });

    // Validate input
    if (!address || !amount) {
      throw new Error('Address and amount are required');
    }

    if (amount <= 0 || amount > 10000) {
      throw new Error('Amount must be between 1 and 10,000');
    }

    // In a production environment, this would:
    // 1. Connect to your deployed ERC-20 contract
    // 2. Call the mint function with proper authentication
    // 3. Return the transaction hash
    
    // For now, we'll simulate a successful mint
    // You'll need to replace this with actual Web3 logic:
    /*
    import { ethers } from 'https://cdn.skypack.dev/ethers@5.7.2';
    
    const provider = new ethers.providers.JsonRpcProvider(YOUR_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    const tx = await contract.mint(address, ethers.utils.parseUnits(amount.toString(), 18));
    await tx.wait();
    */

    console.log(`Successfully minted ${amount} tokens to ${address}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Minted ${amount} YOUR tokens`,
        // In production, return actual transaction hash:
        // txHash: tx.hash
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Mint error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
