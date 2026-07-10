import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyPaddleSignature(rawBody: string, header: string | null, secret: string) {
  if (!header) return false;
  const values = Object.fromEntries(header.split(";").map((part) => part.split("=").map((v) => v.trim())).filter((pair) => pair.length === 2));
  const timestamp = values.ts;
  const signature = values.h1;
  if (!timestamp || !signature) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}:${rawBody}`).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
