import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { createWalletClient, http, parseEther, formatEther } from "npm:viem@2.21.54";
import { privateKeyToAccount } from "npm:viem@2.21.54/accounts";
import { bsc } from "npm:viem@2.21.54/chains";

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

Deno.serve(async (req: Request) => {
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

    if (!amount || amount <= 0) {
      throw new Error("Invalid withdrawal amount");
    }

    if (!walletAddress || !walletAddress.startsWith("0x")) {
      throw new Error("Invalid wallet address");
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
      throw new Error("Missing blockchain configuration");
    }

    const account = privateKeyToAccount(`0x${adminPrivateKey}` as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: bsc,
      transport: http(rpcUrl),
    });

    const amountInWei = parseEther(amount.toString());

    const hash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [walletAddress as `0x${string}`, amountInWei],
    });

    const newBalance = currentBalance - Number(amount);

    const { error: updateError } = await supabaseClient
      .from("balances")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    const { error: transactionError } = await supabaseClient
      .from("treasury_transactions")
      .insert({
        user_id: user.id,
        transaction_type: "withdraw",
        amount: amount,
        balance_after: newBalance,
      });

    if (transactionError) {
      console.error("Transaction record error:", transactionError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        newBalance: newBalance,
        transactionHash: hash,
        message: `Successfully withdrew ${amount} YRC tokens`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
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
