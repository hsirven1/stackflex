// Same as the existing `Mark` in components/stackflex/Brand.tsx. If that exists in your app, import it instead.
export function StackFlexMark({ size = 22, outline = "#FFFFFF" }: { size?: number | string; outline?: string }) {
  const s = typeof size === "number" ? `${size}px` : size;
  return (
    <span aria-hidden style={{ position: "relative", display: "inline-block", flex: "none", width: s, height: s }}>
      <span style={{ position: "absolute", left: 0, top: 0, width: `calc(${s} * 16 / 22)`, height: `calc(${s} * 16 / 22)`, borderRadius: `calc(${s} * 5 / 22)`, background: "#3A2EFF" }} />
      <span style={{ position: "absolute", right: 0, bottom: 0, width: `calc(${s} * 11 / 22)`, height: `calc(${s} * 11 / 22)`, borderRadius: `calc(${s} * 4 / 22)`, background: "#D7FF3A", boxShadow: `0 0 0 calc(${s} * 2 / 22) ${outline}` }} />
    </span>
  );
}
