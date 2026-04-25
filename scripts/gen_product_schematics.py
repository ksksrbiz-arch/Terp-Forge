#!/usr/bin/env python3
"""
TerpForge product schematic generator.

Produces 12 on-brand SVG blueprints, one per SKU. The visual language is
borrowed directly from the existing site:
- Navy (#0A1628) background with a faint blueprint grid
- Gold (#C9A84C) primary linework + corner registration brackets
- Teal (#0D9488) secondary annotation strokes
- Profile accent color (FOCUS gold / RECOVERY teal / CALM blue) when applicable
- Mono-style technical typography
- Schematic-style dimension lines, callouts, formula tags

Each SVG is saved to public/images/products/{sku-id}.svg and can be swapped
for real photography later by replacing the file at the same path.
"""

import os
import re
import textwrap

OUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "public", "images", "products",
)
os.makedirs(OUT_DIR, exist_ok=True)

NAVY = "#0A1628"
NAVY_LIGHT = "#0F1F3D"
TEAL = "#0D9488"
GOLD = "#C9A84C"
GOLD_LIGHT = "#E2C97E"
SLATE = "#64748B"
OFFWHITE = "#E8EDF5"

PROFILE_COLORS = {
    "FOCUS": GOLD,
    "RECOVERY": TEAL,
    "CALM": "#2563EB",
    None: GOLD,
}

W, H = 800, 600


def frame(content_svg: str, sku: str, label: str, spec: str, profile: str | None,
          icon: str, badge: str | None) -> str:
    """Wrap a per-product silhouette in the shared blueprint chrome."""
    accent = PROFILE_COLORS.get(profile, GOLD)
    badge_block = ""
    if badge:
        badge_block = f"""
  <g transform="translate(640, 36)">
    <rect width="124" height="22" fill="{GOLD}" />
    <text x="62" y="15" text-anchor="middle"
          font-family="ui-monospace, 'SF Mono', monospace"
          font-size="10" font-weight="700" letter-spacing="1.6"
          fill="{NAVY}">{badge}</text>
  </g>"""

    profile_chip = ""
    if profile:
        profile_chip = f"""
  <g transform="translate(36, 540)">
    <rect width="86" height="20" fill="none" stroke="{accent}" stroke-opacity="0.5" />
    <text x="43" y="14" text-anchor="middle"
          font-family="ui-monospace, 'SF Mono', monospace"
          font-size="10" font-weight="700" letter-spacing="2"
          fill="{accent}">{profile}</text>
  </g>"""

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"
     role="img" aria-label="{label} — TerpForge technical schematic"
     preserveAspectRatio="xMidYMid slice">
  <!-- BACKGROUND -->
  <rect width="{W}" height="{H}" fill="{NAVY}" />
  <defs>
    <pattern id="grid-{sku}" x="0" y="0" width="40" height="40"
             patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none"
            stroke="{TEAL}" stroke-opacity="0.08" stroke-width="1" />
    </pattern>
    <radialGradient id="vignette-{sku}" cx="50%" cy="42%" r="65%">
      <stop offset="0%" stop-color="{NAVY_LIGHT}" stop-opacity="0.6" />
      <stop offset="100%" stop-color="{NAVY}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="accent-{sku}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="{accent}" stop-opacity="0.95" />
      <stop offset="100%" stop-color="{accent}" stop-opacity="0.55" />
    </linearGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#grid-{sku})" />
  <rect width="{W}" height="{H}" fill="url(#vignette-{sku})" />

  <!-- CORNER REGISTRATION BRACKETS -->
  <g stroke="{GOLD}" stroke-width="2" fill="none">
    <path d="M 24 24 L 24 56 M 24 24 L 56 24" />
    <path d="M 776 24 L 776 56 M 776 24 L 744 24" />
    <path d="M 24 576 L 24 544 M 24 576 L 56 576" />
    <path d="M 776 576 L 776 544 M 776 576 L 744 576" />
  </g>

  <!-- HEADER STRIP -->
  <g font-family="ui-monospace, 'SF Mono', monospace" letter-spacing="2">
    <text x="36" y="50" font-size="10" font-weight="700" fill="{GOLD}">
      TF-SCHEMATIC // {sku.upper()}
    </text>
    <text x="36" y="68" font-size="10" fill="{SLATE}">
      {spec[:78]}
    </text>
  </g>{badge_block}

  <!-- ICON STAMP -->
  <g transform="translate(36, 90)">
    <rect width="36" height="36" fill="none" stroke="{GOLD}" stroke-opacity="0.4" />
    <text x="18" y="26" text-anchor="middle" font-size="20" fill="{GOLD}">{icon}</text>
  </g>

  <!-- PRODUCT SILHOUETTE -->
  {content_svg}

  <!-- FOOTER STRIP -->
  <g font-family="ui-monospace, 'SF Mono', monospace" letter-spacing="2">
    <text x="36" y="514" font-size="9" fill="{SLATE}">
      ENGINEERED // FORGED // VERIFIED
    </text>
  </g>{profile_chip}

  <!-- TF MONOGRAM -->
  <g transform="translate(710, 530)">
    <rect width="54" height="36" fill="none" stroke="{GOLD}" stroke-opacity="0.6" />
    <text x="27" y="24" text-anchor="middle"
          font-family="'Helvetica Neue', Arial, sans-serif"
          font-size="14" font-weight="800" letter-spacing="3"
          fill="{GOLD}">TF</text>
  </g>

  <!-- DIM LINE TICKERS -->
  <g stroke="{TEAL}" stroke-opacity="0.35" stroke-width="1">
    <line x1="36" y1="140" x2="36" y2="490" />
    <line x1="32" y1="140" x2="40" y2="140" />
    <line x1="32" y1="315" x2="40" y2="315" />
    <line x1="32" y1="490" x2="40" y2="490" />
    <line x1="764" y1="140" x2="764" y2="490" />
    <line x1="760" y1="140" x2="768" y2="140" />
    <line x1="760" y1="315" x2="768" y2="315" />
    <line x1="760" y1="490" x2="768" y2="490" />
  </g>
