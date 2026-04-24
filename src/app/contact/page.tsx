"use client";

import { useState, type FormEvent } from "react";

type Stage = "idle" | "transmitting" | "sent";

const SUBJECTS = [
  { value: "", label: "Select a subject" },
  { value: "order", label: "Order / Shipping Inquiry" },
  { value: "coa", label: "COA / Lab Results" },
  { value: "wholesale", label: "Wholesale / B2B" },
  { value: "press", label: "Press / Media" },
  { value: "technical", label: "Technical Question" },
  { value: "other", label: "Other" },
];

export default function ContactPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [registry, setRegistry] = useState<{
    email: string;
    enlisted: boolean;
  }>({ email: "", enlisted: false });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (stage !== "idle") return;
    setStage("transmitting");
    window.setTimeout(() => {
      setStage("sent");
    }, 1200);
  };

  const handleEnlist = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!registry.email) return;
    setRegistry((prev) => ({ ...prev, enlisted: true }));
  };

  const reset = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    });
    setStage("idle");
  };

  const update =
    <K extends keyof typeof form>(key: K) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { value } = e.target;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="bg-[#0F1F3D] border-b border-[#C9A84C]/20 py-16 schematic-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
            {"// OPEN CHANNEL"}
          </p>
          <h1
            className="text-5xl sm:text-6xl font-black tracking-tight uppercase text-[#E8EDF5] mb-4"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Contact
          </h1>
          <p className="text-[#64748B] font-mono text-sm max-w-xl leading-relaxed">
            Direct line to the TerpForge team. No automated responses, no
            bots. Messages are reviewed by a human within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <div>
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-6">
              {"// TRANSMISSION FORM"}
            </p>

            {stage === "sent" ? (
              <div className="border border-[#0D9488]/40 bg-[#0D9488]/5 p-8 text-center">
                <div className="w-14 h-14 border-2 border-[#0D9488] mx-auto flex items-center justify-center mb-5 text-[#0D9488] text-xl">
                  ✓
                </div>
                <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.4em] uppercase mb-3">
                  {"// TRANSMISSION RECEIVED"}
                </p>
                <h2
                  className="text-2xl font-black tracking-widest uppercase text-[#E8EDF5] mb-3"
                  style={{ fontFamily: "var(--font-montserrat)" }}
                >
                  Message Encrypted & Sent
                </h2>
                <p className="text-[#64748B] text-sm font-mono leading-relaxed mb-6 max-w-md mx-auto">
                  A confirmation has been dispatched to{" "}
                  <span className="text-[#C9A84C]">
                    {form.email || "your inbox"}
                  </span>
                  . A human will respond within the SLA shown to the right.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="px-6 py-3 border border-[#C9A84C] text-[#C9A84C] text-xs font-bold tracking-widest uppercase hover:bg-[#C9A84C]/10 transition-colors"
                >
                  Send Another Transmission
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className={`space-y-4 transition-opacity ${
                  stage === "transmitting" ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name" required>
                    <input
                      type="text"
                      required
                      autoComplete="given-name"
                      value={form.firstName}
                      onChange={update("firstName")}
                      placeholder="John"
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Last Name" required>
                    <input
                      type="text"
                      required
                      autoComplete="family-name"
                      value={form.lastName}
                      onChange={update("lastName")}
                      placeholder="Mercer"
                      className={fieldClass}
                    />
                  </Field>
                </div>

                <Field label="Email Address" required>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@domain.com"
                    className={fieldClass}
                  />
                </Field>

                <Field label="Subject" required>
                  <select
                    required
                    value={form.subject}
                    onChange={update("subject")}
                    className={fieldClass + " appearance-none"}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Message" required>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={update("message")}
                    placeholder="Your message..."
                    className={fieldClass + " resize-none"}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={stage === "transmitting"}
                  className="w-full py-4 bg-[#C9A84C] text-[#0A1628] text-sm font-bold tracking-widest uppercase hover:bg-[#E2C97E] transition-colors disabled:opacity-60"
                >
                  {stage === "transmitting"
                    ? "ENCRYPTING TRANSMISSION..."
                    : "TRANSMIT MESSAGE"}
                </button>

                <p className="text-[#64748B] text-[10px] font-mono text-center">
                  Demo channel · Production wires this form to{" "}
                  <span className="text-[#0D9488]">team@terpforge.com</span> via
                  Cloudflare Workers / Resend / Postmark.
                </p>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div>
              <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-6">
                {"// DIRECT CHANNELS"}
              </p>
              <div className="space-y-4">
                {[
                  { label: "General Inquiries", value: "info@terpforge.com" },
                  { label: "Lab & COA Requests", value: "lab@terpforge.com" },
                  { label: "Wholesale / B2B", value: "trade@terpforge.com" },
                  { label: "Press", value: "press@terpforge.com" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center p-4 border border-[#1E293B] hover:border-[#C9A84C]/30 transition-colors"
                  >
                    <p className="text-[#64748B] text-xs font-mono tracking-wider uppercase">
                      {label}
                    </p>
                    <a
                      href={`mailto:${value}`}
                      className="text-[#C9A84C] text-xs font-mono hover:text-[#E2C97E] transition-colors"
                    >
                      {value}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border border-[#0D9488]/30 bg-[#0D9488]/5">
              <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.3em] uppercase mb-3">
                RESPONSE PROTOCOL
              </p>
              <div className="space-y-2">
                {[
                  { type: "General", sla: "24 hours" },
                  { type: "COA / Lab", sla: "12 hours" },
                  { type: "Order Issues", sla: "4 hours" },
                  { type: "B2B / Wholesale", sla: "48 hours" },
                ].map(({ type, sla }) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-[#64748B] text-xs font-mono">
                      {type}
                    </span>
                    <span className="text-[#0D9488] text-xs font-mono">
                      ≤ {sla}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border border-[#C9A84C]/20 bg-[#0F1F3D] schematic-grid">
              <p className="text-[#C9A84C] text-[10px] font-mono tracking-[0.3em] uppercase mb-3">
                {"// THE REGISTRY"}
              </p>
              <p className="text-[#E8EDF5] text-sm font-bold mb-2">
                Join The Loyalty Protocol
              </p>
              <p className="text-[#64748B] text-xs font-mono leading-relaxed mb-4">
                Early access to product drops, batch COA releases, and
                exclusive member pricing. No spam. No auto-enrollment.
              </p>
              {registry.enlisted ? (
                <div className="border border-[#0D9488]/40 bg-[#0D9488]/10 p-3 text-center">
                  <p className="text-[#0D9488] text-[10px] font-mono tracking-widest uppercase mb-1">
                    ✓ ENLISTED
                  </p>
                  <p className="text-[#E8EDF5] text-xs font-mono break-all">
                    {registry.email}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnlist} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="YOUR EMAIL"
                    value={registry.email}
                    onChange={(e) =>
                      setRegistry({ email: e.target.value, enlisted: false })
                    }
                    className="flex-1 bg-[#0A1628] border border-[#C9A84C]/20 px-3 py-2 text-xs font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#C9A84C] text-[#0A1628] text-[10px] font-bold tracking-widest hover:bg-[#E2C97E] transition-colors whitespace-nowrap"
                  >
                    Enlist
                  </button>
                </form>
              )}
            </div>

            <div className="p-6 border border-[#1E293B] bg-[#0F1F3D]">
              <p className="text-[#64748B] text-[10px] font-mono tracking-[0.3em] uppercase mb-3">
                OPERATIONS
              </p>
              <p className="text-[#E8EDF5] text-sm font-mono mb-1">
                TerpForge LLC
              </p>
              <p className="text-[#64748B] text-xs font-mono">
                Industrial District · Pacific Northwest · USA
              </p>
              <p className="text-[#C9A84C] text-[10px] font-mono mt-3 tracking-widest">
                SHIPPING: Domestic & International
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const fieldClass =
  "w-full bg-[#0F1F3D] border border-[#C9A84C]/20 px-4 py-3 text-sm font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[#64748B] text-[10px] font-mono tracking-[0.3em] uppercase mb-2">
        {label}
        {required && <span className="text-[#C9A84C]"> *</span>}
      </span>
      {children}
    </label>
  );
}
