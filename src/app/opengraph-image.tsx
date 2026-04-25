import { ImageResponse } from "next/og";
import { siteDescription, siteName } from "@/lib/site";

export const dynamic = "force-static";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "radial-gradient(circle at top right, rgba(13,148,136,0.28), transparent 32%), linear-gradient(135deg, #050E1A 0%, #0A1628 46%, #0F1F3D 100%)",
          color: "#E8EDF5",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 32,
            border: "1px solid rgba(201,168,76,0.28)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ color: "#0D9488", fontSize: 22, letterSpacing: 6, textTransform: "uppercase" }}>
              {"// Engineered Aromatics"}
            </div>
            <div style={{ color: "#C9A84C", fontSize: 22, letterSpacing: 6, textTransform: "uppercase" }}>
              TF-Systems
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                fontSize: 92,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: -2,
                lineHeight: 0.96,
              }}
            >
              {siteName}
            </div>
            <div
              style={{
                maxWidth: 780,
                fontSize: 34,
                lineHeight: 1.3,
                color: "#CBD5E1",
              }}
            >
              {siteDescription}
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, color: "#C9A84C", fontSize: 24, letterSpacing: 4, textTransform: "uppercase" }}>
            <div>Shop</div>
            <div>Lab</div>
            <div>Story</div>
            <div>Contact</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
