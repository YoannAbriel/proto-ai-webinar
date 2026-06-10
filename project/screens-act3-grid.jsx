/* global React, Icon, EUFlag, useNav */
const { useState: useStateG, useEffect: useEffectG, useRef: useRefG, useMemo: useMemoG } = React;

// ============ POP geography ============
// Coordinates in lon/lat — EUMap projects them via d3-geo to align with the real map.
// labelDx/labelDy/labelAnchor steer city labels away from each other in dense areas.
const POPS = [
  { id: "paris",     city: "Paris",     country: "FR", lon: 2.35,  lat: 48.86, hub: true, deploy: true, req: "12.4k", lat_ms: 4,  labelDx: -10, labelAnchor: "end", labelDy: -8 },
  { id: "oslo",      city: "Oslo",      country: "NO", lon: 10.75, lat: 59.91, deploy: true, req: "1.4k",  lat_ms: 6,  labelDx: 8,  labelDy: 4 },
  { id: "stockholm", city: "Stockholm", country: "SE", lon: 18.07, lat: 59.33, deploy: true, req: "1.6k",  lat_ms: 7,  labelDx: 8,  labelDy: 4 },
  { id: "lyon",      city: "Lyon",      country: "FR", lon: 4.85,  lat: 45.76, req: "3.2k",  lat_ms: 12, labelDx: -8,  labelAnchor: "end", labelDy: 4 },
  { id: "marseille", city: "Marseille", country: "FR", lon: 5.37,  lat: 43.3,  req: "2.1k",  lat_ms: 14, labelDx: -8,  labelAnchor: "end", labelDy: 4 },
  { id: "madrid",    city: "Madrid",    country: "ES", lon: -3.7,  lat: 40.4,  req: "2.8k",  lat_ms: 18, labelDy: 14 },
  { id: "barcelona", city: "Barcelona", country: "ES", lon: 2.17,  lat: 41.4,  req: "1.9k",  lat_ms: 16, labelDy: 14 },
  { id: "lisbon",    city: "Lisbon",    country: "PT", lon: -9.14, lat: 38.7,  req: "1.1k",  lat_ms: 22, labelDx: -8, labelAnchor: "end" },
  { id: "milan",     city: "Milan",     country: "IT", lon: 9.19,  lat: 45.46, req: "2.4k",  lat_ms: 15, labelDy: 14 },
  { id: "rome",      city: "Rome",      country: "IT", lon: 12.5,  lat: 41.9,  req: "1.7k",  lat_ms: 19, labelDy: 14 },
  { id: "brussels",  city: "Brussels",  country: "BE", lon: 4.35,  lat: 50.85, req: "1.5k",  lat_ms: 8,  labelDx: -8, labelAnchor: "end", labelDy: -6 },
  { id: "amsterdam", city: "Amsterdam", country: "NL", lon: 4.9,   lat: 52.37, req: "2.7k",  lat_ms: 10, labelDx: -8, labelAnchor: "end", labelDy: -4 },
  { id: "frankfurt", city: "Frankfurt", country: "DE", lon: 8.68,  lat: 50.11, req: "3.5k",  lat_ms: 9,  labelDy: -4 },
  { id: "munich",    city: "Munich",    country: "DE", lon: 11.58, lat: 48.14, req: "2.2k",  lat_ms: 13, labelDy: 14 },
  { id: "berlin",    city: "Berlin",    country: "DE", lon: 13.4,  lat: 52.52, deploy: true, req: "2.9k",  lat_ms: 14, labelDy: -6 },
  { id: "warsaw",    city: "Warsaw",    country: "PL", lon: 21.0,  lat: 52.23, req: "1.3k",  lat_ms: 21 },
];