</svg>
"""


# ─── APPAREL SILHOUETTES ───────────────────────────────────────────────────────

def hoodie_silhouette(accent: str, foil: bool = True, stealth: bool = False,
                      molecule_label: str = "MYRCENE C₁₀H₁₆") -> str:
    """A heavyweight hoodie schematic with molecular schematic across back panel."""
    body_stroke = GOLD if not stealth else "#3a4d68"
    print_color = GOLD if foil and not stealth else accent
    return f"""
  <g transform="translate(220, 130)" stroke="{body_stroke}" stroke-width="2.2"
     fill="none" stroke-linejoin="round" stroke-linecap="round">
    <!-- HOOD -->
    <path d="M 130 0 Q 180 -10 230 0 L 244 70 Q 180 56 116 70 Z" />
    <!-- BODY -->
    <path d="M 60 80 L 116 70 L 130 110 L 230 110 L 244 70 L 300 80
             L 320 220 L 290 230 L 290 360 L 70 360 L 70 230 L 40 220 Z" />
    <!-- KANGAROO POCKET -->
    <path d="M 110 220 L 130 200 L 230 200 L 250 220 L 240 260 L 120 260 Z" />
    <!-- SLEEVE CUFFS -->
    <path d="M 290 230 L 320 220 L 330 360 L 310 360 Z" />
    <path d="M 70 230 L 40 220 L 30 360 L 50 360 Z" />
    <!-- DRAW STRINGS -->
    <line x1="170" y1="62" x2="166" y2="98" stroke="{GOLD_LIGHT}" stroke-width="1.4" />
    <line x1="190" y1="62" x2="194" y2="98" stroke="{GOLD_LIGHT}" stroke-width="1.4" />
  </g>

  <!-- MOLECULAR PRINT (back panel) -->
  <g transform="translate(310, 250)" stroke="{print_color}" stroke-width="1.8"
     fill="none" stroke-opacity="0.95">
    <circle cx="0" cy="0" r="6" fill="{print_color}" />
    <circle cx="44" cy="-20" r="5" fill="{print_color}" />
    <circle cx="86" cy="0" r="6" fill="{print_color}" />
    <circle cx="86" cy="44" r="5" fill="{print_color}" />
    <circle cx="44" cy="64" r="6" fill="{print_color}" />
    <circle cx="0" cy="44" r="5" fill="{print_color}" />
    <circle cx="-40" cy="22" r="5" fill="{print_color}" />
    <circle cx="130" cy="22" r="5" fill="{print_color}" />
    <line x1="0" y1="0" x2="44" y2="-20" />
    <line x1="44" y1="-20" x2="86" y2="0" />
    <line x1="86" y1="0" x2="86" y2="44" />
    <line x1="86" y1="44" x2="44" y2="64" />
    <line x1="44" y1="64" x2="0" y2="44" />
    <line x1="0" y1="44" x2="0" y2="0" />
    <line x1="0" y1="0" x2="-40" y2="22" />
    <line x1="86" y1="0" x2="130" y2="22" />
  </g>

  <!-- ANNOTATIONS -->
  <g font-family="ui-monospace, 'SF Mono', monospace" font-size="10"
     letter-spacing="1.4">
    <text x="540" y="200" fill="{accent}">SECTION A-A</text>
    <line x1="450" y1="210" x2="540" y2="210" stroke="{accent}" stroke-opacity="0.6" />
    <text x="540" y="240" fill="{SLATE}">420 GSM FLEECE</text>
    <text x="540" y="260" fill="{SLATE}">OVERLOCK SEAM</text>
    <text x="540" y="290" fill="{accent}">{molecule_label}</text>
    <line x1="430" y1="280" x2="540" y2="280" stroke="{accent}" stroke-opacity="0.6" />
    <text x="540" y="310" fill="{SLATE}">TONAL FOIL PRINT</text>
    <text x="540" y="340" fill="{SLATE}">RIBBED CUFF · WELT</text>
  </g>
