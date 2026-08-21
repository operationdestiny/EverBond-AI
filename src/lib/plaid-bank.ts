import { createHash, randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

type PlaidConnection = {
  id: string;
  owner_user_id: string;
  item_id: string;
  access_token_encrypted: string;
  institution_id: string | null;
  institution_name: string | null;
  account_id: string | null;
  account_name: string | null;
  account_mask: string | null;
  sync_cursor: string | null;
  status: string;
  last_refresh_requested_at: string | null;
};

type PaymentOrder = {
  id: string;
  user_id: string;
  rail: string;
  provider: string;
  pack_code: string;
  coins: number;
  amount_minor: number;
  currency_code: string;
  status: string;
  provider_reference: string | null;
  created_at?: string;
};

function plaidBaseUrl() {
  const env = (process.env.PLAID_ENV || "production").trim().toLowerCase();
  if (env === "sandbox") return "https://sandbox.plaid.com";
  if (env === "development") return "https://development.plaid.com";
  return "https://production.plaid.com";
}

function plaidCredentials() {
  const clientId = process.env.PLAID_CLIENT_ID?.trim();
  const secret = process.env.PLAID_SECRET?.trim();
  if (!clientId || !secret) throw new Error("PLAID_NOT_CONFIGURED");
  return { clientId, secret };
}

export function plaidConfigured() {
  try {
    plaidCredentials();
    return true;
  } catch {
    return false;
  }
}

async function plaidPost<T = any>(path: string, body: Record<string, unknown>): Promise<T> {
  const { clientId, secret } = plaidCredentials();
  const response = await fetch(`${plaidBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "PLAID-CLIENT-ID": clientId,
      "PLAID-SECRET": secret
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000)
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    const code = payload?.error_code || payload?.error_message || `HTTP_${response.status}`;
    throw new Error(`PLAID_${code}`);
  }
  return payload as T;
}

function encryptionKey() {
  const source =
    process.env.PLAID_TOKEN_ENCRYPTION_KEY?.trim() ||
    process.env.PLAID_SECRET?.trim();
  if (!source) throw new Error("PLAID_TOKEN_ENCRYPTION_KEY_MISSING");
  return createHash("sha256").update(`everbond-plaid-token:${source}`).digest();
}

function encryptToken(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function decryptToken(value: string) {
  const packed = Buffer.from(value, "base64url");
  if (packed.length < 29) throw new Error("PLAID_TOKEN_INVALID");
  const iv = packed.subarray(0, 12);
  const tag = packed.subarray(12, 28);
  const encrypted = packed.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export async function requireEverBondOwner(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return null;
  const { data, error } = await getSupabaseServiceClient()
    .from("everbond_admin_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();
  if (error || !data) return null;
  return user;
}

export async function createPlaidLinkToken(userId: string) {
  const redirectUri =
    process.env.PLAID_REDIRECT_URI?.trim() || "https://everbond.ai/plaid-oauth";
  const webhook =
    process.env.PLAID_WEBHOOK_URL?.trim() || "https://everbond.ai/api/plaid/webhook";

  return plaidPost<{ link_token: string; expiration: string }>("/link/token/create", {
    client_name: "EverBond",
    language: "en",
    country_codes: ["US"],
    user: { client_user_id: userId },
    products: ["transactions", "auth"],
    redirect_uri: redirectUri,
    webhook
  });
}

export async function exchangePlaidPublicToken(values: {
  ownerUserId: string;
  publicToken: string;
  selectedAccountId?: string | null;
  institutionId?: string | null;
  institutionName?: string | null;
}) {
  const exchanged = await plaidPost<{ access_token: string; item_id: string }>(
    "/item/public_token/exchange",
    { public_token: values.publicToken }
  );

  const accountsPayload = await plaidPost<{ accounts: any[] }>("/accounts/get", {
    access_token: exchanged.access_token
  });

  let account =
    accountsPayload.accounts.find((item) => item.account_id === values.selectedAccountId) ||
    accountsPayload.accounts.find(
      (item) => item.type === "depository" && item.subtype === "checking"
    ) ||
    accountsPayload.accounts.find((item) => item.type === "depository") ||
    accountsPayload.accounts[0];

  if (!account) throw new Error("PLAID_NO_ACCOUNT_SELECTED");

  const supabase = getSupabaseServiceClient();
  await supabase
    .from("plaid_bank_connections")
    .update({ status: "disconnected", updated_at: new Date().toISOString() })
    .neq("item_id", exchanged.item_id)
    .eq("status", "active");

  const { error } = await supabase.from("plaid_bank_connections").upsert(
    {
      owner_user_id: values.ownerUserId,
      item_id: exchanged.item_id,
      access_token_encrypted: encryptToken(exchanged.access_token),
      institution_id: values.institutionId || null,
      institution_name: values.institutionName || "Navy Federal Credit Union",
      account_id: account.account_id,
      account_name: account.name || account.official_name || "Business checking",
      account_mask: account.mask || null,
      status: "active",
      updated_at: new Date().toISOString()
    },
    { onConflict: "item_id" }
  );
  if (error) throw error;

  return {
    itemId: exchanged.item_id,
    accountId: account.account_id,
    accountName: account.name || account.official_name || "Business checking",
    accountMask: account.mask || null
  };
}

export async function getActivePlaidConnection() {
  const { data, error } = await getSupabaseServiceClient()
    .from("plaid_bank_connections")
    .select(
      "id,owner_user_id,item_id,access_token_encrypted,institution_id,institution_name,account_id,account_name,account_mask,sync_cursor,status,last_refresh_requested_at"
    )
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as PlaidConnection | null) ?? null;
}

export async function bankRailConfigured() {
  if (!plaidConfigured()) return false;
  return Boolean(await getActivePlaidConnection());
}

export async function getReceivingBankDetails() {
  const connection = await getActivePlaidConnection();
  if (!connection?.account_id) throw new Error("PLAID_BANK_NOT_CONNECTED");

  const fallbackRouting = process.env.EVERBOND_BANK_ROUTING?.trim();
  const fallbackAccount = process.env.EVERBOND_BANK_ACCOUNT?.trim();

  try {
    const accessToken = decryptToken(connection.access_token_encrypted);
    const auth = await plaidPost<{
      accounts: any[];
      numbers?: { ach?: Array<{ account_id: string; routing: string; account: string }> };
    }>("/auth/get", { access_token: accessToken });

    const number = auth.numbers?.ach?.find(
      (item) => item.account_id === connection.account_id
    );
    if (number?.routing && number?.account) {
      return {
        bankName: connection.institution_name || "Navy Federal Credit Union",
        accountName: connection.account_name || "EverBond LLC",
        accountMask: connection.account_mask || number.account.slice(-4),
        routingNumber: number.routing,
        accountNumber: number.account
      };
    }
  } catch (error) {
    console.warn("Plaid Auth bank details unavailable; checking env fallback.", error);
  }

  if (!fallbackRouting || !fallbackAccount) {
    throw new Error("BANK_RECEIVING_DETAILS_UNAVAILABLE");
  }

  return {
    bankName: process.env.EVERBOND_BANK_NAME?.trim() || "Navy Federal Credit Union",
    accountName: process.env.EVERBOND_BANK_ACCOUNT_NAME?.trim() || "EverBond LLC",
    accountMask: fallbackAccount.slice(-4),
    routingNumber: fallbackRouting,
    accountNumber: fallbackAccount
  };
}

function extractText(transaction: any) {
  const meta = transaction?.payment_meta || {};
  return [
    meta.reference_number,
    meta.reason,
    meta.payer,
    meta.payee,
    transaction?.name,
    transaction?.merchant_name,
    transaction?.original_description
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join(" | ")
    .slice(0, 1000);
}

function incomingAmountMinor(transaction: any) {
  const amount = Number(transaction?.amount);
  if (!Number.isFinite(amount) || amount >= 0) return null;
  const minor = Math.round(Math.abs(amount) * 100);
  return Number.isSafeInteger(minor) && minor > 0 ? minor : null;
}

function normalizeReference(value: string | null | undefined) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function cacheTransactions(connection: PlaidConnection, transactions: any[]) {
  if (!connection.account_id) return;
  const rows = transactions
    .filter((transaction) => transaction?.account_id === connection.account_id)
    .map((transaction) => {
      const amountMinor = incomingAmountMinor(transaction);
      if (!amountMinor) return null;
      const meta = transaction.payment_meta || {};
      return {
        transaction_id: transaction.transaction_id,
        item_id: connection.item_id,
        account_id: transaction.account_id,
        amount_minor: amountMinor,
        currency_code: transaction.iso_currency_code || transaction.unofficial_currency_code || "USD",
        transaction_date: transaction.date || null,
        transaction_datetime: transaction.datetime || null,
        pending: Boolean(transaction.pending),
        reference_text: extractText(transaction) || null,
        payer: typeof meta.payer === "string" ? meta.payer.slice(0, 300) : null,
        payment_method:
          typeof meta.payment_method === "string"
            ? meta.payment_method.slice(0, 100)
            : null,
        raw_name:
          typeof transaction.name === "string" ? transaction.name.slice(0, 500) : null,
        last_seen_at: new Date().toISOString()
      };
    })
    .filter(Boolean);

  if (!rows.length) return;
  const { error } = await getSupabaseServiceClient()
    .from("plaid_incoming_transactions")
    .upsert(rows as any[], { onConflict: "transaction_id" });
  if (error) throw error;
}

export async function syncPlaidTransactions() {
  const connection = await getActivePlaidConnection();
  if (!connection?.account_id) return { synced: false, reason: "NOT_CONNECTED" as const };

  const accessToken = decryptToken(connection.access_token_encrypted);
  let cursor = connection.sync_cursor || undefined;
  let hasMore = true;
  let loops = 0;

  while (hasMore && loops < 20) {
    loops += 1;
    const payload = await plaidPost<{
      added: any[];
      modified: any[];
      removed: Array<{ transaction_id: string }>;
      next_cursor: string;
      has_more: boolean;
    }>("/transactions/sync", {
      access_token: accessToken,
      cursor,
      count: 500
    });

    await cacheTransactions(connection, [...(payload.added || []), ...(payload.modified || [])]);
    cursor = payload.next_cursor;
    hasMore = Boolean(payload.has_more);
  }

  const { error } = await getSupabaseServiceClient()
    .from("plaid_bank_connections")
    .update({
      sync_cursor: cursor || null,
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", connection.id);
  if (error) throw error;

  await reconcileDirectBankOrders();
  return { synced: true as const };
}

export async function requestPlaidRefreshIfNeeded() {
  const connection = await getActivePlaidConnection();
  if (!connection) return false;

  const last = connection.last_refresh_requested_at
    ? new Date(connection.last_refresh_requested_at).getTime()
    : 0;
  if (Date.now() - last < 30_000) return false;

  const accessToken = decryptToken(connection.access_token_encrypted);
  await plaidPost("/transactions/refresh", { access_token: accessToken });

  await getSupabaseServiceClient()
    .from("plaid_bank_connections")
    .update({
      last_refresh_requested_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", connection.id);

  return true;
}

async function creditBankOrder(order: PaymentOrder, transactionId: string) {
  const supabase = getSupabaseServiceClient();
  const externalId = `plaid:${transactionId}`;

  const { error } = await supabase.rpc("credit_evercoin_purchase", {
    p_user_id: order.user_id,
    p_transaction_id: externalId,
    p_price_id: `direct_bank:bank:${order.pack_code}`,
    p_pack_code: order.pack_code,
    p_coins: order.coins,
    p_total_minor: order.amount_minor,
    p_currency_code: order.currency_code
  });
  if (error) throw error;

  const { error: orderError } = await supabase
    .from("evercoin_payment_orders")
    .update({
      status: "paid",
      external_transaction_id: externalId,
      provider_state: "RECEIVED",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      error_code: null
    })
    .eq("id", order.id)
    .eq("status", "pending");
  if (orderError) throw orderError;

  const { error: txError } = await supabase
    .from("plaid_incoming_transactions")
    .update({ matched_order_id: order.id, last_seen_at: new Date().toISOString() })
    .eq("transaction_id", transactionId)
    .is("matched_order_id", null);
  if (txError) throw txError;
}

export async function reconcileDirectBankOrders() {
  const supabase = getSupabaseServiceClient();
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: orders, error: ordersError } = await supabase
    .from("evercoin_payment_orders")
    .select(
      "id,user_id,rail,provider,pack_code,coins,amount_minor,currency_code,status,provider_reference,created_at"
    )
    .eq("rail", "bank")
    .eq("provider", "direct_bank")
    .eq("status", "pending")
    .gte("created_at", cutoff)
    .order("created_at", { ascending: true });
  if (ordersError) throw ordersError;
  if (!orders?.length) return;

  const { data: transactions, error: txError } = await supabase
    .from("plaid_incoming_transactions")
    .select(
      "transaction_id,amount_minor,pending,reference_text,transaction_datetime,transaction_date,first_seen_at,matched_order_id"
    )
    .eq("pending", false)
    .is("matched_order_id", null)
    .gte("first_seen_at", cutoff)
    .order("first_seen_at", { ascending: true });
  if (txError) throw txError;
  if (!transactions?.length) return;

  for (const transaction of transactions) {
    const amountOrders = (orders as PaymentOrder[]).filter(
      (order) => order.amount_minor === Number(transaction.amount_minor)
    );
    if (!amountOrders.length) continue;

    const txRef = normalizeReference(transaction.reference_text);
    const strongMatches = amountOrders.filter((order) => {
      const ref = normalizeReference(order.provider_reference);
      return Boolean(ref && txRef.includes(ref));
    });

    if (strongMatches.length === 1) {
      await creditBankOrder(strongMatches[0], transaction.transaction_id);
    }
  }
}

export async function refreshAndReconcileBankPayments() {
  try {
    await syncPlaidTransactions();
  } catch (error) {
    console.warn("Plaid sync before refresh failed:", error);
  }

  try {
    await requestPlaidRefreshIfNeeded();
  } catch (error) {
    console.warn("Plaid refresh request failed:", error);
  }

  return true;
}

function decodeBase64UrlJson<T>(segment: string): T {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8")) as T;
}

export async function verifyPlaidWebhook(rawBody: string, verification: string | null) {
  if (!verification) return false;
  const parts = verification.split(".");
  if (parts.length !== 3) return false;

  let header: { alg?: string; kid?: string };
  let payload: { iat?: number; request_body_sha256?: string };
  try {
    header = decodeBase64UrlJson(parts[0]);
    payload = decodeBase64UrlJson(parts[1]);
  } catch {
    return false;
  }

  if (header.alg !== "ES256" || !header.kid) return false;
  if (!payload.iat || Math.abs(Date.now() / 1000 - payload.iat) > 300) return false;

  const keyPayload = await plaidPost<{ key: JsonWebKey }>(
    "/webhook_verification_key/get",
    { key_id: header.kid }
  );

  try {
    const key = await crypto.subtle.importKey(
      "jwk",
      keyPayload.key,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"]
    );
    const validSignature = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      Buffer.from(parts[2], "base64url"),
      Buffer.from(`${parts[0]}.${parts[1]}`)
    );
    if (!validSignature) return false;
  } catch {
    return false;
  }

  const bodyHash = createHash("sha256").update(rawBody).digest("hex");
  return bodyHash === payload.request_body_sha256;
}
