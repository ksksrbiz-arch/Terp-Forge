"use client";

import { useState, type FormEvent } from "react";

export default function RegistryForm() {
  const [email, setEmail] = useState("");
  const [enlisted, setEnlisted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setEnlisted(true);
  };

  if (enlisted) {
    return (
      <div className="border border-[#0D9488]/40 bg-[#0D9488]/10 px-4 py-3 max-w-md mx-auto text-center">
        <p className="text-[#0D9488] text-[10px] font-mono tracking-widest uppercase mb-1">
          ✓ ENLISTED
        </p>
        <p className="text-[#E8EDF5] text-xs font-mono break-all">{email}</p>
        <p className="text-[#64748B] text-[10px] font-mono mt-2">
          Confirmation queued. Watch for batch-release transmissions.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
      <input
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="YOUR EMAIL ADDRESS"
        className="flex-1 bg-[#0F1F3D] border border-[#C9A84C]/30 px-4 py-3 text-sm font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-[#C9A84C] text-[#0A1628] text-xs font-bold tracking-widest uppercase hover:bg-[#E2C97E] transition-colors whitespace-nowrap"
      >
        Enlist
      </button>
    </form>
  );
}
