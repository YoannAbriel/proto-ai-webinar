/* global React, Icon, EUFlag, useNav */
const { useState: useStateP, useEffect: useEffectP } = React;

// ============ Screen 6: Edge Performance ============
const EdgeScreen = () => {
  const { go } = useNav();

  return (
    <div className="fade-in">
      <button onClick={() => go("grid")} className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
        <Icon name="chevronLeft" size={14} />
        Back to the AI Grid
      </button>

      <div style={{ marginBottom: 28 }}>
        <div className="kicker">Act 3 · Close</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
          Measured impact of Orange edge routing
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)", margin: 0, maxWidth: 760 }}>
          Real comparison vs Paris-only centralised deployment, under a typical production load — internal assistant, 50&nbsp;req/sec, 1&nbsp;M&nbsp;tokens/day, 8&nbsp;countries.
        </p>
      </div>

      {/* 3 comparison cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 32 }}>
        <LatencyCard />
        <SovereigntyCard />
        <CostCard />
      </div>

      {/* Use cases */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div className="kicker">Industries</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Use cases unlocked by the AI Grid</h2>
          </div>
          <span className="faint" style={{ fontSize: 12 }}>4 Orange Business priority sectors</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <UseCaseCard
            icon="bank" sector="Banking & Finance"
            title="Regulatory compliance + trading latency"
            bullets={["DORA & MiCA ready", "< 40ms cross-EU", "HSM audit trail"]}
            color="#1e40af"
          />
          <UseCaseCard
            icon="health" sector="Healthcare"
            title="Patient data never leaves the EU"
            bullets={["Strict GDPR Article 9", "HDS hosting", "End-to-end encryption"]}
            color="#16a34a"
          />
          <UseCaseCard
            icon="shield" sector="Public sector"
            title="Strict sovereignty + national scale"
            bullets={["SecNumCloud-compatible", "14 national POPs", "Predictable cost"]}
            color="#000"
          />
          <UseCaseCard
            icon="factory" sector="Industry & Energy"
            title="Real-time edge inference on remote sites"
            bullets={["Plants & refineries", "99.99% reliability", "Dedicated Orange 5G/fibre"]}
            color="#ea580c"
          />
        </div>
      </div>

      {/* Final banner */}
      <div style={{
        background: "var(--orange)",
        color: "#fff",
        padding: "40px 48px",
        marginBottom: 16,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 32,
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative squares */}
        <div style={{ position: "absolute", top: -40, right: 200, width: 80, height: 80, background: "rgba(0,0,0,0.08)" }} />
        <div style={{ position: "absolute", bottom: -20, right: 320, width: 40, height: 40, background: "rgba(0,0,0,0.06)" }} />
        <div style={{ position: "absolute", top: 60, right: 460, width: 60, height: 60, background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.85, marginBottom: 10 }}>
            What's next?
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.01em", maxWidth: 720 }}>
            Tomorrow, your generative AI runs <em style={{ fontStyle: "normal", borderBottom: "3px solid #fff" }}>sovereign</em> AND <em style={{ fontStyle: "normal", borderBottom: "3px solid #fff" }}>right next to</em> your users.
          </div>
          <div style={{ fontSize: 14, marginTop: 14, opacity: 0.85 }}>
            Let's discuss it with an Orange Business architect — 45 minutes, no commitment.
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn btn-secondary btn-lg" style={{ background: "#000", borderColor: "#000" }}>
            Book a meeting with Orange Business
            <Icon name="arrow" size={14} />
          </button>
          <button className="btn" style={{ background: "transparent", borderColor: "#fff", color: "#fff" }}>
            Download the whitepaper
            <Icon name="download" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ Latency card ============
const LatencyCard = () => {
  const [animated, setAnimated] = useStateP(false);
  useEffectP(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

  return (
    <div className="panel" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Icon name="bolt" size={20} className="text-primary" />
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--orange)" }}>Card 1 · Latency</div>
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 18px" }}>Perceived latency divided by 4</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
        <BarRow label="Without AI Grid" sub="Paris central only" value={142} max={150} color="var(--color-grey-700)" animate={animated} />
        <BarRow label="With Orange AI Grid" sub="14 edge POPs" value={38} max={150} color="var(--orange)" animate={animated} highlight />
      </div>

      <div style={{ background: "rgba(255,121,0,0.06)", padding: 14, marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 36, fontWeight: 700, color: "var(--orange)", lineHeight: 1, letterSpacing: "-0.02em" }}>−73%</span>
          <span style={{ fontSize: 13, color: "var(--ink-soft)", flex: 1 }}>perceived latency, with no deployment changes.</span>
        </div>
      </div>
    </div>
  );
};

const BarRow = ({ label, sub, value, max, color, animate, highlight }) => {
  const w = animate ? (value / max) * 100 : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{sub}</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: highlight ? color : "#000" }}>
          {value}<span style={{ fontSize: 11, color: "var(--ink-faint)", marginLeft: 2, fontWeight: 500 }}>ms</span>
        </div>
      </div>
      <div style={{ height: 12, background: "var(--color-grey-200)", position: "relative", overflow: "hidden" }}>
        <div style={{
          width: `${w}%`, height: "100%", background: color,
          transition: "width 900ms var(--easing-decelerate)",
        }} />
      </div>
    </div>
  );
};

