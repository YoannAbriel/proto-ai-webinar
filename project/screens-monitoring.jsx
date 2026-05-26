/* global React, Icon, EUFlag, useNav */
const { useState: useStateMon, useEffect: useEffectMon, useMemo: useMemoMon, useRef: useRefMon } = React;

// ============ Monitoring screen ============
const MonitoringScreen = () => {
  const { go } = useNav();
  const [range, setRange] = useStateMon("1h");
  const [popFilter, setPopFilter] = useStateMon("all");
  const [tick, setTick] = useStateMon(0);

  // Live tick to drive the streaming series
  useEffectMon(() => {
    const id = setInterval(() => setTick(t => t + 1), 1500);
    return () => clearInterval(id);
  }, []);

  // Synthetic time series — driven by tick so charts feel alive without becoming noisy
  const series = useMemoMon(() => buildSeries(range, tick), [range, tick]);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-head" style={{ alignItems: "flex-end" }}>
        <div>
          <div className="kicker" style={{ color: "var(--ink-faint)" }}>Operations · Monitoring</div>
          <h1>Live monitoring</h1>
          <p className="subtitle">
            Real-time view of your deployed endpoint <strong style={{ color: "#000" }}>mistral-small-24b · paris-1</strong>. Per-POP latency, throughput, GPU pressure and cost burn — sovereign telemetry, never leaves the EU.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="chip chip-pill" style={{ background: "rgba(50,200,50,0.12)", color: "#1e8e1e" }}>
            <span className="dot" style={{ background: "#1e8e1e", boxShadow: "0 0 0 3px rgba(50,200,50,0.2)" }} />
            Live
          </span>
          <RangePicker value={range} onChange={setRange} />
          <button className="btn btn-ghost btn-sm">
            <Icon name="download" size={12} />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginBottom: 16 }}>
        <BigKPI label="Requests / min"       value={(2410 + (tick * 7 % 130)).toLocaleString()}            delta="+12%" trend="up" />
        <BigKPI label="P50 latency (Paris)"  value={`${83 + (tick % 5)} ms`}                                delta="−4 ms" trend="down" good />
        <BigKPI label="P99 latency"          value={`${158 + (tick % 12)} ms`}                              delta="+8 ms" trend="up" warn />
        <BigKPI label="Token throughput"     value={`${(1840 + (tick * 3 % 90)).toLocaleString()} tok/s`}   delta="+4%" trend="up" />
        <BigKPI label="GPU utilisation"      value={`${62 + (tick % 9)}%`}                                  delta="+3 pp" trend="up" />
        <BigKPI label="Cost burn (today)"    value={`€${(57.6 + tick * 0.04).toFixed(2)}`}                  delta="of €60/day cap" trend="flat" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", gap: 16, marginBottom: 16 }}>
        <ChartPanel
          title="Requests / second"
          subtitle="last 60 minutes · per second average"
          unit="req/s"
          series={series.rps}
          color="var(--orange)"
          areaColor="rgba(255,121,0,0.12)"
          range={[0, 80]}
        />
        <ChartPanel
          title="Latency p50 vs p99"
          subtitle="all POPs · ms"
          unit="ms"
          series={series.lat50}
          series2={series.lat99}
          color="#0a0a0a"
          color2="#ef4444"
          areaColor="rgba(0,0,0,0.08)"
          range={[0, 220]}
          legend={[
            { name: "p50", color: "#0a0a0a" },
            { name: "p99", color: "#ef4444" },
          ]}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16, marginBottom: 16 }}>
        <ChartPanel
          title="GPU utilisation"
          subtitle="H100 — Paris PA-1"
          unit="%"
          series={series.gpu}
          color="#1e8e1e"
          areaColor="rgba(50,200,50,0.1)"
          range={[0, 100]}
        />
        <ChartPanel
          title="Cost burn"
          subtitle="cumulative · today · cap €60"
          unit="€"
          series={series.cost}
          color="#5C4EE5"
          areaColor="rgba(92,78,229,0.1)"
          range={[0, 60]}
          fillUp
        />
      </div>

      {/* Per-POP table */}
      <div className="panel" style={{ padding: 0, marginBottom: 16 }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Per-POP performance</div>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>14 Orange edge POPs — sorted by load</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["all", "fr", "es", "de", "pl"].map(f => (
              <button key={f} onClick={() => setPopFilter(f)} className={`chip ${popFilter === f ? "chip-dark" : "chip-outline"}`} style={{ cursor: "pointer", fontFamily: "inherit", fontSize: 10 }}>
                {f === "all" ? "All countries" : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <PopTable popFilter={popFilter} tick={tick} />
      </div>

      {/* Event log */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
        <EventLog tick={tick} />
        <AlertsPanel />
      </div>
    </div>
  );
};

// ============ KPI cell ============
const BigKPI = ({ label, value, delta, trend, good, warn }) => {
  const color = good ? "#1e8e1e" : warn ? "#b45309" : "var(--ink-soft)";
  const arrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  return (
    <div className="panel" style={{ padding: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", fontFamily: "var(--font-mono)" }}>{value}</div>
      <div style={{ fontSize: 11, color, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
        <span>{arrow}</span>
        <span>{delta}</span>
      </div>
    </div>
  );
};

// ============ Range picker (segmented) ============
const RangePicker = ({ value, onChange }) => {
  const options = ["1h", "6h", "24h", "7d"];
  return (
    <div style={{ display: "flex", border: "1px solid var(--color-grey-500)" }}>
      {options.map((o, i) => (
        <button key={o}
          onClick={() => onChange(o)}
          style={{
            background: value === o ? "#000" : "#fff",
            color: value === o ? "#fff" : "#000",
            border: 0, padding: "6px 12px",
            fontFamily: "inherit", fontSize: 12, fontWeight: 700,
            cursor: "pointer",
            borderLeft: i > 0 ? "1px solid var(--color-grey-500)" : 0,
          }}
        >{o}</button>
      ))}
    </div>
  );
};

// ============ Chart panel (SVG line + area, optional 2nd series) ============
const ChartPanel = ({ title, subtitle, series, series2, color, color2, areaColor, range, unit, legend, fillUp }) => {
  const w = 720, h = 180; // viewBox
  const max = range[1], min = range[0];
  const toX = (i, n) => (i / (n - 1)) * w;
  const toY = v => h - ((v - min) / (max - min)) * h;
  const path = (s) => s.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i, s.length).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const area = (s) => `${path(s)} L${toX(s.length - 1, s.length).toFixed(1)},${h} L0,${h} Z`;

  return (
    <div className="panel" style={{ padding: 0 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>{subtitle}</div>
        </div>
        {legend ? (
          <div style={{ display: "flex", gap: 12 }}>
            {legend.map(l => (
              <span key={l.name} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                <span style={{ width: 8, height: 8, background: l.color }} />
                <span style={{ color: "var(--ink-soft)" }}>{l.name}</span>
              </span>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>
            <strong style={{ color: "#000", fontSize: 13 }}>{(series[series.length - 1] || 0).toFixed(0)}</strong> {unit}
          </span>
        )}
      </div>
      <div style={{ padding: 16 }}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 180, display: "block" }} preserveAspectRatio="none">
          {/* Y gridlines */}
          {[0.25, 0.5, 0.75].map((p, i) => (
            <line key={i} x1="0" y1={h * p} x2={w} y2={h * p} stroke="var(--color-grey-200)" strokeWidth="1" strokeDasharray="2 4" />
          ))}
          {/* Area */}
          <path d={area(series)} fill={areaColor} />
          {/* Line (primary) */}
          <path d={path(series)} fill="none" stroke={color} strokeWidth="2" />
          {series2 && <path d={path(series2)} fill="none" stroke={color2} strokeWidth="2" strokeDasharray="4 3" />}
          {/* Current value marker */}
          <circle cx={toX(series.length - 1, series.length)} cy={toY(series[series.length - 1])} r="4" fill={color} stroke="#fff" strokeWidth="2" />
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--ink-faint)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
          <span>−60 min</span>
          <span>−45</span>
          <span>−30</span>
          <span>−15</span>
          <span>now</span>
        </div>
      </div>
    </div>
  );
};

// ============ Per-POP table ============
const PopTable = ({ popFilter, tick }) => {
  const POPS_MON = [
    { city: "Paris",     country: "FR", load: 2440, p50: 4,  p99: 12,  gpu: null, share: 28, status: "hub" },
    { city: "Frankfurt", country: "DE", load: 920,  p50: 9,  p99: 21,  share: 11 },
    { city: "Amsterdam", country: "NL", load: 780,  p50: 10, p99: 24,  share: 9 },
    { city: "Berlin",    country: "DE", load: 740,  p50: 14, p99: 32,  share: 8 },
    { city: "Madrid",    country: "ES", load: 620,  p50: 18, p99: 38,  share: 7 },
    { city: "Milan",     country: "IT", load: 560,  p50: 15, p99: 36,  share: 6 },
    { city: "Lyon",      country: "FR", load: 540,  p50: 12, p99: 28,  share: 6 },
    { city: "Munich",    country: "DE", load: 480,  p50: 13, p99: 30,  share: 5 },
    { city: "Barcelona", country: "ES", load: 440,  p50: 16, p99: 34,  share: 5 },
    { city: "Brussels",  country: "BE", load: 380,  p50: 8,  p99: 19,  share: 4 },
    { city: "Marseille", country: "FR", load: 340,  p50: 14, p99: 33,  share: 4 },
    { city: "Rome",      country: "IT", load: 320,  p50: 19, p99: 42,  share: 4 },
    { city: "Warsaw",    country: "PL", load: 280,  p50: 21, p99: 48,  share: 3 },
    { city: "Lisbon",    country: "PT", load: 180,  p50: 22, p99: 51,  share: 2 },
  ];

  const filtered = POPS_MON.filter(p =>
    popFilter === "all" || p.country.toLowerCase() === popFilter
  );

  return (
    <div style={{ maxHeight: 360, overflowY: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "var(--color-grey-100)", borderBottom: "1px solid var(--line)" }}>
            <th style={th()}>POP</th>
            <th style={th("right")}>Req / min</th>
            <th style={th("right")}>p50</th>
            <th style={th("right")}>p99</th>
            <th style={th()}>Share of traffic</th>
            <th style={th()}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => {
            const live = p.load + (tick * (i + 1)) % 50;
            return (
              <tr key={p.city} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--line)" : 0 }}>
                <td style={td()}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 6, height: 6, background: p.status === "hub" ? "var(--orange)" : "var(--color-success)", borderRadius: "50%" }} />
                    <strong>{p.city}</strong>
                    <span className="faint" style={{ fontSize: 11 }}>{p.country}</span>
                    {p.status === "hub" && <span className="chip chip-orange" style={{ fontSize: 9, padding: "1px 5px" }}>HUB · BARE METAL</span>}
                  </div>
                </td>
                <td style={{ ...td(), textAlign: "right", fontFamily: "var(--font-mono)" }}>{live.toLocaleString()}</td>
                <td style={{ ...td(), textAlign: "right", fontFamily: "var(--font-mono)", color: p.p50 < 15 ? "#1e8e1e" : "var(--ink)" }}>{p.p50}<span className="faint" style={{ fontSize: 10 }}>ms</span></td>
                <td style={{ ...td(), textAlign: "right", fontFamily: "var(--font-mono)", color: p.p99 > 40 ? "#b45309" : "var(--ink)" }}>{p.p99}<span className="faint" style={{ fontSize: 10 }}>ms</span></td>
                <td style={td()}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, width: 30 }}>{p.share}%</span>
                    <div style={{ flex: 1, height: 4, background: "var(--color-grey-200)" }}>
                      <div style={{ width: `${p.share * 3}%`, height: "100%", background: "var(--orange)" }} />
                    </div>
                  </div>
                </td>
                <td style={td()}>
                  <span className="chip chip-success" style={{ fontSize: 10 }}>
                    <span className="dot" />Healthy
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
const th = (align) => ({
  textAlign: align || "left",
  padding: "10px 16px",
  fontSize: 10, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.06em",
  color: "var(--ink-faint)",
});
const td = () => ({ padding: "10px 16px" });

// ============ Event log ============
const EventLog = ({ tick }) => {
  const baseEvents = useMemoMon(() => [
    { kind: "info",  ts: "now",         msg: "Endpoint healthy across 14 POPs",        meta: "all-clear · p99 within SLA" },
    { kind: "info",  ts: "1 min ago",   msg: "Scale event: +1 instance (Frankfurt)",    meta: "auto-scale · load > 80%" },
    { kind: "warn",  ts: "4 min ago",   msg: "Warsaw POP p99 above 50 ms",              meta: "still under SLA · monitoring" },
    { kind: "info",  ts: "12 min ago",  msg: "Model cache warmed on Lisbon POP",        meta: "first request triggered prefetch" },
    { kind: "ok",    ts: "1 h ago",     msg: "Deployment promoted to live",              meta: "by mathilde.dupont@orange.com" },
    { kind: "info",  ts: "1 h ago",     msg: "Health-check passing",                     meta: "GPU init · vLLM ready" },
    { kind: "info",  ts: "1 h ago",     msg: "Weights hash verified",                    meta: "EU mirror · checksum OK" },
  ], []);

  // Tick-driven new event prepended occasionally for liveness
  const events = useMemoMon(() => {
    if (tick % 5 === 0 && tick > 0) {
      return [{ kind: "info", ts: "live", msg: `Request volume spike: ${(2400 + tick % 200)} req/min`, meta: "natural traffic increase" }, ...baseEvents];
    }
    return baseEvents;
  }, [tick, baseEvents]);

  const kindColor = {
    info: { fg: "var(--ink-soft)", bg: "var(--color-grey-200)" },
    warn: { fg: "#b45309",          bg: "rgba(255,204,0,0.18)" },
    ok:   { fg: "#1e8e1e",          bg: "rgba(50,200,50,0.12)" },
    err:  { fg: "#dc2626",          bg: "rgba(220,38,38,0.12)" },
  };

  return (
    <div className="panel" style={{ padding: 0 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Event log</div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>Live · sovereign storage (Paris S3)</div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }}>
          <Icon name="refresh" size={12} />
        </button>
      </div>
      <div style={{ maxHeight: 280, overflowY: "auto" }}>
        {events.map((e, i) => {
          const c = kindColor[e.kind];
          return (
            <div key={i} style={{ padding: "10px 20px", borderBottom: i < events.length - 1 ? "1px solid var(--line)" : 0, display: "flex", gap: 12 }}>
              <span style={{ minWidth: 6, marginTop: 6, alignSelf: "flex-start", width: 6, height: 6, background: c.fg, borderRadius: "50%" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{e.msg}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{e.ts}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>{e.meta}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ Alerts panel ============
const AlertsPanel = () => (
  <div className="panel" style={{ padding: 0 }}>
    <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Alert rules</div>
        <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>5 active · routed to PagerDuty · Slack #ai-platform</div>
      </div>
      <button className="btn btn-outline btn-sm">
        <Icon name="plus" size={12} />
        New rule
      </button>
    </div>
    <div>
      <Rule name="p99 latency > 200 ms"          status="ok"   meta="any POP · sustained 2 min" />
      <Rule name="GPU utilisation > 90%"         status="ok"   meta="Paris-1 · sustained 5 min" />
      <Rule name="Cost burn > €60/day"           status="warn" meta="at 96% of cap · auto-throttle armed" />
      <Rule name="Error rate > 1%"               status="ok"   meta="rolling 10 min window" />
      <Rule name="Outbound EU egress detected"   status="ok"   meta="firewall · alert + page" />
    </div>
  </div>
);

const Rule = ({ name, status, meta }) => {
  const s = status === "ok" ? { dot: "var(--color-success)", label: "OK", color: "#1e8e1e" }
        : status === "warn" ? { dot: "var(--color-warning)", label: "Triggered", color: "#b45309" }
        :                     { dot: "#dc2626", label: "Page", color: "#dc2626" };
  return (
    <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
        <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{meta}</div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</span>
    </div>
  );
};

// ============ Synthetic series ============
function buildSeries(range, tick) {
  const N = 60; // 60 points
  // Use deterministic pseudo-random based on indexes so the chart shape is stable; tick rotates the latest values for liveness.
  const noise = (i, seed) => 0.5 + 0.5 * Math.sin(i * 0.31 + seed) + 0.3 * Math.sin(i * 0.83 + seed * 2);

  // Requests per second: 30-60 baseline
  const rps = Array.from({ length: N }, (_, i) => 30 + 25 * noise(i, 1) + (i === N - 1 ? (tick * 3 % 8) : 0));
  // Latency p50: 70-100
  const lat50 = Array.from({ length: N }, (_, i) => 78 + 8 * noise(i, 2) + (i === N - 1 ? tick % 4 : 0));
  // Latency p99: 130-200
  const lat99 = Array.from({ length: N }, (_, i) => 145 + 25 * noise(i, 3) + (i === N - 1 ? tick % 10 : 0));
  // GPU utilisation: 50-80
  const gpu = Array.from({ length: N }, (_, i) => 58 + 14 * noise(i, 4) + (i === N - 1 ? tick % 6 : 0));
  // Cost: cumulative ramping up to ~57
  const cost = Array.from({ length: N }, (_, i) => (i / (N - 1)) * 57 + 0.5 * Math.sin(i * 0.3));

  return { rps, lat50, lat99, gpu, cost };
}

Object.assign(window, { MonitoringScreen });
