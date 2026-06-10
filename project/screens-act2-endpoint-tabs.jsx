/* global React, Icon, EUFlag */
const { useState: useStateET, useEffect: useEffectET, useMemo: useMemoET, useRef: useRefET } = React;

// ============ Endpoint Logs tab ============
const EndpointLogs = () => {
  const [filter, setFilter] = useStateET("all");
  const [pause, setPause] = useStateET(false);
  const [logs, setLogs] = useStateET(() => seedLogs(40));
  const scrollRef = useRefET(null);

  // Stream new lines every 800–1400ms when not paused
  useEffectET(() => {
    if (pause) return;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      setLogs(prev => {
        const next = [...prev, makeLog(prev.length)];
        return next.length > 200 ? next.slice(-200) : next;
      });
      setTimeout(tick, 600 + Math.random() * 900);
    };
    setTimeout(tick, 800);
    return () => { alive = false; };
  }, [pause]);

  // Auto-scroll to bottom
  useEffectET(() => {
    if (pause) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs, pause]);

  const visible = logs.filter(l => filter === "all" || l.level === filter);

  return (
    <div className="panel" style={{ padding: 0, marginBottom: 16 }}>
      <div className="logs-toolbar">
        <div className="logs-segmented">
          {[
            ["all",   "All",     logs.length],
            ["info",  "Info",    logs.filter(l => l.level === "info").length],
            ["warn",  "Warn",    logs.filter(l => l.level === "warn").length],
            ["error", "Error",   logs.filter(l => l.level === "error").length],
          ].map(([id, label, n]) => (
            <button key={id} onClick={() => setFilter(id)} className={filter === id ? "active" : ""}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: levelDot(id), display: "inline-block", marginRight: 6 }} />
              {label} <span className="logs-count">{n}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className={`chip chip-pill ${pause ? "" : "live"}`} style={{ fontSize: 10, background: pause ? "var(--color-grey-200)" : "rgba(50,200,50,0.12)", color: pause ? "var(--ink-soft)" : "#1e8e1e" }}>
            <span className="dot" />{pause ? "Paused" : "Streaming"}
          </span>
          <button onClick={() => setPause(p => !p)} className="btn btn-ghost btn-sm">
            <Icon name={pause ? "play" : "close"} size={12} />
            {pause ? "Resume" : "Pause"}
          </button>
          <button className="btn btn-ghost btn-sm">
            <Icon name="download" size={12} />
            Export
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="logs-stream">
        {visible.map((l, i) => (
          <div key={i} className={`logs-line logs-${l.level}`}>
            <span className="logs-ts">{l.ts}</span>
            <span className="logs-level">{l.level.toUpperCase()}</span>
            <span className="logs-req mono">{l.req}</span>
            <span className="logs-msg">{l.msg}</span>
            <span className="logs-meta">
              {l.tokens && <span>tokens={l.tokens}</span>}
              {l.lat && <span>lat={l.lat}ms</span>}
              {l.pop && <span>pop={l.pop}</span>}
              {l.status && <span>status={l.status}</span>}
            </span>
          </div>
        ))}
      </div>

      <div className="logs-footer">
        <span>Storage: sovereign Paris S3 · retention 30 d · 7.3 GB used</span>
        <span style={{ fontFamily: "var(--font-mono)" }}>{visible.length}/{logs.length} lines</span>
      </div>
    </div>
  );
};

const levelDot = (lv) => lv === "info"  ? "#3b82f6"
                       : lv === "warn"  ? "#f59e0b"
                       : lv === "error" ? "#ef4444"
                       :                  "var(--ink-faint)";

function seedLogs(n) {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(makeLog(i));
  return arr;
}
function makeLog(seed) {
  // Deterministic but varied content
  const now = new Date(Date.now() - (60 - seed) * 1500 + (seed % 7) * 130);
  const ts = now.toISOString().slice(11, 23);
  const tpl = LOG_TEMPLATES[(seed * 7) % LOG_TEMPLATES.length];
  const req = "req_" + (Math.abs(seed * 2654435761) % 0xfffffff).toString(16).padStart(7, "0");
  return { ...tpl, ts, req };
}

