// StackFlex mark: ultramarine rounded square + offset lime square with a cut-out ring in the background color.
// Proportions from the 22px header mark: blue 16 (r5), lime 11 (r4), ring 2.

export function Mark({ size = 22, outline = "#FFFFFF" }: { size?: number; outline?: string }) {
  const k = size / 22;
  return (
    <span aria-hidden className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <span className="absolute left-0 top-0 bg-sf-blue" style={{ width: 16 * k, height: 16 * k, borderRadius: 5 * k }} />
      <span
        className="absolute bottom-0 right-0 bg-sf-lime"
        style={{ width: 11 * k, height: 11 * k, borderRadius: 4 * k, boxShadow: `0 0 0 ${2 * k}px ${outline}` }}
      />
    </span>
  );
}

export function Wordmark({ outline }: { outline?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <Mark outline={outline} />
      <span className="font-display text-[22px] font-semibold tracking-[-0.035em]">StackFlex</span>
    </span>
  );
}