"""


def tee_silhouette(accent: str = GOLD, molecule_label: str = "LIMONENE C₁₀H₁₆") -> str:
    return f"""
  <g transform="translate(220, 130)" stroke="{GOLD}" stroke-width="2.2"
     fill="none" stroke-linejoin="round" stroke-linecap="round">
    <!-- COLLAR -->
    <path d="M 150 30 Q 180 50 210 30" />
    <!-- BODY -->
    <path d="M 80 50 L 150 30 L 150 50 Q 180 70 210 50 L 210 30 L 280 50
             L 320 130 L 280 145 L 280 360 L 80 360 L 80 145 L 40 130 Z" />
  </g>

  <!-- CHEST PRINT MOLECULE -->
  <g transform="translate(330, 260)" stroke="{accent}" stroke-width="1.8"
     fill="none">
    <circle cx="0" cy="0" r="6" fill="{accent}" />
    <circle cx="44" cy="-22" r="6" fill="{accent}" />
    <circle cx="44" cy="22" r="6" fill="{accent}" />
    <circle cx="88" cy="0" r="6" fill="{accent}" />
    <line x1="0" y1="0" x2="44" y2="-22" />
    <line x1="0" y1="0" x2="44" y2="22" />
    <line x1="44" y1="-22" x2="88" y2="0" />
    <line x1="44" y1="22" x2="88" y2="0" />
    <line x1="44" y1="-22" x2="44" y2="22" stroke-dasharray="3 2" />
  </g>

  <g font-family="ui-monospace, 'SF Mono', monospace" font-size="10"
     letter-spacing="1.4">
    <text x="540" y="200" fill="{accent}">{molecule_label}</text>
    <text x="540" y="230" fill="{SLATE}">240 GSM RING-SPUN</text>
    <text x="540" y="250" fill="{SLATE}">COMBED COTTON</text>
    <text x="540" y="280" fill="{accent}">CHEST PRINT</text>
    <text x="540" y="300" fill="{SLATE}">EMBOSSED · TECHNICAL</text>
    <text x="540" y="330" fill="{SLATE}">PRE-SHRUNK</text>
  </g>
"""


def cap_silhouette() -> str:
    return f"""
  <g transform="translate(200, 200)" stroke="{GOLD}" stroke-width="2.2"
     fill="none" stroke-linejoin="round" stroke-linecap="round">
    <!-- CROWN (6-panel) -->
    <path d="M 120 30 Q 240 -40 360 30 L 360 130 L 120 130 Z" />
    <!-- PANEL DIVIDERS -->
    <line x1="160" y1="20" x2="160" y2="130" stroke-opacity="0.6" />
    <line x1="200" y1="-2" x2="200" y2="130" stroke-opacity="0.6" />
    <line x1="240" y1="-12" x2="240" y2="130" stroke-opacity="0.6" />
    <line x1="280" y1="-2" x2="280" y2="130" stroke-opacity="0.6" />
    <line x1="320" y1="20" x2="320" y2="130" stroke-opacity="0.6" />
    <!-- BRIM -->
    <path d="M 80 130 L 400 130 Q 420 168 240 178 Q 60 168 80 130 Z" />
    <!-- LASER-ENGRAVED TF BADGE -->
    <rect x="216" y="50" width="48" height="32" stroke="{GOLD}" stroke-width="1.5" />
    <text x="240" y="73" text-anchor="middle"
          font-family="'Helvetica Neue', Arial, sans-serif"
          font-weight="800" font-size="14" fill="{GOLD}"
          letter-spacing="2">TF</text>
    <!-- SNAP CLOSURE BACK -->
    <circle cx="240" cy="130" r="3" fill="{GOLD}" />
  </g>

  <g font-family="ui-monospace, 'SF Mono', monospace" font-size="10"
     letter-spacing="1.4">
    <text x="540" y="200" fill="{GOLD}">6-PANEL STRUCTURED</text>
    <text x="540" y="225" fill="{SLATE}">COTTON TWILL · BLACK</text>
    <text x="540" y="255" fill="{GOLD}">LASER-ENGRAVED</text>
    <text x="540" y="275" fill="{SLATE}">ALUMINUM TF BADGE</text>
    <text x="540" y="305" fill="{SLATE}">SNAP CLOSURE</text>
    <text x="540" y="325" fill="{SLATE}">OSFA</text>
  </g>