// ============ Sovereignty card ============
const SovereigntyCard = () => (
  <div className="panel" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
      <Icon name="shield" size={20} className="text-primary" />
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--orange)" }}>Card 2 · Sovereignty</div>
    </div>
    <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 18px" }}>100% of requests in EU</h3>

    {/* EU map with all POPs highlighted */}
    <div style={{ background: "var(--color-grey-100)", padding: 12, marginBottom: 16, position: "relative", aspectRatio: "1.5/1", overflow: "hidden" }}>
      {window.EUMap ? (
        <EUMap
          theme="light"
          width={600}
          height={400}
          showLabels={false}
          pops={[
            { id:"paris",     city:"Paris",     hub: true, lon: 2.35,  lat: 48.86 },
            { id:"lyon",      city:"Lyon",      lon: 4.85,  lat: 45.76 },
            { id:"marseille", city:"Marseille", lon: 5.37,  lat: 43.3 },
            { id:"madrid",    city:"Madrid",    lon: -3.7,  lat: 40.4 },
            { id:"barcelona", city:"Barcelona", lon: 2.17,  lat: 41.4 },
            { id:"lisbon",    city:"Lisbon",    lon: -9.14, lat: 38.7 },
            { id:"milan",     city:"Milan",     lon: 9.19,  lat: 45.46 },
            { id:"rome",      city:"Rome",      lon: 12.5,  lat: 41.9 },
            { id:"brussels",  city:"Brussels",  lon: 4.35,  lat: 50.85 },
            { id:"amsterdam", city:"Amsterdam", lon: 4.9,   lat: 52.37 },
            { id:"frankfurt", city:"Frankfurt", lon: 8.68,  lat: 50.11 },
            { id:"munich",    city:"Munich",    lon: 11.58, lat: 48.14 },
            { id:"berlin",    city:"Berlin",    lon: 13.4,  lat: 52.52 },
            { id:"warsaw",    city:"Warsaw",    lon: 21.0,  lat: 52.23 },
          ]}
        >
          {() => null}
        </EUMap>
      ) : null}
      {/* Big checkmark overlay */}
      <div style={{
        position: "absolute", top: 14, right: 14,
        background: "#fff", padding: "8px 10px",
        border: "1px solid var(--line)",
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>
        <span style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "rgba(50,200,50,0.15)",
          display: "grid", placeItems: "center",
        }}>
          <Icon name="check" size={14} className="" style={{ color: "var(--color-success)" }} />
        </span>
        <span className="chip chip-eu" style={{ fontSize: 10, padding: "2px 6px" }}>
          <EUFlag size={10} />
          14 EU POPs
        </span>
      </div>
    </div>

    <div style={{ background: "rgba(50,200,50,0.06)", padding: 14, marginTop: "auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 36, fontWeight: 700, color: "#1e8e1e", lineHeight: 1, letterSpacing: "-0.02em" }}>0</span>
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}><strong>byte</strong> of data left the EU.</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span className="chip chip-success" style={{ fontSize: 10 }}>AI Act</span>
        <span className="chip chip-success" style={{ fontSize: 10 }}>RGPD</span>
        <span className="chip chip-success" style={{ fontSize: 10 }}>NIS2</span>
        <span className="chip chip-success" style={{ fontSize: 10 }}>SecNumCloud-ready</span>
      </div>
    </div>
  </div>
);

// ============ Cost card ============
const CostCard = () => {
  const [animated, setAnimated] = useStateP(false);
  useEffectP(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

  return (
    <div className="panel" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Icon name="chart" size={20} className="text-primary" />
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--orange)" }}>Card 3 · Cost</div>
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 18px" }}>Savings on 1M tokens/day</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
        <CostBar label="OpenAI GPT-4o (equivalent)" sub="SaaS API · US data" value={4.20} max={5} color="var(--color-grey-700)" animate={animated} />
        <CostBar label="Azure OpenAI EU" sub="EU hyperscaler · non-sovereign" value={3.80} max={5} color="var(--color-grey-700)" animate={animated} />
        <CostBar label="Orange × Gcore" sub="Mistral-24B bare metal + edge" value={0.90} max={5} color="var(--orange)" animate={animated} highlight />
      </div>

      <div style={{ background: "rgba(255,121,0,0.06)", padding: 14, marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 36, fontWeight: 700, color: "var(--orange)", lineHeight: 1, letterSpacing: "-0.02em" }}>−78%</span>
          <span style={{ fontSize: 13, color: "var(--ink-soft)", flex: 1 }}>on 1M tokens/day, sovereignty included.</span>
        </div>
      </div>
    </div>
  );
};

const CostBar = ({ label, sub, value, max, color, animate, highlight }) => {
  const w = animate ? (value / max) * 100 : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{sub}</div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)", color: highlight ? color : "#000" }}>
          €{value.toFixed(2)}<span style={{ fontSize: 10, color: "var(--ink-faint)", marginLeft: 2, fontWeight: 500 }}>/M tok</span>
        </div>
      </div>
      <div style={{ height: 10, background: "var(--color-grey-200)", position: "relative", overflow: "hidden" }}>
        <div style={{
          width: `${w}%`, height: "100%", background: color,
          transition: "width 900ms var(--easing-decelerate)",
        }} />
      </div>
    </div>
  );
};

// ============ Use case card ============
const UseCaseCard = ({ icon, sector, title, bullets, color }) => (
  <div className="panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, minHeight: 220 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 36, height: 36,
        background: color, color: "#fff",
        display: "grid", placeItems: "center",
      }}>
        <Icon name={icon} size={18} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>{sector}</div>
    </div>
    <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
      {bullets.map(b => (
        <li key={b} style={{ display: "flex", gap: 8, alignItems: "flex-start", color: "var(--ink-soft)" }}>
          <Icon name="check" size={12} className="text-primary" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  </div>
);

Object.assign(window, { EdgeScreen });
