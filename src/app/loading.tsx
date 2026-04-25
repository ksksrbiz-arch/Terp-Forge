export default function Loading() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-[#050E1A] px-4">
      <div className="glass-panel w-full max-w-xl border border-[#C9A84C]/20 px-6 py-8">
        <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.45em] uppercase">
          {"// INITIALIZING TF-SYSTEMS"}
        </p>
        <h2
          className="mt-3 text-3xl font-black uppercase text-[#E8EDF5]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          Boot Sequence Active
        </h2>
        <p className="mt-3 text-sm font-mono leading-relaxed text-[#64748B]">
          Spooling command bus, telemetry overlays, and manifest channels.
        </p>
        <div className="mt-6 h-px bg-[#1E293B]">
          <div className="boot-progress h-full w-full bg-gradient-to-r from-[#0D9488] via-[#C9A84C] to-[#E2C97E]" />
        </div>
      </div>
    </div>
  );
}