"""


# ─── HARDWARE SILHOUETTES ──────────────────────────────────────────────────────

def jar_silhouette() -> str:
    return f"""
  <!-- CROSS-SECTION DIM LINES -->
  <g stroke="{TEAL}" stroke-opacity="0.35" stroke-width="1">
    <line x1="280" y1="160" x2="220" y2="160" stroke-dasharray="4 3" />
    <line x1="520" y1="160" x2="580" y2="160" stroke-dasharray="4 3" />
    <text x="160" y="164" font-family="ui-monospace, 'SF Mono', monospace"
          font-size="10" fill="{TEAL}">Ø60mm</text>
  </g>

  <g transform="translate(290, 150)" stroke="{GOLD}" stroke-width="2.2"
     fill="none" stroke-linejoin="round">
    <!-- SCREW LID -->
    <rect x="20" y="0" width="180" height="34" />
    <line x1="20" y1="14" x2="200" y2="14" stroke-opacity="0.4" />
    <line x1="36" y1="0" x2="36" y2="34" stroke-opacity="0.4" />
    <line x1="60" y1="0" x2="60" y2="34" stroke-opacity="0.4" />
    <line x1="84" y1="0" x2="84" y2="34" stroke-opacity="0.4" />
    <line x1="108" y1="0" x2="108" y2="34" stroke-opacity="0.4" />
    <line x1="132" y1="0" x2="132" y2="34" stroke-opacity="0.4" />
    <line x1="156" y1="0" x2="156" y2="34" stroke-opacity="0.4" />
    <line x1="184" y1="0" x2="184" y2="34" stroke-opacity="0.4" />
    <!-- NECK -->
    <rect x="40" y="34" width="140" height="20" />
    <!-- BODY (UV amber tint) -->
    <path d="M 0 54 L 20 54 L 20 280 Q 110 310 200 280 L 200 54 L 220 54
             L 220 290 Q 110 322 0 290 Z" fill="{GOLD}" fill-opacity="0.08" />
    <!-- CONTENT LINE -->
    <path d="M 30 230 Q 110 246 190 230" stroke="{GOLD_LIGHT}"
          stroke-opacity="0.7" stroke-dasharray="3 3" />
    <!-- TF BADGE -->
    <circle cx="110" cy="180" r="22" fill="none" stroke="{GOLD}" stroke-width="1.6" />
    <text x="110" y="186" text-anchor="middle"
          font-family="'Helvetica Neue', Arial, sans-serif"
          font-weight="800" font-size="14" fill="{GOLD}" letter-spacing="2">TF</text>
  </g>

  <g font-family="ui-monospace, 'SF Mono', monospace" font-size="10"
     letter-spacing="1.4">
    <text x="540" y="200" fill="{GOLD}">UV-400 BOROSILICATE</text>
    <text x="540" y="220" fill="{SLATE}">PHARMA SILICONE GASKET</text>
    <text x="540" y="250" fill="{GOLD}">AIRTIGHT · SHELF 18mo</text>
    <text x="540" y="280" fill="{SLATE}">CHEM-RESIST GRADE A</text>
    <text x="540" y="310" fill="{SLATE}">60 / 120 mL</text>
  </g>
"""


def vault_xl_silhouette() -> str:
    return f"""
  <g transform="translate(290, 140)" stroke="{GOLD}" stroke-width="2.2"
     fill="none" stroke-linejoin="round">
    <!-- LID WITH PRESSURE WHEEL -->
    <ellipse cx="110" cy="20" rx="120" ry="14" fill="{NAVY_LIGHT}" stroke="{GOLD}" />
    <ellipse cx="110" cy="20" rx="100" ry="10" fill="none" stroke-opacity="0.5" />
    <circle cx="110" cy="20" r="22" fill="none" />
    <circle cx="110" cy="20" r="14" fill="{GOLD}" fill-opacity="0.1" />
    <!-- handles around wheel -->
    <line x1="110" y1="-2" x2="110" y2="6" stroke-width="3" />
    <line x1="110" y1="34" x2="110" y2="42" stroke-width="3" />
    <line x1="88" y1="20" x2="96" y2="20" stroke-width="3" />
    <line x1="124" y1="20" x2="132" y2="20" stroke-width="3" />
    <!-- BODY (cylindrical 316L stainless, brushed satin shading) -->
    <path d="M 0 30 L 0 320 Q 110 340 220 320 L 220 30 Q 110 50 0 30 Z"
          fill="{NAVY_LIGHT}" fill-opacity="0.4" />
    <line x1="20" y1="38" x2="20" y2="324" stroke-opacity="0.3" />
    <line x1="40" y1="42" x2="40" y2="328" stroke-opacity="0.25" />
    <line x1="200" y1="38" x2="200" y2="324" stroke-opacity="0.3" />
    <line x1="180" y1="42" x2="180" y2="328" stroke-opacity="0.25" />
    <!-- LASER ETCH -->
    <rect x="80" y="160" width="60" height="60" fill="none" stroke="{GOLD}" stroke-width="1.4" />
    <text x="110" y="200" text-anchor="middle"
          font-family="'Helvetica Neue', Arial, sans-serif"
          font-weight="800" font-size="22" fill="{GOLD}" letter-spacing="2">TF</text>
    <!-- BASE -->
    <rect x="-6" y="320" width="232" height="14" fill="{NAVY_LIGHT}" />
  </g>

  <g font-family="ui-monospace, 'SF Mono', monospace" font-size="10"
     letter-spacing="1.4">
    <text x="540" y="200" fill="{GOLD}">316L SURGICAL STEEL</text>
    <text x="540" y="220" fill="{SLATE}">PTFE PRESSURE SEAL</text>
    <text x="540" y="250" fill="{GOLD}">RATED −20°C</text>
    <text x="540" y="280" fill="{SLATE}">BRUSHED SATIN FINISH</text>
    <text x="540" y="310" fill="{SLATE}">500 mL CAPACITY</text>
  </g>
