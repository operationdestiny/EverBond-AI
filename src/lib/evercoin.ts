import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function getEverCoinBalance(userId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("evercoin_wallets")
    .upsert(
      {
        user_id: userId,
        balance: 0
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: true
      }
    )
    .select("balance")
    .single();

  if (error) throw error;
  return Number(data.balance ?? 0);
}

export async function chargeEverCoin(values: {
  userId: string;
  amount: number;
  reason: string;
  referenceId?: string | null;
}) {
  if (values.amount <= 0) {
    return {
      charged: true,
      balance: await getEverCoinBalance(values.userId)
    };
  }

  const { data, error } = await getSupabaseServiceClient().rpc(
    "charge_evercoin",
    {
      p_user_id: values.userId,
      p_amount: values.amount,
      p_reason: values.reason,
      p_reference_id: values.referenceId ?? null
    }
  );

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;

  return {
    charged: Boolean(row?.charged),
    balance: Number(row?.balance ?? 0)
  };
}

export async function refundEverCoin(values: {
  userId: string;
  amount: number;
  reason: string;
  referenceId?: string | null;
}) {
  if (values.amount <= 0) return;

  const { error } = await getSupabaseServiceClient().rpc(
    "refund_evercoin",
    {
      p_user_id: values.userId,
      p_amount: values.amount,
      p_reason: values.reason,
      p_reference_id: values.referenceId ?? null
    }
  );

  if (error) throw error;
}
