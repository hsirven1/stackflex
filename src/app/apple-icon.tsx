import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon — same mark geometry as Brand / public/stackflex/mark-dark.svg. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0B0B0C",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 14,
            top: 14,
            width: 108,
            height: 108,
            borderRadius: 34,
            background: "#3A2EFF",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 14,
            bottom: 14,
            width: 74,
            height: 74,
            borderRadius: 27,
            background: "#D7FF3A",
            boxShadow: "0 0 0 14px #0B0B0C",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