// User clusters — represent end-users near each POP. Coordinates are lon/lat;
// projected via the same d3 projection so they stay aligned with the map.
const USERS = [
  { id: "u-lisbon",    lon: -9.5,  lat: 38.6, near: "lisbon"    },
  { id: "u-porto",     lon: -8.6,  lat: 41.1, near: "lisbon"    },
  { id: "u-madrid",    lon: -3.9,  lat: 40.6, near: "madrid"    },
  { id: "u-valencia",  lon: -0.4,  lat: 39.5, near: "madrid"    },
  { id: "u-bcn",       lon: 2.2,   lat: 41.6, near: "barcelona" },
  { id: "u-toulouse",  lon: 1.4,   lat: 43.6, near: "marseille" },
  { id: "u-marseille", lon: 5.4,   lat: 43.4, near: "marseille" },
  { id: "u-lyon",      lon: 4.9,   lat: 45.8, near: "lyon"      },
  { id: "u-geneva",    lon: 6.1,   lat: 46.2, near: "lyon"      },
  { id: "u-paris2",    lon: 1.5,   lat: 47.5, near: "paris"     },
  { id: "u-zurich",    lon: 8.5,   lat: 47.4, near: "munich"    },
  { id: "u-milan",     lon: 9.2,   lat: 45.5, near: "milan"     },
  { id: "u-naples",    lon: 14.3,  lat: 40.8, near: "rome"      },
  { id: "u-rome",      lon: 12.5,  lat: 41.9, near: "rome"      },
  { id: "u-frankfurt", lon: 8.7,   lat: 50.1, near: "frankfurt" },
  { id: "u-hamburg",   lon: 10.0,  lat: 53.5, near: "berlin"    },
  { id: "u-berlin",    lon: 13.4,  lat: 52.5, near: "berlin"    },
  { id: "u-prague",    lon: 14.4,  lat: 50.1, near: "munich"    },
  { id: "u-warsaw",    lon: 21.0,  lat: 52.2, near: "warsaw"    },
  { id: "u-krakow",    lon: 19.9,  lat: 50.1, near: "warsaw"    },
  { id: "u-amsterdam", lon: 4.9,   lat: 52.4, near: "amsterdam" },
  { id: "u-brussels",  lon: 4.4,   lat: 50.8, near: "brussels"  },
  { id: "u-london",    lon: -0.1,  lat: 51.5, near: "brussels"  },
  { id: "u-oslo",      lon: 10.8,  lat: 59.9, near: "oslo"      },
  { id: "u-stockholm", lon: 18.1,  lat: 59.3, near: "stockholm" },
  { id: "u-copenhagen",lon: 12.6,  lat: 55.7, near: "stockholm" },
  { id: "u-gothenburg",lon: 12.0,  lat: 57.7, near: "oslo"      },
];

