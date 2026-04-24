export default function ContactPage() {
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
          {/* Contact Form */}
          <div>
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-6">
              {"// TRANSMISSION FORM"}
            </p>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#64748B] text-[10px] font-mono tracking-[0.3em] uppercase mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#0F1F3D] border border-[#C9A84C]/20 px-4 py-3 text-sm font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] text-[10px] font-mono tracking-[0.3em] uppercase mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#0F1F3D] border border-[#C9A84C]/20 px-4 py-3 text-sm font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors"
                    placeholder="Mercer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#64748B] text-[10px] font-mono tracking-[0.3em] uppercase mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full bg-[#0F1F3D] border border-[#C9A84C]/20 px-4 py-3 text-sm font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors"
                  placeholder="you@domain.com"
                />
              </div>

              <div>
                <label className="block text-[#64748B] text-[10px] font-mono tracking-[0.3em] uppercase mb-2">
                  Subject
                </label>
                <select className="w-full bg-[#0F1F3D] border border-[#C9A84C]/20 px-4 py-3 text-sm font-mono text-[#E8EDF5] focus:outline-none focus:border-[#C9A84C] transition-colors appearance-none">
                  <option value="">Select a subject</option>
                  <option value="order">Order / Shipping Inquiry</option>
                  <option value="coa">COA / Lab Results</option>
                  <option value="wholesale">Wholesale / B2B</option>
                  <option value="press">Press / Media</option>
                  <option value="technical">Technical Question</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] text-[10px] font-mono tracking-[0.3em] uppercase mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  className="w-full bg-[#0F1F3D] border border-[#C9A84C]/20 px-4 py-3 text-sm font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors resize-none"
                  placeholder="Your message..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#C9A84C] text-[#0A1628] text-sm font-bold tracking-widest uppercase hover:bg-[#E2C97E] transition-colors"
              >
                Transmit Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-6">
                {"// DIRECT CHANNELS"}
              </p>
              <div className="space-y-4">
                {[
                  {
                    label: "General Inquiries",
                    value: "info@terpforge.com",
                    type: "email",
                  },
                  {
                    label: "Lab & COA Requests",
                    value: "lab@terpforge.com",
                    type: "email",
                  },
                  {
                    label: "Wholesale / B2B",
                    value: "trade@terpforge.com",
                    type: "email",
                  },
                  {
                    label: "Press",
                    value: "press@terpforge.com",
                    type: "email",
                  },
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

            {/* Response SLA */}
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
                  <div
                    key={type}
                    className="flex justify-between"
                  >
                    <span className="text-[#64748B] text-xs font-mono">{type}</span>
                    <span className="text-[#0D9488] text-xs font-mono">≤ {sla}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Registry CTA */}
            <div className="p-6 border border-[#C9A84C]/20 bg-[#0F1F3D] schematic-grid">
              <p className="text-[#C9A84C] text-[10px] font-mono tracking-[0.3em] uppercase mb-3">
                {"// THE REGISTRY"}
              </p>
              <p className="text-[#E8EDF5] text-sm font-bold mb-2">
                Join The Loyalty Protocol
              </p>
              <p className="text-[#64748B] text-xs font-mono leading-relaxed mb-4">
                Early access to product drops, batch COA releases, and exclusive
                member pricing. No spam. No auto-enrollment.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="YOUR EMAIL"
                  className="flex-1 bg-[#0A1628] border border-[#C9A84C]/20 px-3 py-2 text-xs font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
                <button className="px-4 py-2 bg-[#C9A84C] text-[#0A1628] text-[10px] font-bold tracking-widest hover:bg-[#E2C97E] transition-colors whitespace-nowrap">
                  Enlist
                </button>
              </div>
            </div>

            {/* Location */}
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
