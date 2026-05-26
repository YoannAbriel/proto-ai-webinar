/* global React, d3, topojson */
const { useState: useStateM, useEffect: useEffectM, useMemo: useMemoM } = React;

// Cache loaded topology across renders + screens
let _topoCache = null;
let _topoPromise = null;
const loadTopo = () => {
  if (_topoCache) return Promise.resolve(_topoCache);
  if (_topoPromise) return _topoPromise;
  _topoPromise = fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
    .then(r => r.json())
    .then(t => { _topoCache = t; return t; });
  return _topoPromise;
};

// ISO numeric IDs of European countries (covers EU + UK + Switzerland + Norway + Balkans)
const EUROPE_IDS = new Set([
  "008","020","040","056","070","100","112","191","196","203","208","233","246","250","268","270",
  "276","292","300","336","348","352","372","380","428","438","440","442","470","492","498","499",
  "528","578","616","620","642","643","674","688","703","705","724","752","756","804","807","826",
  "831","832","833"
]);

const useEuropeFeatures = () => {
  const [topo, setTopo] = useStateM(null);
  useEffectM(() => {
    let mounted = true;
    loadTopo().then(t => { if (mounted) setTopo(t); }).catch(() => {});
    return () => { mounted = false; };
  }, []);
  return useMemoM(() => {
    if (!topo || !window.topojson || !window.d3) return null;
    const all = topojson.feature(topo, topo.objects.countries).features;
    const europe = all.filter(f => EUROPE_IDS.has(String(f.id).padStart(3, "0")));
    return { all, europe };
  }, [topo]);
};

// ============ EU Map component ============
// theme: "dark" (hero) or "light" (sovereignty card)
// width/height in px; renders a square SVG of that size with viewBox
const EUMap = ({
  width = 1000,
  height = 600,
  theme = "dark",
  showLabels = true,
  showPOPs = true,
  pops = [],
  hoveredPop = null,
  selectedPop = null,
  onPopHover = () => {},
  onPopClick = null,
  children,
}) => {
  const data = useEuropeFeatures();
  if (!data) return <MapSkeleton width={width} height={height} theme={theme} />;

  // Mercator projection centred on Europe with a hardcoded scale tuned for the POPs.
  const projection = d3.geoMercator()
    .center([10, 49])
    .scale(width * 0.88)
    .translate([width / 2, height / 2]);
  const pathGen = d3.geoPath().projection(projection);

  // Project each POP via the same projection so dots align with country shapes
  const projectedPops = pops.map(p => {
    const xy = projection([p.lon, p.lat]);
    return { ...p, x: xy ? xy[0] : 0, y: xy ? xy[1] : 0 };
  });

  const isDark = theme === "dark";
  const colors = isDark ? {
    bg: "#0a0e1a",
    countryFill: "rgba(255,121,0,0.14)",
    countryStroke: "rgba(255,121,0,0.45)",
    countryStrokeWidth: 0.6,
    nonEUFill: "rgba(255,255,255,0.035)",
    nonEUStroke: "rgba(255,255,255,0.1)",
    grid: "rgba(255,255,255,0.04)",
    label: "rgba(255,255,255,0.25)",
  } : {
    bg: "#f7f4ef",
    countryFill: "rgba(255,121,0,0.14)",
    countryStroke: "rgba(255,121,0,0.55)",
    countryStrokeWidth: 0.7,
    nonEUFill: "rgba(0,0,0,0.04)",
    nonEUStroke: "rgba(0,0,0,0.15)",
    grid: "rgba(0,0,0,0.05)",
    label: "rgba(0,0,0,0.4)",
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "100%", display: "block", background: colors.bg }}
    >
      <defs>
        <radialGradient id={`euGlow-${theme}`} cx="42%" cy="40%" r="55%">
          <stop offset="0%" stopColor={isDark ? "rgba(255,121,0,0.10)" : "rgba(255,121,0,0.06)"} />
          <stop offset="100%" stopColor="rgba(255,121,0,0)" />
        </radialGradient>
        <pattern id={`mapdots-${theme}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="0.6" fill={colors.grid} />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect x="0" y="0" width={width} height={height} fill={`url(#mapdots-${theme})`} />
      <rect x="0" y="0" width={width} height={height} fill={`url(#euGlow-${theme})`} />

      {/* Non-EU countries (subtle) */}
      <g>
        {data.all.filter(f => !EUROPE_IDS.has(String(f.id).padStart(3, "0"))).map((f, i) => (
          <path key={`oth-${i}`} d={pathGen(f)} fill={colors.nonEUFill} stroke={colors.nonEUStroke} strokeWidth="0.3" />
        ))}
      </g>

      {/* Europe countries — highlighted */}
      <g>
        {data.europe.map((f, i) => (
          <path
            key={`eu-${i}`}
            d={pathGen(f)}
            fill={colors.countryFill}
            stroke={colors.countryStroke}
            strokeWidth={colors.countryStrokeWidth}
            strokeLinejoin="round"
          />
        ))}
      </g>

      {/* Inject extra layers (connections, tokens) */}
      {children && children({ projection, pathGen, projectedPops })}

      {/* POPs */}
      {showPOPs && projectedPops.map(p => (
        <PopMarker key={p.id} pop={p} hovered={hoveredPop === p.id} onHover={onPopHover} onClick={onPopClick} selected={selectedPop === p.id} showLabel={showLabels} theme={theme} />
      ))}
    </svg>
  );
};

