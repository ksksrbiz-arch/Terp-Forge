"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompoundTray } from "@/components/CompoundTrayContext";
import { useOpenMolecule } from "@/components/lab/MoleculeDialogContext";

/**
 * Listens for `tf:action` CustomEvents emitted by the command palette
 * (and any other surface that wants to fire an Action-kind command) and
 * translates them into calls on the tray / dialog contexts.
 *
 * Mounted once near the root layout, inside the providers it depends on.
 */
export function CompoundActionsBridge() {
  const { pin } = useCompoundTray();
  const { openMolecule } = useOpenMolecule();
  const router = useRouter();

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ action: string }>).detail;
      if (!detail?.action) return;
      const [verb, arg] = detail.action.split("/");
      switch (verb) {
        case "pin":
          if (arg) pin(arg);
          break;
        case "open":
          if (arg) openMolecule(arg);
          break;
        case "open-synergy":
          router.push("/lab#synergy");
          break;
      }
    };
    window.addEventListener("tf:action", handler);
    return () => window.removeEventListener("tf:action", handler);
  }, [pin, openMolecule, router]);

  return null;
}
