// StackFlex mark: ultramarine rounded square + offset lime square with a cut-out ring in the background color.
// Proportions from the 22px header mark: blue 16 (r5), lime 11 (r4), ring 2.

/** `size` is px or any CSS length (e.g. cqw, so export artwork scales the mark with the image). */
export function Mark({ size = 22, outline = "#FFFFFF" }: { size?: number | string; outline?: string }) {
  const em = (px: number) => `${px / 22}em`;
  return (
    <span aria-hidden className="relative inline-block shrink-0" style={{ fontSize: size, width: "1em", height: "1em" }}>
      <span className="absolute left-0 top-0 bg-sf-blue" style={{ width: em(16), height: em(16), borderRadius: em(5) }} />
      <span
        className="absolute bottom-0 right-0 bg-sf-lime"
        style={{ width: em(11), height: em(11), borderRadius: em(4), boxShadow: `0 0 0 ${em(2)} ${outline}` }}
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
