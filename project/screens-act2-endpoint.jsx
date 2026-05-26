/* global React, Icon, EUFlag, useNav */
const { useState: useStateE, useEffect: useEffectE, useRef: useRefE } = React;

// ============ Screen 4: Endpoint Live ============
const EndpointScreen = () => {
  const { go } = useNav();
  const [phase, setPhase] = useStateE("provisioning"); // provisioning | live
  const [step, setStep] = useStateE(0);
  const [uptime, setUptime] = useStateE(0);
  const [reqCount, setReqCount] = useStateE(0);
  const [tab, setTab] = useStateE("endpoint");

  // Provisioning animation: 4 steps over ~3s
  useEffectE(() => {
    if (phase !== "provisioning") return;
    let active = true;
    const stages = [600, 900, 800, 700];
    let i = 0;
    const tick = () => {
      if (!active) return;
      setStep(i + 1);
      i++;
      if (i < 4) setTimeout(tick, stages[i]);
      else setTimeout(() => active && setPhase("live"), 400);
    };
    setTimeout(tick, stages[0]);
    return () => { active = false; };
  }, [phase]);

  // Live tick
  useEffectE(() => {
    if (phase !== "live") return;
    const start = Date.now();
    const t = setInterval(() => {
      setUptime(Math.floor((Date.now() - start) / 1000));
      setReqCount(r => r + Math.floor(2 + Math.random() * 8));
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 24 }}>
        <div>
          <div className="kicker">Act 2 · Endpoint</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, fontFamily: "var(--font-mono)" }}>mistral-small-24b · paris-1</h1>
            {phase === "provisioning" ? (
              <span className="chip chip-pill" style={{ background: "rgba(255,121,0,0.12)", color: "var(--orange)" }}>
                <span className="dot spin" style={{ background: "var(--orange)", borderRadius: 0, width: 8, height: 8, border: "2px solid var(--orange)", borderRightColor: "transparent", borderRadius: "50%" }} />
                Provisioning…
              </span>
            ) : (
              <span className="chip chip-pill live" style={{ background: "rgba(50,200,50,0.12)", color: "#1e8e1e" }}>
                <span className="dot" />Live
              </span>
            )}
          </div>
          {phase === "live" && (
            <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "var(--ink-soft)" }}>
              <span>Uptime <strong style={{ color: "#000", fontFamily: "var(--font-mono)" }}>{fmtUptime(uptime)}</strong></span>
              <span>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ display: "inline-block", width: 12, height: 8, background: "#0055A4" }}>
                  <span style={{ display: "inline-block", width: 4, height: 8, background: "#fff" }} />
                  <span style={{ display: "inline-block", width: 4, height: 8, background: "#EF4135" }} />
                </span>
                Paris Gcore PA-1
              </span>
              <span>·</span>
              <span>1× H100 80GB</span>
              <span>·</span>
              <span className="chip chip-eu" style={{ fontSize: 10 }}><EUFlag size={10} />Sovereign</span>
            </div>
          )}
        </div>
        {phase === "live" && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline btn-sm">
              <Icon name="play" size={12} />
              Test the endpoint
            </button>
            <button className="btn btn-secondary btn-sm">
              <Icon name="code" size={12} />
              SDK
            </button>
          </div>
        )}
      </div>

      {/* Provisioning timeline */}
      <div className="panel" style={{ padding: 24, marginBottom: 16 }}>
        <ProvTimeline phase={phase} step={step} />
      </div>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
        <KPI label="Avg. latency (Paris)" value={phase === "live" ? "84" : "—"} unit="ms" hint="P50 · vs 100ms target" loading={phase !== "live"} good />
        <KPI label="Throughput" value={phase === "live" ? "142" : "—"} unit="tok/s" hint="per H100 GPU" loading={phase !== "live"} />
        <KPI label="Requests (last 5min)" value={phase === "live" ? reqCount.toLocaleString() : "—"} unit="" hint="↑ growing" loading={phase !== "live"} animated />
        <KPI label="Current cost" value="€2.40" unit="/h" hint="H100 bare metal" loading={phase !== "live"} />
      </div>

      {/* Tabs */}
      {phase === "live" && (
        <div className="endpoint-tabs">
          {[
            ["endpoint",  "Endpoint",  "code"],
            ["logs",      "Logs",      "receipt"],
            ["metrics",   "Metrics",   "chart"],
            ["versions",  "Versions",  "server"],
          ].map(([id, label, icon]) => (
            <button key={id} onClick={() => setTab(id)} className={`endpoint-tab ${tab === id ? "active" : ""}`}>
              <Icon name={icon} size={14} />
              <span>{label}</span>
              {id === "logs" && <span className="endpoint-tab-badge">live</span>}
            </button>
          ))}
        </div>
      )}

      {/* Tab content */}
      {phase === "live" && tab === "endpoint" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, marginBottom: 16 }}>
          <EndpointBlock phase={phase} />
          <LiveTestBlock phase={phase} />
        </div>
      )}
      {phase === "live" && tab === "logs"     && <EndpointLogs />}
      {phase === "live" && tab === "metrics"  && <EndpointMetrics />}
      {phase === "live" && tab === "versions" && <EndpointVersions />}
      {phase !== "live" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, marginBottom: 16 }}>
          <EndpointBlock phase={phase} />
          <LiveTestBlock phase={phase} />
        </div>
      )}

      {/* AI Grid banner */}
      <button onClick={() => go("grid")} style={{
        width: "100%",
        background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)",
        color: "#fff",
        border: 0, padding: 0,
        cursor: "pointer", fontFamily: "inherit",
        textAlign: "left",
        position: "relative", overflow: "hidden",
        display: "block",
      }}>
        <div style={{ padding: "24px 28px", display: "flex", alignItems: "center", gap: 20, position: "relative", zIndex: 2 }}>
          <div style={{ width: 56, height: 56, background: "var(--orange)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Icon name="grid" size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--orange)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Act 3 · Orange AI Grid</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>See how your tokens are served from 14 Orange POPs in the EU</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
              This Paris deployment is delivered via the Orange edge network — every end user is served from the closest POP.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--orange)", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
            View the AI Grid
            <Icon name="arrow" size={16} />
          </div>
        </div>
        {/* Decorative pop dots */}
        <DecorativePopDots />
      </button>
    </div>
  );
};

