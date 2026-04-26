/**
 * POST /api/webhook-stripe
 *
 * Receives Stripe webhook events. On `checkout.session.completed`, parses the
 * cart payload from session metadata and creates a Printful order for any
 * SKU that has a `printfulVariantId` set. Self-fulfilled SKUs are logged but
 * not forwarded.
 *
 * Required env vars:
 *   STRIPE_WEBHOOK_SECRET     whsec_... — verifies the Stripe-Signature header
 *   PRINTFUL_API_KEY          Printful access token (Bearer)
 *   PRINTFUL_STORE_ID         optional, only required for accounts with multiple stores
 *
 * Manual signature verification: Stripe-Signature is `t=<unix>,v1=<sig>` where
 * sig = HMAC-SHA256(STRIPE_WEBHOOK_SECRET, `${t}.${rawBody}`). Done via Web Crypto
 * to avoid pulling in any deps.
 */

interface Env {
  STRIPE_WEBHOOK_SECRET: string;
  PRINTFUL_API_KEY: string;
  PRINTFUL_STORE_ID?: string;
}

type CartLine = { id: string; qty: number; printfulVariantId?: number; category?: string };

interface StripeAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}
interface StripeShipping {
  name?: string;
  address?: StripeAddress;
}

const text = (status: number, body: string) =>
  new Response(body, { status, headers: { "content-type": "text/plain" } });

async function verifyStripeSignature(rawBody: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("="))) as Record<string, string>;
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${rawBody}`));
  const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return expected === v1;
}

async function dispatchPrintful(env: Env, lines: CartLine[], shipping: StripeShipping | undefined, recipientEmail: string) {
  const dropshipLines = lines.filter((l) => typeof l.printfulVariantId === "number");
  if (dropshipLines.length === 0) return { skipped: true };

  const body = {
    recipient: {
      name: shipping?.name || "Customer",
      address1: shipping?.address?.line1 || "",
      address2: shipping?.address?.line2 || "",
      city: shipping?.address?.city || "",
      state_code: shipping?.address?.state || "",
      country_code: shipping?.address?.country || "US",
      zip: shipping?.address?.postal_code || "",
      email: recipientEmail,
    },
    items: dropshipLines.map((l) => ({
      sync_variant_id: l.printfulVariantId,
      quantity: l.qty,
    })),
  };

  const res = await fetch("https://api.printful.com/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PRINTFUL_API_KEY}`,
      "Content-Type": "application/json",
      ...(env.PRINTFUL_STORE_ID ? { "X-PF-Store-Id": env.PRINTFUL_STORE_ID } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.text() };
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.STRIPE_WEBHOOK_SECRET) return text(500, "STRIPE_WEBHOOK_SECRET missing");
  if (!env.PRINTFUL_API_KEY)     return text(500, "PRINTFUL_API_KEY missing");

  const sigHeader = request.headers.get("stripe-signature") || "";
  const raw = await request.text();
  const ok = await verifyStripeSignature(raw, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return text(400, "invalid signature");

  let evt: { type?: string; data?: { object?: Record<string, unknown> } };
  try { evt = JSON.parse(raw); } catch { return text(400, "invalid json"); }
  if (evt?.type !== "checkout.session.completed") return text(200, "ignored");

  const session = (evt.data?.object || {}) as { metadata?: Record<string, string>; shipping_details?: StripeShipping; customer_details?: { email?: string } };
  const meta = session.metadata?.cart_payload;
  let lines: CartLine[] = [];
  try { lines = meta ? JSON.parse(meta) : []; } catch { /* noop */ }

  const result = await dispatchPrintful(env, lines, session.shipping_details, session.customer_details?.email || "");
  return text(200, JSON.stringify(result));
};
