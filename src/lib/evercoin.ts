import { getSupabaseServiceClient } from "@/lib/supabase/server";

function firstRow<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function getEverCoinBalance(userId: string) {
  const { data, error } = await getSupabaseServiceClient()
    .from("evercoin_wallets")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return Number(data?.balance ?? 0);
}

export async function chargeEverCoin(values: {
  userId: string;
  amount: number;
  reason: string;
  referenceId?: string | null;
}) {
  const amount = Math.max(Math.trunc(values.amount), 0);
  const { data, error } = await getSupabaseServiceClient().rpc(
    "charge_evercoin",
    {
      p_user_id: values.userId,
      p_amount: amount,
      p_reason: values.reason,
      p_reference_id: values.referenceId ?? null
    }
  );

  if (error) throw error;

  const row = firstRow(data as {
    charged: boolean;
    balance: number | string;
  } | Array<{
    charged: boolean;
    balance: number | string;
  }> | null);

  return {
    charged: Boolean(row?.charged),
    balance: Number(row?.balance ?? 0)
  };
}

export async function chargeVoiceCallMinute(values: {
  userId: string;
  callId: string;
  characterId: string;
  minuteIndex: number;
  amount: number;
}) {
  const { data, error } = await getSupabaseServiceClient().rpc(
    "charge_voice_call_minute",
    {
      p_user_id: values.userId,
      p_call_id: values.callId,
      p_character_id: values.characterId,
      p_minute_index: Math.max(Math.trunc(values.minuteIndex), 1),
      p_amount: Math.max(Math.trunc(values.amount), 0)
    }
  );

  if (error) throw error;

  const row = firstRow(data as {
    charged: boolean;
    balance: number | string;
    already_charged: boolean;
  } | Array<{
    charged: boolean;
    balance: number | string;
    already_charged: boolean;
  }> | null);

  return {
    charged: Boolean(row?.charged),
    balance: Number(row?.balance ?? 0),
    alreadyCharged: Boolean(row?.already_charged)
  };
}

export async function refundEverCoin(values: {
  userId: string;
  amount: number;
  reason: string;
  referenceId?: string | null;
}) {
  const amount = Math.max(Math.trunc(values.amount), 0);
  const { data, error } = await getSupabaseServiceClient().rpc(
    "refund_evercoin",
    {
      p_user_id: values.userId,
      p_amount: amount,
      p_reason: values.reason,
      p_reference_id: values.referenceId ?? null
    }
  );

  if (error) throw error;
  return Number(data ?? 0);
}