// ============ Provisioning timeline ============
const ProvTimeline = ({ phase, step }) => {
  const stages = [
    { label: "H100 hardware reservation", sub: "Gcore PA-1 · slot allocated" },
    { label: "Model pull (47 GB)",     sub: "EU mirror · ~22s at 2.1 GB/s" },
    { label: "Loading into VRAM",         sub: "vLLM init · KV cache ready" },
    { label: "Endpoint exposed",            sub: "Health check ✓ · ready to serve" },
  ];
  const reached = (i) => phase === "live" ? 4 : step;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", margin: 0 }}>
          {phase === "live" ? "Deployment complete" : "Provisioning pipeline"}
        </h3>
        {phase === "live" && (
          <span className="chip chip-success" style={{ fontSize: 11 }}>
            <Icon name="check" size={11} />4 steps in 2:47
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
        {stages.map((s, i) => {
          const done = reached() > i;
          const active = reached() === i + 1 && phase === "provisioning";
          return (
            <React.Fragment key={i}>
              <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative" }}>
                  <div style={{
                    width: 32, height: 32,
                    background: done ? "var(--color-success)" : active ? "var(--orange)" : "#fff",
                    color: done || active ? "#fff" : "var(--ink-faint)",
                    border: `2px solid ${done ? "var(--color-success)" : active ? "var(--orange)" : "var(--color-grey-400)"}`,
                    display: "grid", placeItems: "center",
                    fontWeight: 700, fontSize: 13,
                    transition: "all var(--dur-base)",
                    zIndex: 2,
                  }}>
                    {done ? <Icon name="check" size={14} /> : active ? <span style={{
                      width: 12, height: 12, border: "2px solid #fff", borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }} /> : i + 1}
                  </div>
                  <div style={{ textAlign: "center", padding: "0 8px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: done || active ? "#000" : "var(--ink-faint)" }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: "var(--ink-faint)", marginTop: 2 }}>{s.sub}</div>
                  </div>
                </div>
              </div>
              {i < stages.length - 1 && (
                <div style={{ height: 2, flex: "0 0 24px", background: reached() > i ? "var(--color-success)" : "var(--color-grey-300)", marginTop: 15, transition: "background var(--dur-base)" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ============ KPI card ============
const KPI = ({ label, value, unit, hint, loading, good, animated }) => (
  <div className="panel" style={{ padding: 18 }}>
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 8 }}>
      {label}
    </div>
    {loading ? (
      <div className="skeleton" style={{ height: 32, width: "60%", marginBottom: 6 }} />
    ) : (
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, fontFamily: "var(--font-sans)" }}>
        <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.01em", color: good ? "#1e8e1e" : "#000" }}>{value}</span>
        <span style={{ fontSize: 13, color: "var(--ink-faint)", fontWeight: 500 }}>{unit}</span>
        {animated && <span style={{ color: "var(--color-success)", fontSize: 11, fontWeight: 700, marginLeft: 4 }}>↑</span>}
      </div>
    )}
    {loading ? (
      <div className="skeleton" style={{ height: 10, width: "80%", marginTop: 8 }} />
    ) : (
      <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4 }}>{hint}</div>
    )}
  </div>
);

// ============ Endpoint block ============
const EndpointBlock = ({ phase }) => {
  const [copied, setCopied] = useStateE(false);
  const url = "https://api.gcore.orange-ai.eu/v1/chat/completions";
  const curl = `curl -X POST ${url} \\
  -H "Authorization: Bearer $ORANGE_AI_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "mistral-small-24b",
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "stream": true
  }'`;

  return (
    <div className="panel" style={{ padding: 0 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", margin: 0 }}>Endpoint</h3>
        <span className="chip chip-outline" style={{ fontSize: 10 }}>OpenAI-compatible</span>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
          <code style={{ flex: 1, padding: "8px 12px", background: "var(--color-grey-100)", border: "1px solid var(--line)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-mono)" }}>
            {phase === "live" ? url : "—"}
          </code>
          <button
            disabled={phase !== "live"}
            onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1200); }}
            className="btn btn-outline btn-sm" style={{ padding: "8px 12px" }}>
            <Icon name={copied ? "check" : "copy"} size={12} />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {phase === "live" ? (
          <div className="code">
            <button className="copy">Copy</button>
            {curl}
          </div>
        ) : (
          <div className="skeleton" style={{ height: 160 }} />
        )}
      </div>
    </div>
  );
};

// ============ Live test chat ============
const LiveTestBlock = ({ phase }) => {
  const [input, setInput] = useStateE("");
  const [messages, setMessages] = useStateE([]);
  const [streaming, setStreaming] = useStateE(false);
  const [stats, setStats] = useStateE({ latency: null, pop: null });

  const SAMPLE_REPLIES = [
    { tokens: ["Hello", " !", " I", " can", " help", " you", " with", " GDPR", " compliance,", " document", " drafting,", " or", " text", " analysis", " —", " what", " would", " you", " like", " to", " explore", " ?"], latency: 84, pop: "Paris" },
    { tokens: ["To", " deploy", " an", " open-source", " model", " on", " sovereign", " infrastructure,", " Orange", " Business", " combines", " Gcore", " bare", " metal", " with", " edge", " routing", " over", " its", " own", " fibre", " network."], latency: 92, pop: "Paris" },
  ];

  const send = () => {
    if (!input.trim() || streaming) return;
    const userMsg = input;
    const reply = SAMPLE_REPLIES[messages.length % SAMPLE_REPLIES.length];
    setMessages(m => [...m, { role: "user", text: userMsg }, { role: "asst", text: "" }]);
    setInput("");
    setStreaming(true);
    setStats({ latency: null, pop: null });

    let i = 0;
    const stream = () => {
      if (i >= reply.tokens.length) {
        setStreaming(false);
        setStats({ latency: reply.latency, pop: reply.pop });
        return;
      }
      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "asst", text: copy[copy.length - 1].text + reply.tokens[i] };
        return copy;
      });
      i++;
      setTimeout(stream, 40 + Math.random() * 30);
    };
    setTimeout(stream, 250);
  };

  const sendQuick = (q) => { setInput(q); setTimeout(() => { setInput(""); fakeSend(q); }, 0); };
  const fakeSend = (q) => {
    const reply = SAMPLE_REPLIES[messages.length % SAMPLE_REPLIES.length];
    setMessages(m => [...m, { role: "user", text: q }, { role: "asst", text: "" }]);
    setStreaming(true);
    let i = 0;
    const stream = () => {
      if (i >= reply.tokens.length) { setStreaming(false); setStats({ latency: reply.latency, pop: reply.pop }); return; }
      setMessages(m => { const c = [...m]; c[c.length - 1] = { role: "asst", text: c[c.length - 1].text + reply.tokens[i] }; return c; });
      i++; setTimeout(stream, 40 + Math.random() * 30);
    };
    setTimeout(stream, 250);
  };

  const scrollRef = useRefE(null);
  useEffectE(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="panel" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", margin: 0 }}>Live test</h3>
        {stats.latency && (
          <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>
            latency: <strong style={{ color: "#1e8e1e" }}>{stats.latency}ms</strong> · token routing: <strong>{stats.pop}</strong>
          </span>
        )}
      </div>

      <div ref={scrollRef} style={{ flex: 1, padding: 16, minHeight: 200, overflowY: "auto", background: "var(--color-grey-100)", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 ? (
          <div style={{ margin: "auto", textAlign: "center", color: "var(--ink-faint)", fontSize: 12 }}>
            <Icon name="flask" size={24} />
            <div style={{ marginTop: 6, marginBottom: 14 }}>
              {phase === "live" ? "Ask a question to test the endpoint live" : "Waiting for startup…"}
            </div>
            {phase === "live" && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                {["Hello", "How edge routing works ?"].map(q => (
                  <button key={q} onClick={() => fakeSend(q)} className="chip chip-outline" style={{ cursor: "pointer", fontFamily: "inherit", border: "1px solid var(--color-grey-400)", background: "#fff", color: "#000" }}>
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.role === "user" ? "#000" : "#fff",
              color: m.role === "user" ? "#fff" : "#000",
              padding: "8px 12px",
              fontSize: 13, lineHeight: 1.45,
              border: m.role === "asst" ? "1px solid var(--line)" : "0",
            }}>
              {m.text}
              {m.role === "asst" && streaming && i === messages.length - 1 && (
                <span style={{ display: "inline-block", width: 7, height: 14, background: "var(--orange)", verticalAlign: -2, marginLeft: 2, animation: "pulse-dot 0.8s infinite" }} />
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ padding: 12, borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
        <input
          className="input"
          placeholder={phase === "live" ? "Type a question…" : "Endpoint not ready"}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          disabled={phase !== "live" || streaming}
          style={{ flex: 1, height: 38 }}
        />
        <button className="btn btn-primary btn-sm" onClick={send} disabled={phase !== "live" || streaming || !input.trim()}>
          <Icon name="play" size={12} />
        </button>
      </div>
    </div>
  );
};

const DecorativePopDots = () => {
  const dots = [
    { x: 60, y: 35 }, { x: 70, y: 50 }, { x: 80, y: 30 }, { x: 90, y: 60 },
    { x: 75, y: 70 }, { x: 85, y: 80 }, { x: 65, y: 65 }, { x: 95, y: 25 },
  ];
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.4, zIndex: 1 }}>
      {dots.map((d, i) => (
        <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r="2" fill="#ff7900">
          <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2 + (i % 3) * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.2}s`} />
        </circle>
      ))}
    </svg>
  );
};

const fmtUptime = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

Object.assign(window, { EndpointScreen });
