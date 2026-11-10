import { getLogo } from "@/lib/catalog/icons";
import { stackTools, type Tool } from "@/lib/stackflex/tools";
import type { StackShareInput } from "./types";

/** Build a data-URL logo ImageResponse can fetch (path icons become inline SVG). */
export function toolLogoSrc(tool: Pick<Tool, "iconSlug">): string | null {
  const logo = getLogo(tool.iconSlug);
  if (!logo) return null;
  if (logo.kind === "image") return logo.src;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#${logo.hex}" d="${logo.path}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function ogTools(stack: StackShareInput): Tool[] {
  return stackTools(stack).slice(0, 6); // OG image uses featured-sized board; full stack is on the page
}

/** Shared OG / Twitter card layout (Satori-compatible flex CSS only). */
export function StackOgLayout({
  tools,
  title = "My AI Stack",
}: {
  tools: Tool[];
  title?: string;
}) {
  const names = tools.map((t) => t.name);
  const subtitle =
    names.length === 0
      ? "A collection of AI tools on StackFlex"
      : names.length <= 3
        ? names.join(" · ")
        : `${names.slice(0, 3).join(" · ")} +${names.length - 3}`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#FFFFFF",
        color: "#0B0B0C",
        padding: "48px 56px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", width: 36, height: 36, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 26,
              height: 26,
              borderRadius: 8,
              background: "#3A2EFF",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 18,
              height: 18,
              borderRadius: 6,
              background: "#D7FF3A",
              boxShadow: "0 0 0 3px #FFFFFF",
            }}
          />
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em" }}>StackFlex</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 36, flex: 1 }}>
        <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05 }}>{title}</div>
        <div style={{ marginTop: 14, fontSize: 26, color: "#55534D", letterSpacing: "-0.02em" }}>{subtitle}</div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginTop: 40,
            maxWidth: 1080,
          }}
        >
          {tools.map((tool, i) => {
            const src = toolLogoSrc(tool);
            const isMain = i === 0;
            return (
              <div
                key={tool.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 18px",
                  borderRadius: 18,
                  background: isMain
                    ? "linear-gradient(165deg, #FFFFFF 0%, #F8F6F2 100%)"
                    : "linear-gradient(165deg, #FFFFFF 0%, #F7F5F1 100%)",
                  border: isMain ? `1px solid ${tool.aura}66` : "1px solid #ECEAE4",
                  boxShadow: isMain ? "0 16px 34px -22px rgba(60,40,140,.38)" : "0 8px 20px -18px rgba(11,11,12,.25)",
                  minWidth: 200,
                  maxWidth: 320,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 52,
                    height: 52,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#F3F1EB",
                    border: `2px solid ${tool.aura}99`,
                    flexShrink: 0,
                  }}
                >
                  {src ? (
                    // ImageResponse / Satori only supports <img>, not next/image.
                    // eslint-disable-next-line @next/next/no-img-element -- OG image pipeline
                    <img src={src} width={28} height={28} alt="" />
                  ) : (
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{tool.monogram}</div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#6F6D66",
                      }}
                    >
                      {tool.category}
                    </div>
                    {isMain ? (
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "#3A2EFF",
                          background: "rgba(58,46,255,0.1)",
                          borderRadius: 999,
                          padding: "2px 8px",
                        }}
                      >
                        Main
                      </div>
                    ) : null}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 2 }}>{tool.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
        <div style={{ fontSize: 18, color: "#8C897F" }}>stackflex.app</div>
        <div style={{ fontSize: 18, color: "#8C897F" }}>Shared snapshot</div>
      </div>
    </div>
  );
}

/** Fallback OG art when a token cannot be decoded. */
export function StackOgFallback() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFFFFF",
        color: "#0B0B0C",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.04em" }}>StackFlex</div>
      <div style={{ marginTop: 16, fontSize: 28, color: "#55534D" }}>Show off your AI stack</div>
    </div>
  );
}
