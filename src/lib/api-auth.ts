import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");

  if (!token) return null;

  const { data, error } =
    await getSupabaseServiceClient().auth.getUser(token);

  if (error || !data.user) return null;
  return data.user;
}