const LOG_TEMPLATES = [
  { level: "info",  msg: "chat.completion served",                tokens: 184, lat: 82,  pop: "Paris",     status: 200 },
  { level: "info",  msg: "chat.completion served",                tokens: 421, lat: 144, pop: "Madrid",    status: 200 },
  { level: "info",  msg: "chat.completion served",                tokens: 96,  lat: 71,  pop: "Frankfurt", status: 200 },
  { level: "info",  msg: "chat.completion served (stream)",       tokens: 612, lat: 89,  pop: "Berlin",    status: 200 },
  { level: "info",  msg: "embedding served",                      tokens: 1,   lat: 28,  pop: "Paris",     status: 200 },
  { level: "info",  msg: "tools.parallel_calls=2",                tokens: 248, lat: 112, pop: "Brussels",  status: 200 },
  { level: "info",  msg: "JSON-mode response · schema validated", tokens: 156, lat: 94,  pop: "Amsterdam", status: 200 },
  { level: "warn",  msg: "input above 24k tokens · truncated",    tokens: 24576, lat: 158, pop: "Milan",   status: 200 },
  { level: "warn",  msg: "rate limit close to threshold",         tokens: 78,  lat: 96,  pop: "Warsaw",    status: 200 },
  { level: "info",  msg: "cache hit · KV reused (0 prefill)",     tokens: 312, lat: 41,  pop: "Lyon",      status: 200 },
  { level: "info",  msg: "auto-scale event: +1 instance",         tokens: null, lat: null, pop: "Paris",   status: null },
  { level: "info",  msg: "POP health-check OK",                   tokens: null, lat: 12,   pop: "Lisbon",   status: 200 },
  { level: "error", msg: "client cancelled mid-stream",           tokens: 88,  lat: 41,  pop: "Rome",      status: 499 },
  { level: "info",  msg: "chat.completion served",                tokens: 76,  lat: 79,  pop: "Munich",    status: 200 },
  { level: "info",  msg: "telemetry checkpoint written",          tokens: null, lat: null, pop: "Paris",   status: null },
];

// ============ Endpoint Metrics tab ============
const EndpointMetrics = () => {
  const [range, setRange] = useStateET("1h");
  const series = useMemoET(() => buildEndpointSeries(range), [range]);

  return (
    <>
      {/* Toolbar */}
      <div className="panel" style={{ padding: "12px 20px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Endpoint metrics</div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>Scoped to this deployment · sovereign telemetry</div>
        </div>
        <div className="logs-segmented">
          {["1h", "6h", "24h"].map(r => (
            <button key={r} onClick={() => setRange(r)} className={range === r ? "active" : ""}>{r}</button>
          ))}
        </div>
      </div>

      {/* Charts grid */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12, marginBottom: 12 }}>
        <MiniChart title="Latency · p50 / p99" subtitle="ms" current={`${series.p50[series.p50.length-1].toFixed(0)} ms`} series={series.p50} series2={series.p99} color="#0a0a0a" color2="#ef4444" max={220} legend={[{ name: "p50", color: "#0a0a0a" }, { name: "p99", color: "#ef4444" }]} />
        <MiniChart title="Throughput" subtitle="tokens / sec"  current={`${(series.tokps[series.tokps.length-1]).toFixed(0)} tok/s`} series={series.tokps} color="var(--orange)" areaColor="rgba(255,121,0,0.12)" max={2200} />
        <MiniChart title="Requests / sec" subtitle="req/s"     current={`${series.rps[series.rps.length-1].toFixed(1)}`} series={series.rps} color="#5C4EE5" areaColor="rgba(92,78,229,0.1)" max={80} />
        <MiniChart title="GPU utilisation" subtitle="%"        current={`${series.gpu[series.gpu.length-1].toFixed(0)}%`} series={series.gpu} color="#1e8e1e" areaColor="rgba(50,200,50,0.1)" max={100} />
      </div>

      {/* Right-side panel: error breakdown + cache + cost */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)", gap: 12, marginBottom: 16 }}>
        <div className="panel" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", margin: "0 0 12px" }}>Status code breakdown</h3>
          {[
            ["200 OK",      94.6, "#1e8e1e"],
            ["499 Cancel",   3.1, "var(--ink-soft)"],
            ["429 Limit",    1.8, "#f59e0b"],
            ["500 Error",    0.5, "#ef4444"],
          ].map(([k, v, c]) => (
            <div key={k} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span>{k}</span>
                <strong style={{ fontFamily: "var(--font-mono)" }}>{v}%</strong>
              </div>
              <div style={{ height: 4, background: "var(--color-grey-200)" }}>
                <div style={{ width: `${v}%`, height: "100%", background: c }} />
              </div>
            </div>
          ))}
        </div>

        <DynamoPanel />

        <div className="panel" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", margin: "0 0 12px" }}>Cost burn (today)</h3>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-mono)", marginBottom: 4 }}>€57.6<span style={{ fontSize: 12, color: "var(--ink-faint)" }}> / €60</span></div>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 12 }}>at 96% of daily cap · auto-throttle armed</div>
          <div style={{ height: 6, background: "var(--color-grey-200)" }}>
            <div style={{ width: "96%", height: "100%", background: "#f59e0b" }} />
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "var(--ink-faint)" }}>
            €2.40/h bare metal · scale-to-zero saved €13.2 last week.
          </div>
        </div>
      </div>

      <EnergyCarbonPanel />
    </>
  );
};

