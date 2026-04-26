import Link from "next/link";

export default function NotFound() {
  return (
    <div className="hex-mesh molecular-bg noise-overlay scanlines flex min-h-[100svh] items-center justify-center px-4 pt-16">
      <div className="glass-panel relative w-full max-w-3xl overflow-hidden border border-[#C9A84C]/25 px-6 py-12 text-center">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.45em] uppercase">
          {"// OFFLINE TRANSMISSION"}
        </p>
        <h1
          className="mt-4 text-5xl font-black uppercase tracking-tight text-[#E8EDF5] sm:text-6xl"
        >
          404
        </h1>
        <p className="mt-3 text-xl font-black uppercase tracking-[0.2em] text-[#C9A84C]">
          Signal Lost
        </p>
        <p className="mx-auto mt-5 max-w-xl text-sm font-mono leading-relaxed text-[#64748B]">
          The requested transmission does not exist in the current TerpForge
          manifest. Return to a verified route or reopen the command palette.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-[#C9A84C] px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0A1628] transition-colors hover:bg-[#E2C97E]"
          >
            Return to the Forge
          </Link>
          <Link
            href="/lab"
            className="inline-flex items-center justify-center border border-[#0D9488]/45 px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0D9488] transition-colors hover:bg-[#0D9488]/10"
          >
            Open the Lab
          </Link>
        </div>
      </div>
    </div>
  );
}
