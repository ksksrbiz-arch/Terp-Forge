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
import { terpenes } from "@/lib/compounds";

const STORAGE_KEY = "terpforge.tray.v1";
export const TRAY_MAX = 4;

interface TrayState {
  pinned: string[];
  hydrated: boolean;
}

type TrayAction =
  | { type: "hydrate"; pinned: string[] }
  | { type: "pin"; slug: string }
  | { type: "unpin"; slug: string }
  | { type: "clear" };

function reducer(state: TrayState, action: TrayAction): TrayState {
  switch (action.type) {
    case "hydrate":
      return { pinned: action.pinned, hydrated: true };
    case "pin": {
      if (state.pinned.includes(action.slug)) return state;
      const next = [...state.pinned, action.slug].slice(0, TRAY_MAX);
      return { ...state, pinned: next };
    }
    case "unpin":
      return {
        ...state,
        pinned: state.pinned.filter((s) => s !== action.slug),
      };
    case "clear":
      return { ...state, pinned: [] };
    default:
      return state;
  }
}

interface CompoundTrayContextValue {
  pinned: string[];
  hydrated: boolean;
  isOpen: boolean;
  isFull: boolean;
  pulse: boolean;
  pin: (slug: string) => void;
  unpin: (slug: string) => void;
  toggle: (slug: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggleOpen: () => void;
}

const CompoundTrayContext = createContext<CompoundTrayContextValue | null>(
  null,
);

export function CompoundTrayProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    pinned: [],
    hydrated: false,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const known = new Set(terpenes.map((t) => t.slug));
          const pinned = parsed
            .filter((s): s is string => typeof s === "string" && known.has(s))
            .slice(0, TRAY_MAX);
          dispatch({ type: "hydrate", pinned });
          return;
        }
      }
    } catch {
      // ignore corrupt storage
    }
    dispatch({ type: "hydrate", pinned: [] });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.pinned));
    } catch {
      /* non-fatal */
    }
  }, [state.pinned, state.hydrated]);

  // Drop the pulse flag after the keyframe finishes.
  useEffect(() => {
    if (!pulse) return;
    const t = window.setTimeout(() => setPulse(false), 900);
    return () => window.clearTimeout(t);
  }, [pulse]);

  const pin = useCallback((slug: string) => {
    dispatch({ type: "pin", slug });
    setPulse(true);
  }, []);
  const unpin = useCallback((slug: string) => {
    dispatch({ type: "unpin", slug });
  }, []);
  const toggle = useCallback(
    (slug: string) => {
      if (state.pinned.includes(slug)) {
        dispatch({ type: "unpin", slug });
      } else {
        dispatch({ type: "pin", slug });
        setPulse(true);
      }
    },
    [state.pinned],
  );
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggleOpen = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo<CompoundTrayContextValue>(
    () => ({
      pinned: state.pinned,
      hydrated: state.hydrated,
      isOpen,
      isFull: state.pinned.length >= TRAY_MAX,
      pulse,
      pin,
      unpin,
      toggle,
      clear,
      open,
      close,
      toggleOpen,
    }),
    [
      state.pinned,
      state.hydrated,
      isOpen,
      pulse,
      pin,
      unpin,
      toggle,
      clear,
      open,
      close,
      toggleOpen,
    ],
  );

  return (
    <CompoundTrayContext.Provider value={value}>
      {children}
    </CompoundTrayContext.Provider>
  );
}

export function useCompoundTray(): CompoundTrayContextValue {
  const ctx = useContext(CompoundTrayContext);
  if (!ctx) {
    throw new Error("useCompoundTray must be used inside <CompoundTrayProvider>");
  }
  return ctx;
}