// NVIDIA Dynamo — disaggregated serving + KV-cache reuse (replaces the old KV panel)
const DynamoPanel = () => {
  const D = window.DYNAMO || { kvReusePct: 72, prefillMs: 11, decodeMsPerTok: 3.1, tokpsGainPct: 35 };
  return (
    <div className="panel" style={{ padding: 18, borderTop: "3px solid #76b900" }}>
      <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
        <img src="assets/logos/nvidia.svg" alt="NVIDIA" style={{ height: 13, width: "auto", display: "block" }} /> NVIDIA Dynamo
      </h3>
      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-mono)", marginBottom: 4 }}>{D.kvReusePct}<span style={{ fontSize: 12, color: "var(--ink-faint)" }}>%</span></div>
      <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 12 }}>KV cache reuse · last hour</div>
      <div style={{ height: 6, background: "var(--color-grey-200)" }}>
        <div style={{ width: `${D.kvReusePct}%`, height: "100%", background: "#76b900" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12, fontSize: 11 }}>
        <div><div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Prefill</div><strong className="mono">{D.prefillMs} ms</strong></div>
        <div><div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Decode</div><strong className="mono">{D.decodeMsPerTok} ms/tok</strong></div>
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: "var(--ink-faint)" }}>
        Disaggregated prefill/decode · KV-aware routing reuses the cache to skip prefill · +{D.tokpsGainPct}% throughput.
      </div>
    </div>
  );
};

// Energy & carbon — France grid vs the same model on the German grid.
const EnergyCarbonPanel = () => {
  const fr = window.gco2PerMtok ? window.gco2PerMtok("mistral-small-24b", "FR", true) : 60;
  const de = window.gco2PerMtok ? window.gco2PerMtok("mistral-small-24b", "DE", true) : 410;
  const ratio = Math.max(1, Math.round(de / Math.max(fr, 1)));
  return (
    <div className="panel" style={{ padding: 18, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="leaf" size={14} style={{ color: "#1e8e1e" }} /> Energy &amp; carbon
        </h3>
        <span className="chip chip-success" style={{ fontSize: 10 }}>{ratio}× cleaner in France</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
        <CarbonStat label="This deployment · Paris" value={fr} unit="g CO₂e/Mtok" color="#1e8e1e" max={de} good />
        <CarbonStat label="Same model · Frankfurt" value={de} unit="g CO₂e/Mtok" color="var(--color-grey-700)" max={de} />
        <div>
          <div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Today (1.2M tok served)</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#1e8e1e" }}>{(fr * 1.2 / 1000).toFixed(2)} kg</div>
          <div className="faint" style={{ fontSize: 11 }}>vs {(de * 1.2 / 1000).toFixed(2)} kg on the German grid</div>
        </div>
      </div>
    </div>
  );
};

const CarbonStat = ({ label, value, unit, color, max, good }) => (
  <div>
    <div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>{value} <span style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 400 }}>{unit}</span></div>
    <div style={{ height: 5, background: "var(--color-grey-200)", marginTop: 6 }}>
      <div style={{ width: `${Math.min(100, (value / (max || value)) * 100)}%`, height: "100%", background: color }} />
    </div>
  </div>
);

const MiniChart = ({ title, subtitle, current, series, series2, color, color2, areaColor, max, legend }) => {
  const w = 480, h = 110;
  const toX = (i, n) => (i / (n - 1)) * w;
  const toY = v => h - (v / max) * h;
  const path = (s) => s.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i, s.length).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const area = (s) => `${path(s)} L${toX(s.length - 1, s.length).toFixed(1)},${h} L0,${h} Z`;

  return (
    <div className="panel" style={{ padding: 0 }}>
      <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{subtitle}</div>
        </div>
        {legend ? (
          <div style={{ display: "flex", gap: 10 }}>
            {legend.map(l => (
              <span key={l.name} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10 }}>
                <span style={{ width: 7, height: 7, background: l.color }} />{l.name}
              </span>
            ))}
          </div>
        ) : (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>{current}</span>
        )}
      </div>
      <div style={{ padding: 12 }}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 110, display: "block" }} preserveAspectRatio="none">
          {[0.33, 0.66].map((p, i) => (
            <line key={i} x1="0" y1={h * p} x2={w} y2={h * p} stroke="var(--color-grey-200)" strokeWidth="1" strokeDasharray="2 4" />
          ))}
          {areaColor && <path d={area(series)} fill={areaColor} />}
          <path d={path(series)} fill="none" stroke={color} strokeWidth="2" />
          {series2 && <path d={path(series2)} fill="none" stroke={color2} strokeWidth="2" strokeDasharray="4 3" />}
        </svg>
      </div>
    </div>
  );
};

