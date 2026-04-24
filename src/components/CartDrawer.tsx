"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { findProduct, formatPrice } from "@/lib/products";

type CheckoutStage = "cart" | "form" | "processing" | "success";

interface CheckoutFields {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

const EMPTY_FORM: CheckoutFields = {
  name: "",
  email: "",
  address: "",
  city: "",
  zip: "",
  country: "United States",
};

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TF-${ts}-${rand}`;
}

export default function CartDrawer() {
  const { isOpen, closeCart, lines, subtotal, removeItem, setQty, clear } =
    useCart();
  const [stage, setStage] = useState<CheckoutStage>("cart");
  const [form, setForm] = useState<CheckoutFields>(EMPTY_FORM);
  const [orderId, setOrderId] = useState<string>("");

  // Lock body scroll while drawer is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeCart]);

  const handlePlaceOrder = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStage("processing");
    // Simulate fulfillment handoff (Stripe / Printful / Shippo).
    window.setTimeout(() => {
      const id = generateOrderId();
      setOrderId(id);
      clear();
      setStage("success");
    }, 1400);
  };

  const handleClose = () => {
    closeCart();
    // After close-out animation, reset transient stages (form/success) so
    // the next open lands on the cart list.
    window.setTimeout(() => {
      setStage("cart");
      if (stage === "success") {
        setForm(EMPTY_FORM);
        setOrderId("");
      }
    }, 300);
  };

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close cart"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        tabIndex={isOpen ? 0 : -1}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Forge cart"
        className={`absolute top-0 right-0 h-full w-full sm:w-[420px] bg-[#0A1628] border-l border-[#C9A84C]/30 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#C9A84C]/20">
          <div>
            <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.4em] uppercase">
              {"// THE FORGE"}
            </p>
            <h2
              className="text-xl font-black tracking-widest uppercase text-[#E8EDF5]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Your Cart
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close cart"
            className="w-9 h-9 border border-[#C9A84C]/30 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {stage === "cart" && (
            <CartView
              lines={lines}
              setQty={setQty}
              removeItem={removeItem}
              onClose={handleClose}
            />
          )}

          {stage === "form" && (
            <CheckoutForm
              form={form}
              setForm={setForm}
              onSubmit={handlePlaceOrder}
              onBack={() => setStage("cart")}
            />
          )}

          {stage === "processing" && <ProcessingView />}

          {stage === "success" && (
            <SuccessView
              orderId={orderId}
              email={form.email}
              onClose={handleClose}
            />
          )}
        </div>

        {/* Footer (only on cart + form views) */}
        {(stage === "cart" || stage === "form") && lines.length > 0 && (
          <div className="border-t border-[#C9A84C]/20 px-6 py-5 bg-[#0F1F3D]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#64748B] text-xs font-mono tracking-widest uppercase">
                Subtotal
              </span>
              <span className="text-[#C9A84C] text-2xl font-black font-mono">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-[#64748B] text-[10px] font-mono mb-4">
              Shipping & taxes calculated at fulfillment.
            </p>
            {stage === "cart" ? (
              <button
                type="button"
                onClick={() => setStage("form")}
                className="w-full py-4 bg-[#C9A84C] text-[#0A1628] text-sm font-bold tracking-widest uppercase hover:bg-[#E2C97E] transition-colors"
              >
                Proceed to Checkout →
              </button>
            ) : (
              <p className="text-[#0D9488] text-[10px] font-mono tracking-widest text-center">
                {"// SECURE CHANNEL · ENCRYPTED HANDOFF"}
              </p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-views

function CartView({
  lines,
  setQty,
  removeItem,
  onClose,
}: {
  lines: { id: string; qty: number }[];
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  onClose: () => void;
}) {
  if (lines.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <div className="w-16 h-16 border border-[#C9A84C]/30 mx-auto flex items-center justify-center mb-6">
          <span className="text-[#C9A84C]/60 text-2xl">⬡</span>
        </div>
        <p className="text-[#E8EDF5] font-bold mb-2 tracking-widest uppercase text-sm">
          The Forge is empty
        </p>
        <p className="text-[#64748B] text-xs font-mono mb-6">
          Add product systems from The Inventory.
        </p>
        <Link
          href="/shop"
          onClick={onClose}
          className="inline-flex items-center justify-center px-6 py-3 bg-[#C9A84C] text-[#0A1628] text-xs font-bold tracking-widest uppercase hover:bg-[#E2C97E] transition-colors"
        >
          Enter The Inventory →
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#1E293B]">
      {lines.map((line) => {
        const product = findProduct(line.id);
        if (!product) return null;
        return (
          <li
            key={line.id}
            className="px-6 py-5 flex gap-4 hover:bg-[#0F1F3D]/50 transition-colors"
          >
            <div className="w-16 h-16 shrink-0 border border-[#C9A84C]/30 bg-[#0F1F3D] flex items-center justify-center">
              <span className="text-[#C9A84C]/60 text-xl">{product.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#0D9488] text-[9px] font-mono tracking-[0.3em] uppercase mb-1">
                {product.categoryLabel}
              </p>
              <p className="text-[#E8EDF5] font-bold text-sm leading-tight mb-2 truncate">
                {product.name}
              </p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center border border-[#C9A84C]/30">
                  <button
                    type="button"
                    onClick={() => setQty(line.id, line.qty - 1)}
                    aria-label={`Decrease quantity of ${product.name}`}
                    className="w-7 h-7 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors text-sm"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-[#E8EDF5] font-mono text-xs">
                    {line.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(line.id, line.qty + 1)}
                    aria-label={`Increase quantity of ${product.name}`}
                    className="w-7 h-7 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
                <span className="text-[#C9A84C] font-mono font-black text-sm">
                  {formatPrice(product.price * line.qty)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeItem(line.id)}
              aria-label={`Remove ${product.name}`}
              className="self-start text-[#64748B] hover:text-[#C9A84C] transition-colors text-xs font-mono tracking-widest"
            >
              REMOVE
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function CheckoutForm({
  form,
  setForm,
  onSubmit,
  onBack,
}: {
  form: CheckoutFields;
  setForm: (updater: (prev: CheckoutFields) => CheckoutFields) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}) {
  const update =
    <K extends keyof CheckoutFields>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  return (
    <form onSubmit={onSubmit} className="px-6 py-6 space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-[#0D9488] text-[10px] font-mono tracking-widest uppercase hover:text-[#14B8A6] transition-colors"
      >
        ← Back to Cart
      </button>

      <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.4em] uppercase">
        {"// FULFILLMENT MANIFEST"}
      </p>

      <Field label="Full Name" required>
        <input
          type="text"
          required
          autoComplete="name"
          value={form.name}
          onChange={update("name")}
          className="w-full bg-[#0F1F3D] border border-[#C9A84C]/20 px-3 py-2 text-sm font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors"
          placeholder="John Mercer"
        />
      </Field>

      <Field label="Email" required>
        <input
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={update("email")}
          className="w-full bg-[#0F1F3D] border border-[#C9A84C]/20 px-3 py-2 text-sm font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors"
          placeholder="you@domain.com"
        />
      </Field>

      <Field label="Shipping Address" required>
        <input
          type="text"
          required
          autoComplete="street-address"
          value={form.address}
          onChange={update("address")}
          className="w-full bg-[#0F1F3D] border border-[#C9A84C]/20 px-3 py-2 text-sm font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors"
          placeholder="123 Industrial Way"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="City" required>
          <input
            type="text"
            required
            autoComplete="address-level2"
            value={form.city}
            onChange={update("city")}
            className="w-full bg-[#0F1F3D] border border-[#C9A84C]/20 px-3 py-2 text-sm font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
        </Field>
        <Field label="Postal Code" required>
          <input
            type="text"
            required
            autoComplete="postal-code"
            value={form.zip}
            onChange={update("zip")}
            className="w-full bg-[#0F1F3D] border border-[#C9A84C]/20 px-3 py-2 text-sm font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
        </Field>
      </div>

      <Field label="Country" required>
        <input
          type="text"
          required
          autoComplete="country-name"
          value={form.country}
          onChange={update("country")}
          className="w-full bg-[#0F1F3D] border border-[#C9A84C]/20 px-3 py-2 text-sm font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors"
        />
      </Field>

      <button
        type="submit"
        className="w-full py-4 bg-[#C9A84C] text-[#0A1628] text-sm font-bold tracking-widest uppercase hover:bg-[#E2C97E] transition-colors"
      >
        Place Order
      </button>
      <p className="text-[#64748B] text-[10px] font-mono text-center">
        Demo checkout · No card data collected · Production swaps in Stripe /
        Printful / Shippo
      </p>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[#64748B] text-[10px] font-mono tracking-[0.3em] uppercase mb-1">
        {label}
        {required && <span className="text-[#C9A84C]"> *</span>}
      </span>
      {children}
    </label>
  );
}

function ProcessingView() {
  return (
    <div className="px-6 py-20 text-center">
      <div className="w-16 h-16 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full mx-auto mb-6 animate-spin" />
      <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-2">
        {"// PROCESSING"}
      </p>
      <p className="text-[#E8EDF5] font-bold tracking-widest uppercase text-sm">
        Forging Your Order
      </p>
      <p className="text-[#64748B] text-xs font-mono mt-2">
        Encrypting handoff to fulfillment...
      </p>
    </div>
  );
}

function SuccessView({
  orderId,
  email,
  onClose,
}: {
  orderId: string;
  email: string;
  onClose: () => void;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="w-16 h-16 border-2 border-[#0D9488] mx-auto flex items-center justify-center mb-6 text-[#0D9488] text-2xl">
        ✓
      </div>
      <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.4em] uppercase mb-3">
        {"// ORDER FORGED"}
      </p>
      <h3
        className="text-2xl font-black tracking-widest uppercase text-[#E8EDF5] mb-4"
        style={{ fontFamily: "var(--font-montserrat)" }}
      >
        Transmission Received
      </h3>
      <div className="border border-[#C9A84C]/30 bg-[#0F1F3D] p-4 mb-6 text-left space-y-2">
        <div className="flex justify-between">
          <span className="text-[#64748B] text-[10px] font-mono tracking-widest uppercase">
            Order ID
          </span>
          <span className="text-[#C9A84C] text-xs font-mono font-bold">
            {orderId}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#64748B] text-[10px] font-mono tracking-widest uppercase">
            Confirmation
          </span>
          <span className="text-[#E8EDF5] text-xs font-mono truncate ml-2">
            {email}
          </span>
        </div>
      </div>
      <p className="text-[#64748B] text-xs font-mono leading-relaxed mb-8">
        A confirmation has been dispatched to your inbox. Tracking telemetry
        will be transmitted within 24 hours of fulfillment.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="w-full py-3 border border-[#C9A84C] text-[#C9A84C] text-xs font-bold tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#0A1628] transition-colors"
      >
        Continue Browsing
      </button>
    </div>
  );
}

// (no local aliases — ReactNode is imported at top of file.)
