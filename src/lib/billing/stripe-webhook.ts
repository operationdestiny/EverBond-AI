import {
  createHmac,
  timingSafeEqual
} from "node:crypto";

const DEFAULT_TOLERANCE_SECONDS = 300;

function secureHexEqual(left: string, right: string) {
  if (!/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right)) {
    return false;
  }

  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (
    leftBuffer.length === 0 ||
    leftBuffer.length !== rightBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS
) {
  if (!signatureHeader || !secret) return false;

  const values = signatureHeader
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const timestampPart = values.find((value) =>
    value.startsWith("t=")
  );
  const signatures = values
    .filter((value) => value.startsWith("v1="))
    .map((value) => value.slice(3));

  const timestamp = Number(timestampPart?.slice(2));

  if (
    !Number.isFinite(timestamp) ||
    timestamp <= 0 ||
    signatures.length === 0
  ) {
    return false;
  }

  const ageSeconds = Math.abs(
    Math.floor(Date.now() / 1000) - timestamp
  );

  if (ageSeconds > toleranceSeconds) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return signatures.some((signature) =>
    secureHexEqual(signature, expected)
  );
}