const PopMarker = ({ pop, hovered, selected, onHover, onClick, showLabel, theme }) => {
  const isHub = pop.hub;
  const r = isHub ? 6 : 4;
  const isDark = theme === "dark";
  const labelDx = pop.labelDx ?? (r + 5);
  const labelDy = pop.labelDy ?? 4;
  const labelAnchor = pop.labelAnchor || "start";
  return (
    <g
      style={{ cursor: onClick ? "pointer" : "default" }}
      onMouseEnter={() => onHover(pop.id)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(pop.id); } : undefined}
    >
      {/* Selection ring */}
      {selected && (
        <circle cx={pop.x} cy={pop.y} r={r + 10} fill="none" stroke="#ff7900" strokeWidth="2" opacity="0.9" />
      )}
      {/* Pulse */}
      <circle cx={pop.x} cy={pop.y} r={r} fill="none" stroke="#ff7900" strokeWidth="1" opacity="0.5">
        <animate attributeName="r" values={`${r};${r + 10};${r}`} dur={isHub ? "1.8s" : "2.4s"} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur={isHub ? "1.8s" : "2.4s"} repeatCount="indefinite" />
      </circle>
      {/* Node */}
      <circle cx={pop.x} cy={pop.y} r={selected ? r + 1.5 : r} fill="#ff7900" stroke={isDark ? "#fff" : "#000"} strokeWidth={hovered || selected ? 1.5 : 0.6} />
      {isHub && <circle cx={pop.x} cy={pop.y} r="2" fill="#fff" />}
      {/* Label */}
      {showLabel && (
        <>
          <text
            x={pop.x + labelDx} y={pop.y + labelDy}
            fontSize={isHub ? 12 : 10}
            fontWeight={isHub ? 700 : 600}
            textAnchor={labelAnchor}
            fill={isDark ? (isHub ? "#fff" : "rgba(255,255,255,0.92)") : (isHub ? "#000" : "rgba(0,0,0,0.78)")}
            fontFamily="var(--font-sans)"
            stroke={isDark ? "rgba(10,14,26,0.85)" : "rgba(255,255,255,0.85)"}
            strokeWidth="3" paintOrder="stroke"
            style={{ pointerEvents: "none" }}
          >
            {pop.city}
          </text>
          {isHub && pop.hubLabel !== false && (
            <text
              x={pop.x + labelDx} y={pop.y + labelDy + 13}
              fontSize="9" fill="var(--orange)" fontWeight="600" fontFamily="var(--font-sans)"
              textAnchor={labelAnchor}
              stroke={isDark ? "rgba(10,14,26,0.85)" : "rgba(255,255,255,0.85)"} strokeWidth="3" paintOrder="stroke"
              style={{ pointerEvents: "none", letterSpacing: "0.04em" }}
            >
              BARE METAL · MISTRAL-24B
            </text>
          )}
        </>
      )}
    </g>
  );
};

// ============ Map skeleton while loading ============
const MapSkeleton = ({ width, height, theme }) => (
  <div style={{
    width: "100%", height: "100%",
    background: theme === "dark" ? "#0a0e1a" : "var(--color-grey-100)",
    display: "grid", placeItems: "center",
    color: theme === "dark" ? "rgba(255,255,255,0.4)" : "var(--ink-faint)",
    fontSize: 12,
  }}>
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 24, height: 24, border: "2px solid var(--orange)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 10px" }} />
      Chargement de la carte EU…
    </div>
  </div>
);

Object.assign(window, { EUMap, loadTopo, EUROPE_IDS });