"""


def field_kit_silhouette() -> str:
    return f"""
  <!-- ROLL CASE (open, showing tools) -->
  <g transform="translate(160, 220)" stroke="{GOLD}" stroke-width="2"
     fill="none" stroke-linejoin="round">
    <rect x="0" y="0" width="480" height="170" rx="6"
          fill="{NAVY_LIGHT}" fill-opacity="0.5" />
    <line x1="60" y1="0" x2="60" y2="170" stroke-opacity="0.4" />
    <line x1="135" y1="0" x2="135" y2="170" stroke-opacity="0.4" />
    <line x1="210" y1="0" x2="210" y2="170" stroke-opacity="0.4" />
    <line x1="285" y1="0" x2="285" y2="170" stroke-opacity="0.4" />
    <line x1="360" y1="0" x2="360" y2="170" stroke-opacity="0.4" />
    <line x1="420" y1="0" x2="420" y2="170" stroke-opacity="0.4" />
  </g>

  <!-- TOOLS (in slots) -->
  <g stroke="{GOLD_LIGHT}" stroke-width="2.2" fill="none" stroke-linecap="round">
    <!-- DAB TOOL (pointed) -->
    <line x1="190" y1="240" x2="190" y2="370" />
    <circle cx="190" cy="370" r="4" fill="{GOLD_LIGHT}" />
    <line x1="225" y1="240" x2="225" y2="370" />
    <path d="M 222 370 L 228 380" />
    <!-- SCRAPER -->
    <line x1="262" y1="240" x2="262" y2="370" />
    <path d="M 256 370 L 268 384 L 256 380 Z" fill="{GOLD_LIGHT}" />
    <line x1="298" y1="240" x2="298" y2="370" />
    <path d="M 292 370 L 304 384 L 292 380 Z" fill="{GOLD_LIGHT}" />
    <!-- GLASS JARS (silhouette) -->
    <rect x="333" y="280" width="22" height="80" rx="3" fill="{GOLD}" fill-opacity="0.08" />
    <rect x="370" y="280" width="22" height="80" rx="3" fill="{GOLD}" fill-opacity="0.08" />
  </g>

  <!-- LABELS -->
  <g font-family="ui-monospace, 'SF Mono', monospace" font-size="9"
     letter-spacing="1.4" fill="{SLATE}">
    <text x="170" y="402" text-anchor="middle">DAB-A</text>
    <text x="220" y="402" text-anchor="middle">DAB-B</text>
    <text x="262" y="402" text-anchor="middle">SCR-A</text>
    <text x="298" y="402" text-anchor="middle">SCR-B</text>
    <text x="343" y="402" text-anchor="middle">JAR-A</text>
    <text x="380" y="402" text-anchor="middle">JAR-B</text>
    <text x="430" y="402" text-anchor="middle">CASE</text>
  </g>

  <g font-family="ui-monospace, 'SF Mono', monospace" font-size="10"
     letter-spacing="1.4">
    <text x="200" y="180" fill="{GOLD}">7-PIECE PRECISION SET</text>
    <text x="200" y="200" fill="{SLATE}">316 STAINLESS STEEL · MICROFIBER ROLL CASE</text>
  </g>
"""


def thermometer_silhouette() -> str:
    return f"""
  <!-- DIGITAL DISPLAY UNIT -->
  <g transform="translate(220, 150)" stroke="{GOLD}" stroke-width="2.2"
     fill="none" stroke-linejoin="round">
    <rect x="0" y="0" width="220" height="160" rx="10"
          fill="{NAVY_LIGHT}" fill-opacity="0.6" />
    <!-- LCD -->
    <rect x="20" y="20" width="180" height="80" fill="{NAVY}" stroke="{TEAL}" stroke-opacity="0.6" />
    <text x="110" y="76" text-anchor="middle"
          font-family="ui-monospace, 'SF Mono', monospace"
          font-size="36" font-weight="700" fill="{TEAL}" letter-spacing="2">42.7°</text>
    <text x="110" y="94" text-anchor="middle"
          font-family="ui-monospace, 'SF Mono', monospace"
          font-size="9" fill="{SLATE}" letter-spacing="2">PROBE 01 · LIVE</text>
    <!-- BUTTONS -->
    <circle cx="40" cy="130" r="10" fill="{NAVY}" />
    <circle cx="80" cy="130" r="10" fill="{NAVY}" />
    <circle cx="180" cy="130" r="10" fill="{GOLD}" fill-opacity="0.2" />
    <text x="40" y="134" text-anchor="middle"
          font-family="ui-monospace, 'SF Mono', monospace"
          font-size="10" fill="{SLATE}">−</text>
    <text x="80" y="134" text-anchor="middle"
          font-family="ui-monospace, 'SF Mono', monospace"
          font-size="10" fill="{SLATE}">+</text>
    <text x="180" y="135" text-anchor="middle"
          font-family="ui-monospace, 'SF Mono', monospace"
          font-size="9" fill="{GOLD}" font-weight="700">BT</text>
  </g>

  <!-- PROBE (with cable) -->
  <g stroke="{GOLD}" stroke-width="2" fill="none">
    <path d="M 440 230 Q 530 230 540 320 Q 550 410 480 430" />
    <line x1="476" y1="426" x2="476" y2="466" stroke-width="3" />
    <circle cx="476" cy="470" r="4" fill="{GOLD}" />
  </g>

  <g font-family="ui-monospace, 'SF Mono', monospace" font-size="10"
     letter-spacing="1.4">
    <text x="260" y="350" fill="{GOLD}">±0.1°C ACCURACY</text>
    <text x="260" y="370" fill="{SLATE}">IP67 WATERPROOF</text>
    <text x="260" y="390" fill="{TEAL}">BLUETOOTH 5.0</text>
    <text x="260" y="410" fill="{SLATE}">−50°C → +300°C</text>
  </g>
