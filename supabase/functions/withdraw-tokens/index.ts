import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ERC20_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Authentication failed");
    }

    const { amount, walletAddress } = await req.json();

    // Validate inputs
    if (!amount || typeof amount !== "number" || amount <= 0) {
      throw new Error("Invalid withdrawal amount");
    }

    if (amount > 1000000) {
      throw new Error("Withdrawal amount exceeds maximum limit of 1,000,000 tokens");
    }

    if (!walletAddress || typeof walletAddress !== "string" || !walletAddress.startsWith("0x") || walletAddress.length !== 42) {
      throw new Error("Invalid wallet address format");
    }

    const { data: balanceData, error: balanceError } = await supabaseClient
      .from("balances")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (balanceError) {
      throw new Error("Balance not found");
    }

    const currentBalance = Number(balanceData.balance);

    if (currentBalance < amount) {
      throw new Error("Insufficient balance");
    }

    const rpcUrl = Deno.env.get("RPC_URL");
    const adminPrivateKey = Deno.env.get("ADMIN_PRIVATE_KEY");
    const contractAddress = Deno.env.get("VITE_YRC_CONTRACT_ADDRESS");

    if (!rpcUrl || !adminPrivateKey || !contractAddress) {
      throw new Error("Missing blockchain configuration - withdrawals require blockchain setup");
    }

    // Note: On-chain withdrawals require viem library setup
    // For now, withdrawals are disabled until blockchain integration is complete
    throw new Error("On-chain withdrawals are temporarily disabled. Please contact support for assistance.");
  } catch (error) {
    console.error("Withdrawal error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
