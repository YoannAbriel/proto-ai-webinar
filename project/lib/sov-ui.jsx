/* global React, Icon, computeSovereignty */
// Shared sovereignty visuals — reused by the deploy flow, the edge close screen,
// the live endpoint and monitoring so every surface shows the same index.

// Circular gauge: score 0–100 with the level label underneath.
const SovGauge = ({ score = 0, level, size = 116, stroke = 9, dark = false }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * c;
  const lv = level || (window.sovLevel ? window.sovLevel(score) : { label: "", color: "#1e8e1e" });
  const track = dark ? "rgba(255,255,255,0.14)" : "var(--color-grey-200)";
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={lv.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray var(--dur-slow) var(--easing-standard)" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", lineHeight: 1 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: size * 0.3, fontWeight: 700, color: dark ? "#fff" : "#000", fontFamily: "var(--font-mono)" }}>{Math.round(pct)}</div>
            <div style={{ fontSize: 10, color: dark ? "rgba(255,255,255,0.6)" : "var(--ink-faint)", letterSpacing: "0.04em" }}>/ 100</div>
          </div>
        </div>
      </div>
      {lv.label && <span className="chip" style={{ fontSize: 11, background: "transparent", color: lv.color, border: `1px solid ${lv.color}`, fontWeight: 700 }}>{lv.label}</span>}
    </div>
  );
};

const sovColor = (s) => s >= 75 ? "#3fae3f" : s >= 60 ? "var(--color-warning)" : "var(--color-error)";

// Four-dimension breakdown. layout="list" (narrow columns) or "tiles" (wide).
const SovDimensions = ({ dims = [], dark = false, layout = "list" }) => {
  if (layout === "tiles") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {dims.map(d => (
          <div key={d.key} style={{
            padding: "12px 14px",
            background: dark ? "rgba(255,255,255,0.05)" : "var(--color-grey-100)",
            borderLeft: `2px solid ${sovColor(d.score)}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: dark ? "#fff" : "#000" }}>{d.label}<span style={{ fontWeight: 400, color: dark ? "rgba(255,255,255,0.45)" : "var(--ink-faint)" }}> sovereignty</span></span>
              <span style={{ fontSize: 17, fontWeight: 700, fontFamily: "var(--font-mono)", color: sovColor(d.score), letterSpacing: "-0.01em" }}>{d.score}</span>
            </div>
            <div style={{ height: 4, background: dark ? "rgba(255,255,255,0.12)" : "var(--color-grey-200)" }}>
              <div style={{ width: `${d.score}%`, height: "100%", background: sovColor(d.score), transition: "width var(--dur-base) var(--easing-standard)" }} />
            </div>
            <div style={{ fontSize: 10.5, color: dark ? "rgba(255,255,255,0.5)" : "var(--ink-faint)", marginTop: 7, lineHeight: 1.4 }}>
              {(d.criteria || []).join(" · ")}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {dims.map(d => (
        <div key={d.key}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: dark ? "#fff" : "#000" }}>{d.label} sovereignty</span>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: dark ? "rgba(255,255,255,0.8)" : "var(--ink-soft)" }}>{d.score}</span>
          </div>
          <div style={{ height: 5, background: dark ? "rgba(255,255,255,0.12)" : "var(--color-grey-200)" }}>
            <div style={{ width: `${d.score}%`, height: "100%", background: sovColor(d.score), transition: "width var(--dur-base) var(--easing-standard)" }} />
          </div>
          <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,0.55)" : "var(--ink-faint)", marginTop: 3 }}>{d.detail}</div>
        </div>
      ))}
    </div>
  );
};

// Convenience: full panel from a deploy config (wide layout — gauge + tiles).
const SovereigntyPanel = ({ cfg, dark = false }) => {
  const sov = window.computeSovereignty ? window.computeSovereignty(cfg) : { score: 0, dims: [], level: null };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", gap: 28, alignItems: "center" }}>
      <SovGauge score={sov.score} level={sov.level} dark={dark} />
      <SovDimensions dims={sov.dims} dark={dark} layout="tiles" />
    </div>
  );
};

// Compliance certification stack (Orange Cloud Avenue, from the brand deck).
const CERTS = ["ISO 27001", "ISO 9001", "ISO 14001", "ISO 22301", "SOC 2", "PCI-DSS", "NIS2", "DORA", "SecNumCloud", "HDS", "Tier III"];
const ComplianceCerts = ({ certs = CERTS, dark = false, title = "Certified & compliant" }) => (
  <div>
    {title && <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: dark ? "rgba(255,255,255,0.6)" : "var(--ink-faint)", marginBottom: 8 }}>{title}</div>}
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {certs.map(c => (
        <span key={c} style={{
          fontSize: 10, fontWeight: 700, padding: "3px 8px",
          border: `1px solid ${dark ? "rgba(255,255,255,0.25)" : "var(--color-grey-400)"}`,
          color: dark ? "rgba(255,255,255,0.85)" : "var(--ink-soft)",
          fontFamily: "var(--font-mono)", letterSpacing: "0.02em",
        }}>{c}</span>
      ))}
    </div>
  </div>
);

// Orange Cloud Avenue × NVIDIA × Gcore lockup.
const CloudAvenueLockup = ({ dark = false, size = 12 }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: size, fontWeight: 700, color: dark ? "rgba(255,255,255,0.85)" : "var(--ink-soft)" }}>
    <span style={{ color: "var(--orange)" }}>Cloud Avenue</span>
    <span style={{ opacity: 0.4 }}>·</span>
    <span style={{ fontWeight: 800 }}>NVIDIA</span>
    <span style={{ opacity: 0.4 }}>×</span>
    <span style={{ fontWeight: 800 }}>Gcore</span>
  </span>
);

Object.assign(window, { SovGauge, SovDimensions, SovereigntyPanel, ComplianceCerts, CloudAvenueLockup, CERTS });