"""


# ─── WELLNESS SILHOUETTES ──────────────────────────────────────────────────────

def tincture_silhouette(profile: str, mg: str, terpene: str) -> str:
    accent = PROFILE_COLORS[profile]
    return f"""
  <!-- DROPPER + BOTTLE -->
  <g transform="translate(330, 130)" stroke="{GOLD}" stroke-width="2.2"
     fill="none" stroke-linejoin="round">
    <!-- BULB -->
    <ellipse cx="70" cy="30" rx="34" ry="22" fill="{accent}" fill-opacity="0.18" />
    <!-- DROPPER NECK -->
    <rect x="56" y="50" width="28" height="20" fill="{NAVY_LIGHT}" />
    <!-- THREAD -->
    <rect x="44" y="70" width="52" height="18" fill="{NAVY_LIGHT}" />
    <line x1="44" y1="78" x2="96" y2="78" stroke-opacity="0.5" />
    <!-- BOTTLE -->
    <path d="M 30 88 L 110 88 L 122 110 L 122 280 Q 70 296 18 280 L 18 110 Z"
          fill="{accent}" fill-opacity="0.14" />
    <!-- LABEL -->
    <rect x="22" y="148" width="96" height="98" fill="{NAVY}" stroke="{accent}" stroke-opacity="0.6" />
    <text x="70" y="172" text-anchor="middle"
          font-family="'Helvetica Neue', Arial, sans-serif"
          font-weight="800" font-size="13" fill="{accent}" letter-spacing="2">{profile}</text>
    <line x1="32" y1="178" x2="108" y2="178" stroke="{accent}" stroke-opacity="0.4" />
    <text x="70" y="200" text-anchor="middle"
          font-family="ui-monospace, 'SF Mono', monospace"
          font-size="11" fill="{OFFWHITE}" letter-spacing="1.6">{mg}</text>
    <text x="70" y="220" text-anchor="middle"
          font-family="ui-monospace, 'SF Mono', monospace"
          font-size="9" fill="{SLATE}" letter-spacing="2">CBD · MCT</text>
    <text x="70" y="238" text-anchor="middle"
          font-family="ui-monospace, 'SF Mono', monospace"
          font-size="9" fill="{accent}" letter-spacing="2">{terpene}</text>
    <!-- DROP INSIDE -->
    <path d="M 70 268 q -8 -16 0 -28 q 8 12 0 28 z" fill="{accent}" fill-opacity="0.55" />
  </g>

  <!-- COA STAMP -->
  <g transform="translate(130, 280)" font-family="ui-monospace, 'SF Mono', monospace">
    <circle cx="40" cy="40" r="38" fill="none" stroke="{GOLD}" stroke-width="1.6" />
    <text x="40" y="34" text-anchor="middle" font-size="9" fill="{GOLD}" letter-spacing="2">COA</text>
    <text x="40" y="46" text-anchor="middle" font-size="9" fill="{GOLD}" letter-spacing="2">VERIFIED</text>
    <text x="40" y="58" text-anchor="middle" font-size="8" fill="{SLATE}" letter-spacing="2">3rd PARTY</text>
  </g>

  <g font-family="ui-monospace, 'SF Mono', monospace" font-size="10"
     letter-spacing="1.4">
    <text x="540" y="220" fill="{accent}">{profile} PROTOCOL</text>
    <text x="540" y="240" fill="{SLATE}">{mg} · MCT CARRIER</text>
    <text x="540" y="270" fill="{GOLD}">{terpene} DOMINANT</text>
    <text x="540" y="290" fill="{SLATE}">&lt; 0.001% THC</text>
    <text x="540" y="320" fill="{SLATE}">3rd-PARTY LAB VERIFIED</text>
  </g>
