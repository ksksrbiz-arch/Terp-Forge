/**
 * POST /api/checkout
 *
 * Body: { items: [{ id, name, price, qty, image, category, printfulVariantId? }] }
 *
 * Creates a Stripe Checkout Session in HOSTED mode. Returns { url } which the
 * client redirects to. The Pages Function runs on Cloudflare Workers; uses the
 * raw Stripe REST API (no SDK — keeps the worker bundle <1KB compressed and
 * dodges the node-API surface that Stripe-node depends on).
 *
 * Required env vars (Pages → Settings → Environment variables):
 *   STRIPE_SECRET_KEY         sk_live_... or sk_test_...
 *   STRIPE_PRICE_CURRENCY     defaults to "usd" if unset
 *   PUBLIC_SITE_URL           https://terpforge.com (used for success/cancel URLs)
 */

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_CURRENCY?: string;
  PUBLIC_SITE_URL?: string;
}

interface CheckoutItem {
  id: string;
  name: string;
  price: number;        // dollars
  qty: number;
  image?: string;
  category?: string;
  printfulVariantId?: number;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const onRequestOptions = async (_ctx: { request: Request; env: Env }) =>
  new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.STRIPE_SECRET_KEY) {
    return json(500, { error: "STRIPE_SECRET_KEY is not configured." });
  }

  let payload: { items?: CheckoutItem[] };
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  const items = (payload.items || []).filter(
    (i): i is CheckoutItem =>
      typeof i?.id === "string" && typeof i?.name === "string" && typeof i?.price === "number" && typeof i?.qty === "number" && i.qty > 0
  );
  if (items.length === 0) return json(400, { error: "Cart is empty." });

  const currency = (env.STRIPE_PRICE_CURRENCY || "usd").toLowerCase();
  const siteUrl = (env.PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");

  // Stripe expects application/x-www-form-urlencoded with bracketed keys
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", `${siteUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${siteUrl}/?checkout=cancel`);
  form.set("billing_address_collection", "required");
  form.set("phone_number_collection[enabled]", "true");
  form.set("shipping_address_collection[allowed_countries][0]", "US");
  form.set("shipping_address_collection[allowed_countries][1]", "CA");
  form.set("automatic_tax[enabled]", "true");
  form.set("allow_promotion_codes", "true");
  // Carry cart payload in metadata so the fulfillment webhook can route to Printful
  form.set("metadata[cart_payload]", JSON.stringify(items.map((i) => ({
    id: i.id, qty: i.qty, printfulVariantId: i.printfulVariantId, category: i.category,
  }))).slice(0, 4990)); // Stripe metadata field limit

  items.forEach((item, idx) => {
    form.set(`line_items[${idx}][quantity]`, String(item.qty));
    form.set(`line_items[${idx}][price_data][currency]`, currency);
    form.set(`line_items[${idx}][price_data][unit_amount]`, String(Math.round(item.price * 100)));
    form.set(`line_items[${idx}][price_data][product_data][name]`, item.name);
    form.set(`line_items[${idx}][price_data][product_data][metadata][sku]`, item.id);
    if (item.image) {
      const fullImage = item.image.startsWith("http") ? item.image : `${siteUrl}${item.image}`;
      form.set(`line_items[${idx}][price_data][product_data][images][0]`, fullImage);
    }
  });

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!stripeRes.ok) {
    const detail = await stripeRes.text();
    return json(502, { error: "Stripe rejected the session.", detail });
  }

  const session = await stripeRes.json() as { id: string; url: string };
  return json(200, { url: session.url, sessionId: session.id });
};