// ============ Screen 5: AI Grid ============
const GridScreen = () => {
  const { go } = useNav();
  const [hovered, setHovered] = useStateG(null);
  const [selected, setSelected] = useStateG(null);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div className="kicker">Act 3 · Hero</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
          Orange AI Grid — Edge token routing
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)", margin: 0, maxWidth: 900, lineHeight: 1.5 }}>
          Your model runs bare-metal across the <strong style={{ color: "#000" }}>Cloud Avenue regions — Paris, Oslo, Stockholm and Berlin</strong>, and is served from <strong style={{ color: "#000" }}>Orange edge POPs across Europe</strong>. Every request is routed to the POP closest to the end user — never outside the EU. <span style={{ color: "var(--orange)", fontWeight: 600 }}>Click any POP to drill down.</span>
        </p>
      </div>

      {/* Hero map */}
      <div className="panel" style={{ padding: 0, marginBottom: 16, overflow: "hidden", background: "#0a0e1a", position: "relative" }}>
        <GridMap hovered={hovered} setHovered={setHovered} selected={selected} setSelected={setSelected} />
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)", gap: 16, marginBottom: 16 }}>
        <PopList hovered={hovered} setHovered={setHovered} onSelect={setSelected} />
        <HowItWorks />
      </div>

      {/* Differentiator banner */}
      <div className="panel" style={{
        padding: "18px 24px",
        background: "#fff",
        borderLeft: "4px solid var(--orange)",
        boxShadow: "inset 0 0 0 1px var(--panel-border)",
        marginBottom: 16,
        display: "flex", gap: 16, alignItems: "center",
      }}>
        <div style={{ width: 40, height: 40, background: "var(--orange)", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon name="bolt" size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--orange)", marginBottom: 2 }}>Orange vision</div>
          <div style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.5 }}>
            <strong style={{ color: "#000" }}>This edge AI Grid layer does not exist at Gcore, OVH or Scaleway.</strong> Orange is the only EU operator able to combine sovereign bare metal and edge routing on its own fibre network.
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button onClick={() => go("edge")} className="btn btn-primary btn-lg">
          View measured impact
          <Icon name="arrow" size={14} />
        </button>
      </div>

      {/* POP detail drill-down panel */}
      {selected && (
        <PopDetailPanel
          popId={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

// ============ POP detail drill-down panel ============
const PopDetailPanel = ({ popId, onClose }) => {
  const pop = POPS.find(p => p.id === popId);
  if (!pop) return null;

  const isDeploy = pop.hub || pop.deploy;            // runs the model bare metal
  const carbon = (window.CARBON_INTENSITY || {})[pop.country] || 250;

  // Per-POP details — deterministic by ID so reopening shows same numbers
  const seed = popId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = (n) => (Math.sin(seed * n) + 1) / 2; // 0..1

  const data = {
    req: parseFloat(pop.req) * 1000, // req/min as a number
    p50: pop.lat_ms,
    p99: pop.lat_ms + Math.round(15 + r(2) * 25),
    cacheHit: 68 + Math.round(r(3) * 22),
    capacity: pop.hub ? 248 : pop.deploy ? (pop.id === "lyon" ? 64 : 40) : Math.round(40 + r(4) * 60),
    used: 0, // computed below
    uptime: 99.95 + r(5) * 0.05,
    peeringIxps: pop.hub ? ["FranceIX", "AMS-IX", "DE-CIX"] : ["FranceIX", "DE-CIX"].slice(0, 1 + Math.round(r(6) * 1)),
    cacheRefreshed: isDeploy ? "—" : `${Math.round(r(7) * 28 + 2)} min ago`,
    // Sparkline series (24 points)
    spark: Array.from({ length: 24 }, (_, i) => 50 + 40 * Math.sin(i * 0.6 + seed) + 20 * Math.cos(i * 0.3 + seed * 2)),
    // Top countries served (varies by pop region)
    topCountries: topCountriesFor(pop),
  };
  data.used = Math.round(data.capacity * (0.4 + r(8) * 0.45));

  return (
    <>
      <div className="pop-overlay" onClick={onClose} />
      <aside className="pop-panel">
        <header className="pop-panel-head">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span className="kicker" style={{ margin: 0, color: "var(--ink-faint)" }}>POP detail</span>
              {pop.hub
                ? <span className="chip chip-orange" style={{ fontSize: 10 }}>HUB · BARE METAL</span>
                : pop.deploy
                ? <span className="chip chip-orange" style={{ fontSize: 10 }}>BARE METAL</span>
                : <span className="chip chip-outline" style={{ fontSize: 10 }}>EDGE</span>}
            </div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em" }}>
              {pop.city}
              <span style={{ marginLeft: 8, fontSize: 14, color: "var(--ink-faint)", fontWeight: 400 }}>{pop.country}</span>
            </h2>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
              gcore.orange-ai.eu/pop/{pop.id}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="pop-close">
            <Icon name="close" size={16} />
          </button>
        </header>

        <div className="pop-panel-body">
          {/* Quick stats */}
          <div className="pop-stats">
            <PopStat label="Req / min"   value={data.req.toLocaleString()} />
            <PopStat label="Latency p50" value={`${data.p50} ms`} highlight={data.p50 < 15 ? "good" : null} />
            <PopStat label="Latency p99" value={`${data.p99} ms`} highlight={data.p99 > 40 ? "warn" : null} />
            <PopStat label="Cache hit"   value={isDeploy ? "—" : `${data.cacheHit}%`} />
          </div>

          {/* Sparkline */}
          <section className="pop-section">
            <div className="pop-section-head">
              <span>Req / min · last 24 hours</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{Math.round(data.spark[data.spark.length - 1])} now</span>
            </div>
            <Sparkline series={data.spark} />
          </section>

          {/* Top countries */}
          <section className="pop-section">
            <div className="pop-section-head">
              <span>Top countries served</span>
              <span style={{ fontSize: 10, color: "var(--ink-faint)" }}>by token volume</span>
            </div>
            {data.topCountries.map((c, i) => (
              <div key={c.flag} style={{ display: "grid", gridTemplateColumns: "24px 1fr 60px 60px", gap: 10, alignItems: "center", padding: "6px 0", borderBottom: i < data.topCountries.length - 1 ? "1px solid var(--line)" : 0 }}>
                <span style={{ fontSize: 16 }}>{c.flag}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                <div style={{ height: 4, background: "var(--color-grey-200)" }}>
                  <div style={{ width: `${c.share}%`, height: "100%", background: "var(--orange)" }} />
                </div>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", textAlign: "right" }}>{c.share}%</span>
              </div>
            ))}
          </section>

          {/* Capacity */}
          <section className="pop-section">
            <div className="pop-section-head">
              <span>Capacity headroom</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{data.used} / {data.capacity}{isDeploy ? " GPU" : " edge cores"}</span>
            </div>
            <div style={{ height: 8, background: "var(--color-grey-200)", overflow: "hidden" }}>
              <div style={{ width: `${(data.used / data.capacity) * 100}%`, height: "100%", background: "var(--orange)" }} />
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: "var(--ink-faint)" }}>
              {Math.round((1 - data.used / data.capacity) * 100)}% headroom · auto-scale at 80%
            </div>
          </section>

          {/* Peering & infra */}
          <section className="pop-section">
            <div className="pop-section-head"><span>Peering & connectivity</span></div>
            <PopRow label="Internet exchanges">
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {data.peeringIxps.map(x => <span key={x} className="chip chip-outline" style={{ fontSize: 10 }}>{x}</span>)}
              </div>
            </PopRow>
            <PopRow label="Fibre backbone">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{pop.hub ? "Hub · 14 outbound peers" : pop.deploy ? "Bare-metal node · weights synced from Paris" : "Connected to Paris hub (≤ 8 ms RTT)"}</span>
            </PopRow>
            <PopRow label="Provider">
              <span style={{ fontSize: 12 }}>Orange Wholesale International</span>
            </PopRow>
            <PopRow label="Uptime (30d)">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#1e8e1e" }}>{data.uptime.toFixed(3)}%</span>
            </PopRow>
            {!isDeploy && (
              <PopRow label="Cache refreshed">
                <span style={{ fontSize: 12 }}>{data.cacheRefreshed}</span>
              </PopRow>
            )}
          </section>

          {/* Deployment & carbon */}
          <section className="pop-section">
            <div className="pop-section-head"><span>Deployment &amp; carbon</span></div>
            <PopRow label="Serving mode">
              <span className="chip chip-outline" style={{ fontSize: 10 }}>{isDeploy ? "Bare-metal inference" : "Edge cache + route"}</span>
            </PopRow>
            <PopRow label="Hardware">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{isDeploy ? "H100 · local GPU" : "Routing only"}</span>
            </PopRow>
            <PopRow label="Grid carbon">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: carbon < 120 ? "#1e8e1e" : "var(--ink-soft)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="leaf" size={12} style={{ color: carbon < 120 ? "#1e8e1e" : "var(--ink-faint)" }} />{carbon} g/kWh
              </span>
            </PopRow>
          </section>

          {/* Sovereign attestation */}
          <section className="pop-section" style={{ background: "rgba(0,51,153,0.04)", border: "1px solid rgba(0,51,153,0.2)", borderLeft: "3px solid var(--eu)", padding: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <EUFlag size={12} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Sovereign attestation</div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                  {pop.country === "FR" || pop.country === "BE" || pop.country === "DE" || pop.country === "NL" ||
                   pop.country === "ES" || pop.country === "IT" || pop.country === "PT" || pop.country === "PL"
                    ? "Operated in-country by Orange. No third-country data access path. NIS2-attested."
                    : "EU-hosted. NIS2-attested."}
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }}>
              <Icon name="chart" size={12} />
              Full metrics
            </button>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }}>
              <Icon name="receipt" size={12} />
              Audit log
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const PopStat = ({ label, value, highlight }) => {
  const c = highlight === "good" ? "#1e8e1e" : highlight === "warn" ? "#b45309" : "#000";
  return (
    <div className="panel" style={{ padding: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)", color: c }}>{value}</div>
    </div>
  );
};

const PopRow = ({ label, children }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--line)", fontSize: 12, gap: 12 }}>
    <span style={{ color: "var(--ink-faint)" }}>{label}</span>
    <div style={{ textAlign: "right" }}>{children}</div>
  </div>
);

const Sparkline = ({ series }) => {
  const w = 320, h = 60;
  const min = Math.min(...series), max = Math.max(...series);
  const range = max - min || 1;
  const toX = (i) => (i / (series.length - 1)) * w;
  const toY = (v) => h - ((v - min) / range) * (h - 8) - 4;
  const path = series.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const area = `${path} L${toX(series.length - 1).toFixed(1)},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 60, display: "block" }} preserveAspectRatio="none">
      <path d={area} fill="rgba(255,121,0,0.12)" />
      <path d={path} fill="none" stroke="var(--orange)" strokeWidth="1.5" />
      <circle cx={toX(series.length - 1)} cy={toY(series[series.length - 1])} r="3" fill="var(--orange)" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
};

function topCountriesFor(pop) {
  // Pick a region-appropriate top-5 list. Shares are illustrative.
  const FR = [["🇫🇷","France",42],["🇧🇪","Belgium",18],["🇨🇭","Switzerland",14],["🇱🇺","Luxembourg",9],["🇩🇪","Germany",8]];
  const ES = [["🇪🇸","Spain",54],["🇵🇹","Portugal",17],["🇫🇷","France",12],["🇦🇩","Andorra",6],["🇲🇦","Morocco (cached)",4]];
  const IT = [["🇮🇹","Italy",58],["🇨🇭","Switzerland",13],["🇸🇮","Slovenia",9],["🇦🇹","Austria",8],["🇸🇲","San Marino",3]];
  const DE = [["🇩🇪","Germany",52],["🇦🇹","Austria",16],["🇨🇿","Czechia",10],["🇨🇭","Switzerland",9],["🇳🇱","Netherlands",6]];
  const PL = [["🇵🇱","Poland",58],["🇩🇪","Germany",12],["🇨🇿","Czechia",9],["🇸🇰","Slovakia",8],["🇱🇹","Lithuania",6]];
  const BE = [["🇧🇪","Belgium",48],["🇳🇱","Netherlands",22],["🇱🇺","Luxembourg",10],["🇫🇷","France",8],["🇩🇪","Germany",6]];
  const NL = [["🇳🇱","Netherlands",56],["🇧🇪","Belgium",14],["🇩🇪","Germany",12],["🇬🇧","United Kingdom",8],["🇩🇰","Denmark",5]];
  const PT = [["🇵🇹","Portugal",62],["🇪🇸","Spain",18],["🇫🇷","France",8],["🇨🇻","Cape Verde",5],["🇦🇴","Angola (cached)",3]];

  const byCountry = { FR, ES, IT, DE, PL, BE, NL, PT };
  const set = byCountry[pop.country] || FR;
  return set.map(([flag, name, share]) => ({ flag, name, share }));
}

// ============ Hero map (uses real Europe geography via d3-geo) ============
const GridMap = ({ hovered, setHovered, selected, setSelected }) => {
  const [tokens, setTokens] = useStateG([]);
  const nextId = useRefG(0);

  // Spawn tokens continuously
  useEffectG(() => {
    let alive = true;
    const spawn = () => {
      if (!alive) return;
      const user = USERS[Math.floor(Math.random() * USERS.length)];
      const target = POPS.find(p => p.id === user.near);
      if (target) {
        const direction = Math.random() < 0.5 ? "in" : "out";
        const id = nextId.current++;
        const dur = 1100 + Math.random() * 700;
        setTokens(ts => [...ts, { id, userId: user.id, popId: target.id, direction, dur }]);
        setTimeout(() => setTokens(ts => ts.filter(t => t.id !== id)), dur + 200);
      }
      setTimeout(spawn, 180 + Math.random() * 220);
    };
    spawn();
    return () => { alive = false; };
  }, []);

  // Fibre mesh edges between cities (Orange backbone)
  const MESH = [
    ["amsterdam", "frankfurt"], ["amsterdam", "brussels"], ["brussels", "paris"],
    ["frankfurt", "munich"], ["munich", "milan"], ["milan", "rome"],
    ["berlin", "frankfurt"], ["berlin", "warsaw"], ["warsaw", "munich"],
    ["paris", "lyon"], ["lyon", "marseille"], ["marseille", "barcelona"],
    ["barcelona", "madrid"], ["madrid", "lisbon"], ["paris", "frankfurt"],
    ["oslo", "stockholm"], ["stockholm", "berlin"], ["oslo", "amsterdam"],
  ];

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1.7/1", overflow: "hidden", background: "#0a0e1a" }}>
      <EUMap
        theme="dark"
        width={1000}
        height={600}
        center={[12, 54]}
        scaleFactor={0.66}
        pops={POPS}
        hoveredPop={hovered}
        selectedPop={selected}
        onPopHover={setHovered}
        onPopClick={setSelected}
        showLabels={true}
      >
        {({ projection, projectedPops }) => {
          // Resolve POPs by ID for the layers we inject
          const byId = Object.fromEntries(projectedPops.map(p => [p.id, p]));
          const projectUser = (u) => {
            const xy = projection([u.lon, u.lat]);
            return xy ? { x: xy[0], y: xy[1] } : null;
          };
          const userPositions = Object.fromEntries(USERS.map(u => [u.id, { ...u, ...(projectUser(u) || { x: 0, y: 0 }) }]));
          const paris = byId.paris;

          return (
            <>
              {/* Fibre mesh — dashed faint orange */}
              <g>
                {MESH.map(([a, b], i) => {
                  const A = byId[a], B = byId[b];
                  if (!A || !B) return null;
                  return (
                    <line key={i}
                      x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                      stroke="rgba(255,121,0,0.18)" strokeWidth="0.6" strokeDasharray="2 3"
                    />
                  );
                })}
              </g>

              {/* Backbone: every POP → Paris (the inference origin) */}
              <g>
                {projectedPops.filter(p => !p.hub).map(p => (
                  paris ? (
                    <line key={p.id}
                      x1={p.x} y1={p.y} x2={paris.x} y2={paris.y}
                      stroke="rgba(255,121,0,0.22)" strokeWidth="0.7"
                    />
                  ) : null
                ))}
              </g>

              {/* User markers (projected via lat/lon) */}
              {Object.values(userPositions).map((u, i) => (
                <g key={u.id}>
                  <circle cx={u.x} cy={u.y} r="2.5" fill="rgba(255,255,255,0.85)" />
                  <circle cx={u.x} cy={u.y} r="4" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6">
                    <animate attributeName="r" values="2.5;7;2.5" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.15}s`} />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.15}s`} />
                  </circle>
                </g>
              ))}

              {/* Token streams */}
              {tokens.map(t => {
                const u = userPositions[t.userId];
                const p = byId[t.popId];
                if (!u || !p) return null;
                return <TokenStream key={t.id} from={t.direction === "in" ? u : p} to={t.direction === "in" ? p : u} direction={t.direction} dur={t.dur} />;
              })}
            </>
          );
        }}
      </EUMap>

      {/* Tooltip */}
      {hovered && (() => {
        const proj = makeProjection();
        const p = POPS.find(pp => pp.id === hovered);
        if (!p) return null;
        const xy = proj([p.lon, p.lat]);
        if (!xy) return null;
        const leftPct = (xy[0] / 1000) * 100;
        const topPct  = (xy[1] / 600) * 100;
        return <PopTooltip pop={p} leftPct={leftPct} topPct={topPct} />;
      })()}

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 16, right: 16,
        background: "rgba(10,14,26,0.88)", border: "1px solid rgba(255,121,0,0.25)",
        padding: "10px 14px",
        fontSize: 11, color: "#fff",
        display: "flex", flexDirection: "column", gap: 6,
      }}>
        <LegendRow color="#ff7900" filled label="Bare metal inference — Paris" />
        <LegendRow color="#ff7900" label="Orange edge POP — token routing" small />
        <LegendRow color="#ffffff" dot label="End user — served by closest POP" small />
        <LegendRow line label="Orange fibre backbone (EU sovereign)" small />
      </div>

      {/* Live counter */}
      <div style={{
        position: "absolute", top: 16, right: 16,
        background: "rgba(10,14,26,0.88)", border: "1px solid rgba(255,121,0,0.25)",
        padding: "10px 16px",
        color: "#fff",
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Tokens routed · last min</div>
        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--orange)" }}>
          <CountUp />
        </div>
      </div>

      {/* POP count badge */}
      <div style={{
        position: "absolute", top: 16, left: 16,
        background: "rgba(10,14,26,0.88)", border: "1px solid rgba(255,121,0,0.25)",
        padding: "10px 16px", color: "#fff",
      }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 4 }}>
          <EUFlag size={9} /> EU coverage
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, marginTop: 2 }}>
          {POPS.length} <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Active POPs</span>
        </div>
      </div>
    </div>
  );
};

// Mercator helper that mirrors EUMap's projection (used for tooltips)
const makeProjection = () => {
  // Returns a function (lon, lat) -> [x, y] in 1000x600 coords.
  // Mirror the EUMap fit logic by sampling a few European bounds.
  if (!window.d3) return ([lon, lat]) => [
    ((lon + 10) / 35) * 1000,
    ((62 - lat) / 28) * 600,
  ];
  // d3 projection matching the grid EUMap (center [12,54], scaleFactor 0.66 → scale 660):
  const proj = d3.geoMercator()
    .center([12, 54])
    .scale(660)
    .translate([500, 300]);
  return proj;
};

const TokenStream = ({ from, to, direction, dur }) => {
  if (!from || !to) return null;
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x, dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const cx = mx + (-dy / len) * 10;
  const cy = my + ( dx / len) * 10;
  const path = `M${from.x},${from.y} Q${cx},${cy} ${to.x},${to.y}`;

  return (
    <g>
      <path d={path} fill="none" stroke="rgba(255,121,0,0.18)" strokeWidth="0.8">
        <animate attributeName="stroke-opacity" values="0;0.4;0" dur={`${dur}ms`} repeatCount="1" />
      </path>
      <circle r={direction === "in" ? 2 : 2.5} fill={direction === "in" ? "#ffffff" : "#ff7900"} opacity="0.9">
        <animateMotion path={path} dur={`${dur}ms`} fill="freeze" />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur={`${dur}ms`} fill="freeze" />
      </circle>
    </g>
  );
};

const PopTooltip = ({ pop, leftPct, topPct }) => (
  <div style={{
    position: "absolute",
    left: `${leftPct}%`, top: `${topPct}%`,
    transform: "translate(-50%, calc(-100% - 18px))",
    background: "#000", color: "#fff",
    border: "1px solid var(--orange)",
    padding: "10px 14px",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    fontSize: 12,
    zIndex: 5,
  }}>
    <div style={{ fontWeight: 700, fontSize: 14, color: pop.hub ? "var(--orange)" : "#fff" }}>{pop.city} POP</div>
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
      <strong style={{ color: "#fff" }}>{pop.req}</strong> req/min · <strong style={{ color: "#fff" }}>{pop.lat_ms}ms</strong> local latency
    </div>
    {pop.hub && <div style={{ fontSize: 11, color: "var(--orange)", marginTop: 2, fontWeight: 700 }}>↳ Bare metal inference</div>}
  </div>
);

const LegendRow = ({ color, label, filled, dot, line, small }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    {line ? (
      <span style={{ width: 16, height: 1, background: "rgba(255,121,0,0.5)", display: "inline-block" }} />
    ) : (
      <span style={{
        width: dot ? 6 : (small ? 8 : 10),
        height: dot ? 6 : (small ? 8 : 10),
        background: filled ? color : "transparent",
        border: `${filled ? 1 : 1.5}px solid ${color}`,
        borderRadius: "50%",
        display: "inline-block",
        boxShadow: filled ? `0 0 0 2px rgba(255,121,0,0.2)` : "none",
      }} />
    )}
    <span style={{ fontSize: 11, opacity: 0.85 }}>{label}</span>
  </div>
);

const CountUp = () => {
  const [n, setN] = useStateG(847123);
  useEffectG(() => {
    const t = setInterval(() => setN(x => x + Math.floor(20 + Math.random() * 90)), 200);
    return () => clearInterval(t);
  }, []);
  return n.toLocaleString();
};

// ============ POP list ============
const PopList = ({ hovered, setHovered, onSelect }) => {
  const total = POPS.reduce((s, p) => s + parseFloat(p.req), 0);
  return (
    <div className="panel" style={{ padding: 0 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", margin: 0 }}>Active POPs</h3>
        <span className="faint" style={{ fontSize: 11 }}>14/14 · 100% healthy</span>
      </div>
      <div style={{ maxHeight: 380, overflowY: "auto" }}>
        {POPS.map((p, i) => {
          const pct = (parseFloat(p.req) / total) * 100;
          return (
            <div key={p.id}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect && onSelect(p.id)}
              style={{
                padding: "10px 20px",
                display: "grid", gridTemplateColumns: "20px 1fr 70px 60px", gap: 12, alignItems: "center",
                borderBottom: i < POPS.length - 1 ? "1px solid var(--line)" : 0,
                background: hovered === p.id ? "var(--color-grey-100)" : "transparent",
                transition: "background var(--dur-fast)",
                cursor: "pointer",
              }}>
              <span style={{ width: 8, height: 8, background: "var(--color-success)", borderRadius: "50%" }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {p.city}
                  {p.hub && <span className="chip chip-orange" style={{ fontSize: 9, marginLeft: 6, padding: "1px 5px" }}>HUB</span>}
                </div>
                <div style={{ fontSize: 10, color: "var(--ink-faint)" }}>{p.country}</div>
              </div>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", textAlign: "right" }}>
                {p.req}
                <div style={{ fontSize: 9, color: "var(--ink-faint)" }}>req/min</div>
              </div>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", textAlign: "right" }}>
                {p.lat_ms}<span style={{ fontSize: 9, color: "var(--ink-faint)" }}>ms</span>
                <div style={{ height: 3, background: "var(--color-grey-200)", marginTop: 3 }}>
                  <div style={{ width: `${pct * 4}%`, height: "100%", background: "var(--orange)" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ How it works ============
const HowItWorks = () => {
  const steps = [
    {
      n: "01",
      title: "Deployed across Cloud Avenue regions",
      sub: "Oslo · Stockholm · Berlin · Paris",
      desc: "Bare-metal inference on NVIDIA H100 GPUs in Orange Cloud Avenue regions — choose low-carbon Nordic/French grids for residency and latency. Data stays in the EU.",
      icon: "server",
    },
    {
      n: "02",
      title: "KV cache replicated to 14 edge POPs",
      sub: "NVIDIA Dynamo · disaggregated serving",
      desc: "Each Orange edge POP keeps a local NVIDIA Dynamo KV cache. First hop = closest POP.",
      icon: "grid",
    },
    {
      n: "03",
      title: "Token served via the closest POP",
      sub: "Never outside EU",
      desc: "The end user receives tokens from the closest edge POP, via the Orange fibre backbone.",
      icon: "bolt",
    },
  ];

  return (
    <div className="panel" style={{ padding: 0 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", margin: 0 }}>How it works</h3>
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{
              width: 48, flexShrink: 0,
              background: i === steps.length - 1 ? "var(--orange)" : "#000",
              color: "#fff",
              padding: "10px 6px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", opacity: 0.6 }}>STEP</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{s.n}</div>
            </div>
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{s.title}</div>
                <span className="chip chip-outline" style={{ fontSize: 10 }}>{s.sub}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4, lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { GridScreen, POPS });
