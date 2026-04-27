import type { ReactNode } from "react";
import CornerBrackets from "./CornerBrackets";

interface SectionProps {
  children: ReactNode;
  /** Optional id for deep-linking */
  id?: string;
  /** Eyebrow label (rendered as `// EYEBROW`) */
  eyebrow?: string;
  /** Section title */
  title?: string;
  /** Optional supporting copy under the title */
  intro?: ReactNode;
  /** Section index, e.g. { current: 3, total: 7 } → renders "§ 03 / 07" */
  index?: { current: number; total: number };
  /** Background flavor */
  variant?: "navy" | "navy-light" | "blueprint" | "hex" | "transparent";
  /** Header alignment. Defaults to `center`. */
  align?: "center" | "left";
  /** Optional right-aligned slot in the header (e.g. a "view all" link) */
  headerEnd?: ReactNode;
  /** Disable the angled clip-path divider on the top edge */
  flatTop?: boolean;
  /** Disable corner brackets */
  noBrackets?: boolean;
  /** Vertical padding override */
  padding?: "default" | "tight" | "loose";
  className?: string;
}

const variantClass: Record<NonNullable<SectionProps["variant"]>, string> = {
  navy: "bg-[#0A1628]",
  "navy-light": "bg-[#0F1F3D]",
  blueprint: "blueprint-grid",
  hex: "hex-mesh",
  transparent: "",
};

const paddingClass: Record<NonNullable<SectionProps["padding"]>, string> = {
  default: "py-24",
  tight: "py-16",
  loose: "py-32",
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Reusable Section primitive.
 * - Top edge: subtle gold rule + optional angled clip ornament
 * - Header block: eyebrow / title / intro / index / headerEnd
 * - Outer corner brackets for the schematic feel
 * - Designed to look right whether `align="center"` or `align="left"`
 */
export default function Section({
  children,
  id,
  eyebrow,
  title,
  intro,
  index,
  variant = "navy",
  align = "center",
  headerEnd,
  flatTop = false,
  noBrackets = false,
  padding = "default",
  className = "",
}: SectionProps) {
  const hasHeader = Boolean(eyebrow || title || intro || headerEnd || index);
  return (
    <section
      id={id}
      className={`relative border-t border-[#C9A84C]/20 ${variantClass[variant]} ${paddingClass[padding]} ${className}`.trim()}
    >
      {!flatTop && (
        <span
          aria-hidden
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(201,168,76,0.45), rgba(13,148,136,0.45), rgba(201,168,76,0.45), transparent)",
          }}
        />
      )}

      {!noBrackets && (
        <span aria-hidden className="absolute inset-x-0 top-0 h-full pointer-events-none">
          <CornerBrackets size={16} color="rgba(201,168,76,0.35)" inset={8} />
        </span>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {hasHeader && (
          <div
            className={`mb-12 flex flex-col gap-4 ${
              align === "center"
                ? "items-center text-center"
                : "sm:flex-row sm:items-end sm:justify-between text-left"
            }`}
          >
            <div className={align === "center" ? "max-w-2xl" : ""}>
              {(eyebrow || index) && (
                <div
                  className={`flex items-center gap-3 mb-3 ${
                    align === "center" ? "justify-center" : "justify-start"
                  }`}
                >
                  {eyebrow && (
                    <p className="scanlines-tight relative inline-block text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase px-2 py-1">
                      <span className="relative z-[2]">{`// ${eyebrow}`}</span>
                    </p>
                  )}
                  {index && (
                    <span className="text-[#C9A84C]/60 text-[10px] font-mono tracking-[0.3em]">
                      § {pad(index.current)} / {pad(index.total)}
                    </span>
                  )}
                </div>
              )}
              {title && (
                <h2
                  className="text-4xl sm:text-5xl font-black tracking-tight uppercase text-[#E8EDF5] mb-4"
                >
                  {title}
                </h2>
              )}
              {intro && (
                <div className="text-[#94A3B8] font-mono text-sm leading-relaxed max-w-xl">
                  {intro}
                </div>
              )}
            </div>
            {headerEnd && <div className="shrink-0">{headerEnd}</div>}
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
