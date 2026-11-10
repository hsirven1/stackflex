import { ImageResponse } from "next/og";

export const alt = "StackFlex — Show what you can do with AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social preview for the marketing site (no personal data). */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(145deg, #0B0B0E 0%, #1A1730 55%, #121218 100%)",
          color: "#FFFFFF",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#D7FF3A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0B0B0C",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ fontSize: 36, fontWeight: 650, letterSpacing: "-0.04em" }}>StackFlex</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 900 }}>
          <div style={{ fontSize: 64, fontWeight: 650, letterSpacing: "-0.045em", lineHeight: 1.05 }}>
            Show what you can do with AI.
          </div>
          <div style={{ fontSize: 28, color: "#C9C6D6", lineHeight: 1.35 }}>
            Build a shareable AI profile card and LinkedIn banner. No signup.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
