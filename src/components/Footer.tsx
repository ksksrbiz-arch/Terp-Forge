import Link from "next/link";
import RegistryForm from "./RegistryForm";

const footerLinks = {
  Shop: [
    { href: "/shop#apparel", label: "Apparel" },
    { href: "/shop#hardware", label: "Hardware" },
    { href: "/shop#wellness", label: "CBD Wellness" },
  ],
  "The Lab": [
    { href: "/lab#science", label: "Terpene Science" },
    { href: "/lab#profiles", label: "Terpene Profiles" },
    { href: "/lab#coa", label: "COA Portal" },
  ],
  Company: [
    { href: "/story", label: "Our Story" },
    { href: "/contact", label: "Contact" },
    { href: "/lab#coa", label: "Lab Reports" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#050E1A] border-t border-[#C9A84C]/20 mt-auto">
      {/* Registry CTA */}
      <div className="border-b border-[#C9A84C]/20 py-12 schematic-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-xs font-mono text-[#0D9488] tracking-[0.3em] uppercase mb-3"
          >
            {"// ACCESS: THE REGISTRY"}
          </p>
          <h2
            className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-[#E8EDF5] mb-3"
          >
            Join the Loyalty Protocol
          </h2>
          <p className="text-[#64748B] text-sm max-w-md mx-auto mb-6 font-mono">
            Gain early access to product drops, batch COA releases, and
            exclusive member pricing.
          </p>
          <RegistryForm />
        </div>
      </div>

      {/* Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 border border-[#C9A84C] flex items-center justify-center">
                <span className="text-[#C9A84C] text-xs font-bold font-mono">TF</span>
              </div>
              <span className="text-lg font-black tracking-widest uppercase text-[#E8EDF5]">
                TerpForge
              </span>
            </div>
            <p className="text-[#64748B] text-xs font-mono leading-relaxed">
              Engineered aromatics. Forged wellness. The intersection of
              molecular terpene precision and industrial-grade craftsmanship.
            </p>
            <div className="mt-6 flex gap-3">
              {["IG", "X", "YT"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] text-xs font-mono hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-[#C9A84C] mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      prefetch={false}
                      className="text-sm text-[#64748B] hover:text-[#E8EDF5] transition-colors font-mono"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1E293B] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-[#64748B] text-xs font-mono">
            © 2025 TerpForge™ — All specifications subject to batch variance.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-[#64748B] text-xs font-mono hover:text-[#C9A84C] transition-colors">
              Privacy
            </a>
            <a href="#" className="text-[#64748B] text-xs font-mono hover:text-[#C9A84C] transition-colors">
              Terms
            </a>
            <a href="#" className="text-[#64748B] text-xs font-mono hover:text-[#C9A84C] transition-colors">
              Lab Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