function buildEndpointSeries(range) {
  const N = 48;
  const noise = (i, s) => 0.5 + 0.5 * Math.sin(i * 0.27 + s) + 0.3 * Math.sin(i * 0.71 + s * 2);
  return {
    p50:   Array.from({ length: N }, (_, i) => 82 + 8 * noise(i, 1)),
    p99:   Array.from({ length: N }, (_, i) => 150 + 20 * noise(i, 2)),
    tokps: Array.from({ length: N }, (_, i) => 1500 + 350 * noise(i, 3)),
    rps:   Array.from({ length: N }, (_, i) => 28 + 20 * noise(i, 4)),
    gpu:   Array.from({ length: N }, (_, i) => 58 + 18 * noise(i, 5)),
  };
}

// ============ Endpoint Versions tab ============
const EndpointVersions = () => {
  const versions = [
    { tag: "v1.4.0", state: "live",   date: "today · 14:02",       author: "mathilde.dupont@orange.com", changes: "Switched runtime to vLLM 0.6.2 · throughput +12%", traffic: 100 },
    { tag: "v1.3.0", state: "stable", date: "3 days ago",          author: "thomas.li@orange.com",        changes: "Enable speculative decoding · p50 −7 ms",          traffic: 0 },
    { tag: "v1.2.1", state: "stable", date: "8 days ago",          author: "thomas.li@orange.com",        changes: "Hotfix · tokeniser edge case for FR diacritics",   traffic: 0 },
    { tag: "v1.2.0", state: "stable", date: "12 days ago",         author: "mathilde.dupont@orange.com", changes: "Initial deployment of Mistral-Small-3-24B",        traffic: 0 },
  ];
  const [tag, setTag] = useStateET(versions[0].tag);

  return (
    <>
      <div className="panel" style={{ padding: "14px 20px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Deployment history</div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>4 versions · 1 live · 0 in-flight</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm">
            <Icon name="receipt" size={12} />
            Diff selected
          </button>
          <button className="btn btn-primary btn-sm">
            <Icon name="deploy" size={12} />
            New deployment
          </button>
        </div>
      </div>

      <div className="panel" style={{ padding: 0, marginBottom: 12 }}>
        {versions.map((v, i) => {
          const selected = tag === v.tag;
          return (
            <div key={v.tag} onClick={() => setTag(v.tag)} className={`version-row ${selected ? "selected" : ""}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: v.state === "live" ? "var(--color-success)" : "var(--color-grey-400)", boxShadow: v.state === "live" ? "0 0 0 3px rgba(50,200,50,0.2)" : "none" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                    <strong className="mono" style={{ fontSize: 14 }}>{v.tag}</strong>
                    {v.state === "live" ? (
                      <span className="chip chip-pill live" style={{ fontSize: 10, background: "rgba(50,200,50,0.12)", color: "#1e8e1e" }}>
                        <span className="dot" />Live · {v.traffic}% traffic
                      </span>
                    ) : (
                      <span className="chip chip-outline" style={{ fontSize: 10 }}>Stable</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.changes}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>
                    {v.date} · {v.author}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
                {v.state === "live" ? (
                  <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.4 }}>Live</button>
                ) : (
                  <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); }}>
                    Rollback
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Traffic-split planner */}
      <div className="panel" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", margin: "0 0 12px" }}>Canary traffic split</h3>
        <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: "0 0 12px" }}>
          Promote a stable version to live by shifting traffic gradually. Default ramp: 5% → 25% → 50% → 100% with 10-minute checks.
        </p>
        <div style={{ height: 22, background: "var(--color-grey-100)", display: "flex", overflow: "hidden", border: "1px solid var(--line)" }}>
          <div style={{ width: "100%", background: "var(--orange)", display: "flex", alignItems: "center", paddingLeft: 10, color: "#fff", fontWeight: 700, fontSize: 11 }}>
            v1.4.0 · 100%
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button className="btn btn-outline btn-sm" disabled style={{ opacity: 0.5 }}>Start canary on v1.3.0</button>
          <button className="btn btn-ghost btn-sm">View ramp schedule</button>
        </div>
      </div>
    </>
  );
};

Object.assign(window, { EndpointLogs, EndpointMetrics, EndpointVersions });