"""


def gummies_silhouette() -> str:
    accent = TEAL
    return f"""
  <!-- POUCH (stand-up) -->
  <g transform="translate(280, 140)" stroke="{GOLD}" stroke-width="2.2"
     fill="none" stroke-linejoin="round">
    <path d="M 0 30 L 0 320 L 240 320 L 240 30 L 220 0 L 20 0 Z"
          fill="{NAVY_LIGHT}" fill-opacity="0.7" />
    <!-- ZIPPER -->
    <line x1="10" y1="40" x2="230" y2="40" stroke-dasharray="3 3" stroke-opacity="0.6" />
    <!-- LABEL BAND -->
    <rect x="20" y="80" width="200" height="60" fill="{NAVY}" stroke="{accent}" stroke-opacity="0.6" />
    <text x="120" y="106" text-anchor="middle"
          font-family="'Helvetica Neue', Arial, sans-serif"
          font-weight="800" font-size="15" fill="{accent}" letter-spacing="3">RECOVERY</text>
    <text x="120" y="124" text-anchor="middle"
          font-family="ui-monospace, 'SF Mono', monospace"
          font-size="9" fill="{SLATE}" letter-spacing="2">MYRCENE C₁₀H₁₆ · 25mg/ea · 30ct</text>
    <!-- WINDOW SHOWING GUMMIES -->
    <rect x="20" y="160" width="200" height="140" fill="{NAVY}" stroke="{GOLD}" stroke-opacity="0.4" />
  </g>

  <!-- GUMMIES INSIDE WINDOW (window spans 300..500 in page coords; rows fit within 160..300 → 300..440 page-y) -->
  <g fill="{accent}" fill-opacity="0.72">
    <rect x="312" y="306" width="30" height="30" rx="7" />
    <rect x="350" y="302" width="30" height="30" rx="7" />
    <rect x="388" y="308" width="30" height="30" rx="7" />
    <rect x="426" y="304" width="30" height="30" rx="7" />
    <rect x="464" y="308" width="30" height="30" rx="7" />
    <rect x="312" y="346" width="30" height="30" rx="7" />
    <rect x="350" y="350" width="30" height="30" rx="7" />
    <rect x="388" y="346" width="30" height="30" rx="7" />
    <rect x="426" y="350" width="30" height="30" rx="7" />
    <rect x="464" y="346" width="30" height="30" rx="7" />
    <rect x="312" y="386" width="30" height="30" rx="7" />
    <rect x="350" y="390" width="30" height="30" rx="7" />
    <rect x="388" y="388" width="30" height="30" rx="7" />
    <rect x="426" y="390" width="30" height="30" rx="7" />
    <rect x="464" y="388" width="30" height="30" rx="7" />
  </g>

  <g font-family="ui-monospace, 'SF Mono', monospace" font-size="10"
     letter-spacing="1.4">
    <text x="540" y="180" fill="{accent}">RECOVERY · MYRCENE</text>
    <text x="540" y="200" fill="{SLATE}">PECTIN BASE · VEGAN</text>
    <text x="540" y="220" fill="{GOLD}">750mg CBD TOTAL</text>
  </g>
"""


def stack_kit_silhouette() -> str:
    return f"""
  <!-- 3 MINI BOTTLES IN A ROW -->
  <g stroke="{GOLD}" stroke-width="2" fill="none" stroke-linejoin="round">
    <!-- FOCUS (gold) -->
    <g transform="translate(220, 200)">
      <ellipse cx="40" cy="14" rx="18" ry="11" fill="{GOLD}" fill-opacity="0.2" />
      <rect x="30" y="24" width="20" height="14" fill="{NAVY_LIGHT}" />
      <path d="M 18 38 L 62 38 L 70 58 L 70 220 Q 40 230 10 220 L 10 58 Z"
            fill="{GOLD}" fill-opacity="0.14" />
      <rect x="14" y="86" width="52" height="86" fill="{NAVY}" stroke="{GOLD}" stroke-opacity="0.6" />
      <text x="40" y="110" text-anchor="middle"
            font-family="'Helvetica Neue', Arial, sans-serif"
            font-weight="800" font-size="11" fill="{GOLD}" letter-spacing="2">FOCUS</text>
      <text x="40" y="132" text-anchor="middle"
            font-family="ui-monospace, 'SF Mono', monospace"
            font-size="8" fill="{OFFWHITE}" letter-spacing="1">10mL</text>
      <text x="40" y="154" text-anchor="middle"
            font-family="ui-monospace, 'SF Mono', monospace"
            font-size="8" fill="{GOLD}" letter-spacing="1">LIMONENE</text>
    </g>
    <!-- RECOVERY (teal) -->
    <g transform="translate(360, 200)">
      <ellipse cx="40" cy="14" rx="18" ry="11" fill="{TEAL}" fill-opacity="0.22" />
      <rect x="30" y="24" width="20" height="14" fill="{NAVY_LIGHT}" />
      <path d="M 18 38 L 62 38 L 70 58 L 70 220 Q 40 230 10 220 L 10 58 Z"
            fill="{TEAL}" fill-opacity="0.16" />
      <rect x="14" y="86" width="52" height="86" fill="{NAVY}" stroke="{TEAL}" stroke-opacity="0.6" />
      <text x="40" y="108" text-anchor="middle"
            font-family="'Helvetica Neue', Arial, sans-serif"
            font-weight="800" font-size="9" fill="{TEAL}" letter-spacing="2">RECOVERY</text>
      <text x="40" y="132" text-anchor="middle"
            font-family="ui-monospace, 'SF Mono', monospace"
            font-size="8" fill="{OFFWHITE}" letter-spacing="1">10mL</text>
      <text x="40" y="154" text-anchor="middle"
            font-family="ui-monospace, 'SF Mono', monospace"
            font-size="8" fill="{TEAL}" letter-spacing="1">MYRCENE</text>
    </g>
    <!-- CALM (blue) -->
    <g transform="translate(500, 200)">
      <ellipse cx="40" cy="14" rx="18" ry="11" fill="#2563EB" fill-opacity="0.22" />
      <rect x="30" y="24" width="20" height="14" fill="{NAVY_LIGHT}" />
      <path d="M 18 38 L 62 38 L 70 58 L 70 220 Q 40 230 10 220 L 10 58 Z"
            fill="#2563EB" fill-opacity="0.16" />
      <rect x="14" y="86" width="52" height="86" fill="{NAVY}" stroke="#2563EB" stroke-opacity="0.6" />
      <text x="40" y="110" text-anchor="middle"
            font-family="'Helvetica Neue', Arial, sans-serif"
            font-weight="800" font-size="11" fill="#2563EB" letter-spacing="2">CALM</text>
      <text x="40" y="132" text-anchor="middle"
            font-family="ui-monospace, 'SF Mono', monospace"
            font-size="8" fill="{OFFWHITE}" letter-spacing="1">10mL</text>
      <text x="40" y="154" text-anchor="middle"
            font-family="ui-monospace, 'SF Mono', monospace"
            font-size="8" fill="#2563EB" letter-spacing="1">LINALOOL</text>
    </g>
  </g>

  <g font-family="ui-monospace, 'SF Mono', monospace" font-size="10"
     letter-spacing="1.4">
    <text x="220" y="180" fill="{GOLD}">THE TERPENE STACK · TRIAL KIT</text>
    <text x="220" y="450" fill="{SLATE}">PROFILE YOUR RESPONSE TO EACH TERPENE VARIANT</text>
    <text x="220" y="470" fill="{TEAL}">3 × 10mL · COA INCLUDED</text>
  </g>
