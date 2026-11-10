import { useId } from "react";
import { STYLE_TOKENS, type WorkingStyleId } from "../lib/working-styles";

const LIME = "#D7FF3A";

/** The geometric symbol for each working style. 200×200 viewBox, scales to its container. */
export function StyleSymbol({ style, dark }: { style: WorkingStyleId; dark: boolean }) {
  const uid = useId().replace(/:/g, "");
  const { c1, c2 } = STYLE_TOKENS[style];
  const ink = dark ? "#FFFFFF" : "#0B0B0C";
  const blend = dark ? "screen" : "multiply";
  const g = `sfg${uid}`, gb = `sfgb${uid}`;

  let body: React.ReactNode = null;
  switch (style) {
    case "builder":
      body = (<>
        <rect x="38" y="70" width="74" height="74" rx="16" fill={`url(#${g})`} />
        <rect x="78" y="40" width="74" height="74" rx="16" fill={`url(#${gb})`} fillOpacity=".85" stroke={ink} strokeOpacity=".18" />
        <rect x="96" y="96" width="62" height="62" rx="14" fill="none" stroke={ink} strokeWidth="2.5" />
        <rect x="62" y="132" width="22" height="22" rx="6" fill={LIME} />
      </>);
      break;
    case "operator": {
      const pts: [number, number][] = [[40, 60], [100, 40], [160, 70], [70, 140], [140, 150]];
      body = (<>
        <path d="M40 60 C70 40 80 40 100 40 S150 50 160 70 M40 60 C40 110 60 130 70 140 M100 40 C110 90 130 120 140 150 M70 140 C100 160 120 160 140 150 M160 70 C165 110 150 135 140 150" fill="none" stroke={ink} strokeOpacity=".35" strokeWidth="2.5" />
        {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 1 ? 20 : 14} fill={i === 4 ? LIME : `url(#${g})`} />)}
        <circle cx="100" cy="40" r="31" fill="none" stroke={ink} strokeOpacity=".25" strokeWidth="2" />
      </>);
      break;
    }
    case "creative":
      body = (<>
        <circle cx="82" cy="88" r="46" fill={c1} fillOpacity=".85" />
        <circle cx="122" cy="96" r="42" fill={c2} fillOpacity=".8" style={{ mixBlendMode: blend }} />
        <circle cx="104" cy="132" r="30" fill="#FFC26B" fillOpacity=".85" style={{ mixBlendMode: blend }} />
        <path d="M40 160 C70 130 90 175 120 150 S165 150 170 120" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
        <circle cx="160" cy="48" r="8" fill={LIME} />
      </>);
      break;
    case "researcher": {
      const dots: [number, number][] = [[40, 50], [70, 36], [150, 44], [168, 80], [34, 150], [160, 158]];
      body = (<>
        <circle cx="78" cy="104" r="44" fill={`url(#${g})`} fillOpacity=".9" />
        <circle cx="122" cy="104" r="44" fill={`url(#${gb})`} fillOpacity=".7" />
        <circle cx="100" cy="104" r="62" fill="none" stroke={ink} strokeOpacity=".3" strokeWidth="2" />
        <circle cx="100" cy="104" r="12" fill={LIME} />
        <path d="M40 50 L70 36 M150 44 L168 80 M34 150 L58 132" stroke={ink} strokeOpacity=".35" strokeWidth="1.5" />
        {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill={ink} fillOpacity=".55" />)}
      </>);
      break;
    }
    case "strategist": {
      const grid = [];
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++)
        grid.push(<circle key={`${i}-${j}`} cx={40 + i * 30} cy={40 + j * 30} r="2.5" fill={ink} fillOpacity=".3" />);
      body = (<>
        {grid}
        <path d="M40 160 L40 130 L100 130 L100 70 L160 70 L160 40" fill="none" stroke={`url(#${g})`} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M70 160 L70 100 L130 100" fill="none" stroke={ink} strokeOpacity=".25" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="160" r="9" fill={ink} />
        <circle cx="160" cy="40" r="13" fill={LIME} stroke={ink} strokeWidth="2.5" />
      </>);
      break;
    }
    case "generalist":
      body = (<>
        <circle cx="68" cy="70" r="32" fill={`url(#${g})`} />
        <rect x="108" y="40" width="56" height="56" rx="12" fill={`url(#${gb})`} stroke={ink} strokeOpacity=".2" />
        <path d="M60 162 L94 108 L128 162 Z" fill={c2} fillOpacity=".85" />
        <circle cx="146" cy="138" r="22" fill="none" stroke={ink} strokeWidth="3" />
        <circle cx="146" cy="138" r="7" fill={LIME} />
      </>);
      break;
    case "specialist":
      body = (<>
        <circle cx="100" cy="100" r="74" fill="none" stroke={ink} strokeOpacity=".14" strokeWidth="2" />
        <circle cx="100" cy="100" r="54" fill="none" stroke={ink} strokeOpacity=".24" strokeWidth="2" />
        <path d="M100 46 L136 100 L100 154 L64 100 Z" fill={`url(#${g})`} />
        <path d="M100 46 L136 100 L100 100 Z" fill="#FFFFFF" fillOpacity=".28" />
        <circle cx="100" cy="100" r="8" fill={LIME} />
      </>);
      break;
  }

  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient>
        <linearGradient id={gb} x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c2} /><stop offset="1" stopColor="#FFFFFF" stopOpacity=".9" /></linearGradient>
      </defs>
      {body}
    </svg>
  );
}
