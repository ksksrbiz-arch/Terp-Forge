"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { findProduct } from "@/lib/products";

const STORAGE_KEY = "terpforge.cart.v1";

function sanitizeAnnouncementText(text: string) {
  return text
    .replace(/&/g, " and ")
    .replace(/[<>"]/g, " ")
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface CartLine {
  id: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  // `hydrated` lets UI avoid showing the wrong cart count between
  // initial server-rendered HTML (qty 0) and client localStorage hydration.
  hydrated: boolean;
}

type CartAction =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "setQty"; id: string; qty: number }
  | { type: "clear" };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { lines: action.lines, hydrated: true };
    case "add": {
      const existing = state.lines.find((l) => l.id === action.id);
      const lines = existing
        ? state.lines.map((l) =>
            l.id === action.id ? { ...l, qty: l.qty + action.qty } : l,
          )
        : [...state.lines, { id: action.id, qty: action.qty }];
      return { ...state, lines };
    }
    case "remove":
      return { ...state, lines: state.lines.filter((l) => l.id !== action.id) };
    case "setQty": {
      if (action.qty <= 0) {
        return { ...state, lines: state.lines.filter((l) => l.id !== action.id) };
      }
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.id === action.id ? { ...l, qty: action.qty } : l,
        ),
      };
    }
    case "clear":
      return { ...state, lines: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (id: string, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    lines: [],
    hydrated: false,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // Hydrate from localStorage on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const lines = parsed
            .filter(
              (entry): entry is CartLine =>
                typeof entry === "object" &&
                entry !== null &&
                typeof (entry as CartLine).id === "string" &&
                typeof (entry as CartLine).qty === "number" &&
                (entry as CartLine).qty > 0 &&
                // drop unknown SKUs in case catalog changes
                !!findProduct((entry as CartLine).id),
            )
            .map((entry) => ({ id: entry.id, qty: entry.qty }));
          dispatch({ type: "hydrate", lines });
          return;
        }
      }
    } catch {
      // ignore corrupt storage
    }
    dispatch({ type: "hydrate", lines: [] });
  }, []);

  // Persist on change (only after hydration to avoid wiping storage).
  useEffect(() => {
    if (typeof window === "undefined" || !state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
    } catch {
      /* storage full / disabled — non-fatal */
    }
  }, [state.lines, state.hydrated]);

  useEffect(() => {
    if (!announcement) return;
    const timer = window.setTimeout(() => setAnnouncement(""), 1200);
    return () => window.clearTimeout(timer);
  }, [announcement]);

  const addItem = useCallback((id: string, qty = 1) => {
    const product = findProduct(id);
    if (!product || qty <= 0) return;
    const safeName = sanitizeAnnouncementText(product.name);
    const existingQty = state.lines.find((line) => line.id === id)?.qty ?? 0;
    const nextQty = existingQty + qty;
    dispatch({ type: "add", id, qty });
    setAnnouncement(
      existingQty > 0
        ? `${safeName} quantity updated to ${nextQty}.`
        : `${safeName} added to cart.`,
    );
  }, [state.lines]);
  const removeItem = useCallback((id: string) => {
    dispatch({ type: "remove", id });
    const product = findProduct(id);
    if (product) {
      setAnnouncement(
        `${sanitizeAnnouncementText(product.name)} removed from cart.`,
      );
    }
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    dispatch({ type: "setQty", id, qty });
    const product = findProduct(id);
    if (!product) return;
    const safeName = sanitizeAnnouncementText(product.name);
    setAnnouncement(
      qty <= 0
        ? `${safeName} removed from cart.`
        : `${safeName} quantity updated to ${qty}.`,
    );
  }, []);
  const clear = useCallback(() => {
    dispatch({ type: "clear" });
    setAnnouncement("Cart cleared.");
  }, []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const { itemCount, subtotal } = useMemo(() => {
    let count = 0;
    let total = 0;
    for (const line of state.lines) {
      const product = findProduct(line.id);
      if (!product) continue;
      count += line.qty;
      total += product.price * line.qty;
    }
    return { itemCount: count, subtotal: total };
  }, [state.lines]);

  const value: CartContextValue = {
    lines: state.lines,
    hydrated: state.hydrated,
    itemCount,
    subtotal,
    isOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
    setQty,
    clear,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