"""


# ─── PRODUCT MAP (mirrors src/lib/products.ts) ────────────────────────────────

PRODUCTS = [
    # APPAREL
    dict(id="tf-ap-001", name="Myrcene Structure Hoodie", profile="RECOVERY",
         icon="◈", badge="NEW DROP", spec="GSM-420 Heavyweight Cotton Fleece · Gold Foil Molecular Schematic",
         silhouette=lambda: hoodie_silhouette(TEAL, foil=True, molecule_label="MYRCENE C₁₀H₁₆")),
    dict(id="tf-ap-002", name="Limonene Circuit Tee", profile="FOCUS",
         icon="◈", badge="BESTSELLER", spec="240gsm Combed Cotton · Embossed Molecular Print",
         silhouette=lambda: tee_silhouette(GOLD, molecule_label="LIMONENE C₁₀H₁₆")),
    dict(id="tf-ap-003", name="Linalool Stealth Hoodie", profile="CALM",
         icon="◈", badge="LIMITED", spec="GSM-420 Cotton Fleece · Tonal Navy Print · Minimal",
         silhouette=lambda: hoodie_silhouette("#2563EB", foil=False, stealth=True,
                                              molecule_label="LINALOOL C₁₀H₁₈O")),
    dict(id="tf-ap-004", name="The Forge Snapback", profile=None,
         icon="◈", badge=None, spec="6-Panel Structured · Laser-Engraved TF Logo",
         silhouette=cap_silhouette),
    # HARDWARE
    dict(id="tf-hw-001", name="Terpene Vault — UV Series", profile=None,
         icon="⬡", badge="BESTSELLER", spec="Borosilicate Glass · Airtight Silicone Seal · UV-400 Shield",
         silhouette=jar_silhouette),
    dict(id="tf-hw-002", name="TerpVault XL — Stainless", profile=None,
         icon="⬡", badge="PRO SERIES", spec="Grade 316L Surgical Steel · 500mL · Pressure Sealed",
         silhouette=vault_xl_silhouette),
    dict(id="tf-hw-003", name="Extraction Field Kit", profile=None,
         icon="⬡", badge=None, spec="7-Piece Set · Stainless Tools · Roll Case Included",
         silhouette=field_kit_silhouette),
    dict(id="tf-hw-004", name="TerpTemp Monitor Pro", profile=None,
         icon="⬡", badge="NEW", spec="Digital Precision ±0.1°C · Bluetooth Sync · Waterproof",
         silhouette=thermometer_silhouette),
    # WELLNESS
    dict(id="tf-wl-001", name="Focus Protocol Tincture", profile="FOCUS",
         icon="◉", badge="COA VERIFIED", spec="1000mg CBD · Limonene-Dominant Terpene Profile",
         silhouette=lambda: tincture_silhouette("FOCUS", "1000mg", "LIMONENE")),
    dict(id="tf-wl-002", name="Recovery Protocol Gummies", profile="RECOVERY",
         icon="◉", badge="COA VERIFIED", spec="25mg CBD/ea · Myrcene Profile · 30-Count",
         silhouette=gummies_silhouette),
    dict(id="tf-wl-003", name="Calm Protocol Tincture", profile="CALM",
         icon="◉", badge="COA VERIFIED", spec="1500mg CBD · Linalool-Dominant Profile · Sleep Support",
         silhouette=lambda: tincture_silhouette("CALM", "1500mg", "LINALOOL")),
    dict(id="tf-wl-004", name="The Terpene Stack — Trial Kit", profile=None,
         icon="◉", badge="STARTER KIT", spec="3×10mL Tinctures · All 3 Profiles · COA Included",
         silhouette=stack_kit_silhouette),
]


def main() -> None:
    for p in PRODUCTS:
        svg = frame(
            content_svg=p["silhouette"](),
            sku=p["id"],
            label=p["name"],
            spec=p["spec"],
            profile=p["profile"],
            icon=p["icon"],
            badge=p["badge"],
        )
        out_path = os.path.join(OUT_DIR, f"{p['id']}.svg")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(svg)
        print(f"  → {out_path}  ({len(svg):,} bytes)")
    print(f"\nGenerated {len(PRODUCTS)} schematics in {OUT_DIR}")


if __name__ == "__main__":
    main()
