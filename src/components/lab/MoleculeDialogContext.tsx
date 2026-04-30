"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { terpenes } from "@/lib/compounds";
import { MoleculeDialog } from "@/components/lab/MoleculeDialog";

interface MoleculeDialogContextValue {
  openMolecule: (slug: string) => void;
  closeMolecule: () => void;
  activeSlug: string | null;
}

const MoleculeDialogContext = createContext<MoleculeDialogContextValue | null>(
  null,
);

export function MoleculeDialogProvider({ children }: { children: ReactNode }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const openMolecule = useCallback((slug: string) => {
    if (!terpenes.some((t) => t.slug === slug)) return;
    setActiveSlug(slug);
  }, []);

  const closeMolecule = useCallback(() => setActiveSlug(null), []);

  const value = useMemo(
    () => ({ openMolecule, closeMolecule, activeSlug }),
    [openMolecule, closeMolecule, activeSlug],
  );

  return (
    <MoleculeDialogContext.Provider value={value}>
      {children}
      {activeSlug && (
        <MoleculeDialog slug={activeSlug} onClose={closeMolecule} />
      )}
    </MoleculeDialogContext.Provider>
  );
}

export function useOpenMolecule(): MoleculeDialogContextValue {
  const ctx = useContext(MoleculeDialogContext);
  if (!ctx) {
    throw new Error(
      "useOpenMolecule must be used inside <MoleculeDialogProvider>",
    );
  }
  return ctx;
}
