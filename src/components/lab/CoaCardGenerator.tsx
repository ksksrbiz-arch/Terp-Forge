"use client";

import { useEffect, useRef, useState } from "react";

export type CoaInput = {
  batchId: string;
  product: string;
  cbd: string;
  thc: string;
  date: string;
  lab: string;
  status: string;
};

/** Deterministic 21x21 datamatrix-style stamp keyed off the batch ID.
 *  Rendered as SVG modules so it scales crisply. Decorative — not a
 *  scannable QR; the COA file itself carries the verifiable payload. */
function dataStamp(seed: string, size = 21) {
  // FNV-1a hash
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  const cells: boolean[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // mulberry32-ish step keyed by position + base hash
      h ^= (x * 0x9e3779b1 + y * 0x85ebca77) >>> 0;
      h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
      cells.push((h & 0xff) < 110);
    }
  }
  return cells;
}

export function CoaCardGenerator({ defaultEntry }: { defaultEntry?: CoaInput }) {
  const [entry, setEntry] = useState<CoaInput>(
    defaultEntry ?? {
      batchId: "TF-2026-04-001",
      product: "Limonene Tincture · Focus Protocol",
      cbd: "1000 mg",
      thc: "<0.001%",
      date: "2026-04-15",
      lab: "Aegis Analytical",
      status: "VERIFIED",
    }
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadedAs, setDownloadedAs] = useState<string | null>(null);

  // Re-render canvas any time entry changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    // Background
    ctx.fillStyle = "#0A1628";
    ctx.fillRect(0, 0, W, H);

    // Schematic grid
    ctx.strokeStyle = "rgba(13, 148, 136, 0.10)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Outer frame + corner brackets
    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    const drawBracket = (x: number, y: number, dx: number, dy: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y + 24 * dy);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 24 * dx, y);
      ctx.stroke();
    };
    ctx.lineWidth = 3;
    drawBracket(20, 20, 1, 1);
    drawBracket(W - 20, 20, -1, 1);
    drawBracket(20, H - 20, 1, -1);
    drawBracket(W - 20, H - 20, -1, -1);

    // Header
    ctx.fillStyle = "#0D9488";
    ctx.font = "bold 14px 'Roboto Mono', 'Courier New', monospace";
    ctx.fillText("// CERTIFICATE OF ANALYSIS", 56, 64);

    ctx.fillStyle = "#E8EDF5";
    ctx.font = "900 38px 'Montserrat', system-ui, sans-serif";
    ctx.fillText("TerpForge", 56, 110);
    ctx.fillStyle = "#C9A84C";
    ctx.font = "bold 12px 'Roboto Mono', monospace";
    ctx.fillText("ENGINEERED AROMATICS · FORGED WELLNESS", 56, 130);

    // Body fields
    const rows: [string, string, string][] = [
      ["BATCH ID", entry.batchId, "#C9A84C"],
      ["PRODUCT", entry.product, "#E8EDF5"],
      ["CBD CONCENTRATION", entry.cbd, "#C9A84C"],
      ["THC CONCENTRATION", entry.thc, "#0D9488"],
      ["TEST DATE", entry.date, "#E8EDF5"],
      ["LABORATORY", entry.lab, "#E8EDF5"],
      ["STATUS", entry.status, "#0D9488"],
    ];
    let y = 180;
    rows.forEach(([label, value, color]) => {
      ctx.fillStyle = "#64748B";
      ctx.font = "10px 'Roboto Mono', monospace";
      ctx.fillText(label, 56, y);
      ctx.fillStyle = color;
      ctx.font = "bold 16px 'Roboto Mono', monospace";
      ctx.fillText(value, 56, y + 22);
      y += 52;
    });

    // Datamatrix stamp (right side)
    const cells = dataStamp(entry.batchId);
    const stampSize = 168;
    const stampX = W - stampSize - 56;
    const stampY = 180;
    const cellSize = stampSize / 21;
    ctx.fillStyle = "#0F1F3D";
    ctx.fillRect(stampX - 8, stampY - 8, stampSize + 16, stampSize + 16);
    ctx.fillStyle = "#E8EDF5";
    cells.forEach((on, i) => {
      if (!on) return;
      const x = (i % 21) * cellSize + stampX;
      const yy = Math.floor(i / 21) * cellSize + stampY;
      ctx.fillRect(x, yy, cellSize - 0.5, cellSize - 0.5);
    });
    // Finder corners
    ctx.fillStyle = "#C9A84C";
    ctx.fillRect(stampX, stampY, cellSize * 5, cellSize);
    ctx.fillRect(stampX, stampY, cellSize, cellSize * 5);
    ctx.fillRect(stampX + stampSize - cellSize * 5, stampY, cellSize * 5, cellSize);
    ctx.fillRect(stampX + stampSize - cellSize, stampY, cellSize, cellSize * 5);
    ctx.fillRect(stampX, stampY + stampSize - cellSize, cellSize * 5, cellSize);
    ctx.fillRect(stampX, stampY + stampSize - cellSize * 5, cellSize, cellSize * 5);

    ctx.fillStyle = "#64748B";
    ctx.font = "9px 'Roboto Mono', monospace";
    ctx.fillText(`HASH://${entry.batchId}`, stampX, stampY + stampSize + 18);

    // Footer
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(56, H - 80, W - 112, 1);
    ctx.fillStyle = "#64748B";
    ctx.font = "10px 'Roboto Mono', monospace";
    ctx.fillText("Tested under ISO/IEC 17025 · Verified by independent laboratory", 56, H - 56);
    ctx.fillText("terpforge.com · This document is certified for the batch noted.", 56, H - 38);
  }, [entry]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${entry.batchId}.coa-card.png`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadedAs(entry.batchId);
      window.setTimeout(() => setDownloadedAs(null), 1800);
    }, "image/png");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="border border-[#C9A84C]/40 bg-[#0A1628] overflow-x-auto">
        <canvas ref={canvasRef} width={780} height={580} className="w-full block min-w-[320px]" />
      </div>

      <div className="space-y-3">
        <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.4em] uppercase">
          {"// Schematic builder"}
        </p>
        {(
          [
            ["batchId", "Batch ID"],
            ["product", "Product"],
            ["cbd", "CBD"],
            ["thc", "THC"],
            ["date", "Test date"],
            ["lab", "Laboratory"],
            ["status", "Status"],
          ] as [keyof CoaInput, string][]
        ).map(([k, label]) => (
          <label key={k} className="block">
            <span className="block text-[10px] font-mono tracking-widest uppercase text-[#64748B] mb-1">
              {label}
            </span>
            <input
              type="text"
              value={entry[k]}
              onChange={(e) => setEntry({ ...entry, [k]: e.target.value })}
              className="w-full bg-[#0A1628] border border-[#1E293B] focus:border-[#C9A84C] outline-none px-3 py-3 sm:py-2 text-sm font-mono text-[#E8EDF5]"
            />
          </label>
        ))}

        <button
          type="button"
          onClick={download}
          className="w-full mt-2 px-6 py-4 border border-[#C9A84C] text-[#C9A84C] text-xs font-mono tracking-widest uppercase hover:bg-[#C9A84C]/10 transition-colors"
        >
          {downloadedAs ? "✓ COA card downloaded" : "↓ Generate COA card (PNG)"}
        </button>
        <p className="text-[10px] font-mono text-[#64748B] leading-relaxed">
          Builds a schematic-style certificate keyed off the batch ID. The
          datamatrix stamp is deterministic per batch but decorative —
          authoritative payloads remain in the canonical text COA.
        </p>
      </div>
    </div>
  );
}
