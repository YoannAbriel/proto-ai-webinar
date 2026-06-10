/* global React */
const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// ============ ICONS (Lucide icons via CSS-mask, currentColor-aware) ============
// Each Lucide SVG is loaded as a CSS mask so icons inherit text color and screenshot cleanly.
const ICON_MAP = {
  catalog:     "layout-grid",
  deploy:      "rocket",
  grid:        "globe",
  monitor:     "activity",
  settings:    "settings",
  search:      "search",
  lock:        "lock",
  chevron:     "chevron-right",
  chevronDown: "chevron-down",
  chevronLeft: "chevron-left",
  arrow:       "arrow-right",
  copy:        "copy",
  check:       "check",
  close:       "x",
  play:        "play",
  plus:        "plus",
  refresh:     "refresh-cw",
  info:        "info",
  star:        "star",
  download:    "download",
  heart:       "heart",
  spark:       "sparkles",
  server:      "server",
  shield:      "shield-check",
  globe:       "globe-2",
  bolt:        "zap",
  flask:       "flask-conical",
  code:        "code-2",
  chart:       "bar-chart-3",
  receipt:     "receipt",
  target:      "target",
  sliders:     "sliders-horizontal",
  bank:        "landmark",
  health:      "heart-pulse",
  factory:     "factory",
  leaf:        "leaf",
  cpu:         "cpu",
  gauge:       "gauge",
  mapPin:      "map-pin",
  branch:      "git-branch",
  scale:       "scale",
};

const Icon = ({ name, size = 18, className = "", style }) => {
  const slug = ICON_MAP[name] || name;
  const paths = (window.LUCIDE_PATHS && window.LUCIDE_PATHS[slug]) || "";
  // Wrap the path data in a fresh outer <svg> so the HTML parser sees an SVG fragment
  // and creates SVG-namespace nodes (paths render correctly).
  const html = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        width: size, height: size,
        verticalAlign: "middle",
        flexShrink: 0,
        lineHeight: 0,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// ============ Orange brand square (small logo) ============
const OrangeSquare = ({ size = 32 }) => (
  <div className="orange-square" style={{ width: size, height: size }}>
    <span style={{ width: size * 0.55 }} />
  </div>
);

// ============ EU flag (12-star ring) ============
const EUFlag = ({ size = 16 }) => {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return { x: 12 + Math.cos(a) * 7, y: 12 + Math.sin(a) * 7 };
  });
  return (
    <svg width={size * 1.5} height={size} viewBox="0 0 24 16" aria-hidden="true">
      <rect width="24" height="16" fill="#003399"/>
      <g transform="translate(0,-4)">
        {stars.map((s, i) => (
          <text key={i} x={s.x} y={s.y + 1} fontSize="3" fill="#FFCC00" textAnchor="middle" dominantBaseline="middle">★</text>
        ))}
      </g>
    </svg>
  );
};

// ============ French flag (clean 3-band) ============
const FrFlag = ({ size = 12 }) => (
  <span style={{ display: "inline-flex", width: size * 1.5, height: size, verticalAlign: "middle", boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.12)", flexShrink: 0 }} aria-label="France">
    <span style={{ flex: 1, background: "#0055A4" }} />
    <span style={{ flex: 1, background: "#fff" }} />
    <span style={{ flex: 1, background: "#EF4135" }} />
  </span>
);

// ============ Gcore wordmark placeholder ============
const GCoreMark = () => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    fontWeight: 700, fontSize: 13, letterSpacing: "-0.01em",
    color: "#000"
  }}>
    <span style={{
      width: 18, height: 18,
      background: "#000",
      color: "#fff",
      display: "grid", placeItems: "center",
      fontWeight: 900, fontSize: 11,
      borderRadius: "50%",
    }}>G</span>
    <span style={{ color: "#000" }}>Core</span>
  </span>
);

// ============ HF avatar ============
const HFOrgAvatar = ({ name, color = "#000", initial }) => (
  <div style={{
    width: 36, height: 36,
    background: color, color: "#fff",
    display: "grid", placeItems: "center",
    fontWeight: 700, fontSize: 14, borderRadius: 4,
    flexShrink: 0,
    fontFamily: "var(--font-sans)",
  }} title={name}>
    {initial || name?.[0]?.toUpperCase()}
  </div>
);

// ============ Navigation context ============
const NavCtx = createContext(null);
const useNav = () => useContext(NavCtx);

// ============ Topbar ============
const Topbar = ({ collapsed, onToggle }) => {
  const { screen, go, modelId } = useNav();
  const crumbs = useMemo(() => {
    const model = (window.MODELS || []).find(x => x.id === modelId);
    const modelName = model ? model.name : "Mistral-Small-3-24B-Instruct";
    const slug = modelId || "mistral-small-24b";
    const map = {
      catalogue:    [{ label: "AI Orchestrator", to: "catalogue" }, { label: "Model catalogue" }],
      detail:       [{ label: "AI Orchestrator", to: "catalogue" }, { label: "Catalogue", to: "catalogue" }, { label: modelName }],
      deploy:       [{ label: "AI Orchestrator", to: "catalogue" }, { label: "Catalogue", to: "catalogue" }, { label: "Deployment configuration" }],
      endpoint:     [{ label: "AI Orchestrator", to: "catalogue" }, { label: "Deployments", to: "endpoint" }, { label: `${slug} · paris-1` }],
      grid:         [{ label: "AI Orchestrator", to: "catalogue" }, { label: "AI Grid" }],
      edge:         [{ label: "AI Orchestrator", to: "catalogue" }, { label: "AI Grid", to: "grid" }, { label: "Edge Performance" }],
      monitor:      [{ label: "AI Orchestrator", to: "catalogue" }, { label: "Operations" }, { label: "Monitoring" }],
    };
    return map[screen] || [];
  }, [screen, modelId]);

  return (
    <header className="topbar">
      <div className="brand-lockup">
        <OrangeBusinessLogo size={32} />
        <div className="brand-divider" />
        <div className="brand-co">
          <div className="brand-co-eyebrow">AI Orchestrator</div>
          <div className="brand-co-partner">
            <span style={{ color: "var(--ink-faint)", fontSize: 11, fontWeight: 500 }}>powered by</span>
            <GcoreLogo size={20} wordmarkOnly />
          </div>
        </div>
      </div>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            {c.to ? (
              <button onClick={() => go(c.to)}>{c.label}</button>
            ) : (
              <span className="current">{c.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
      <div className="topbar-right">
        <span className="region-pill" title="Locked region — EU sovereignty">
          <EUFlag size={12} />
          <span>Region: EU</span>
          <Icon name="lock" size={12} className="lock" />
        </span>
        <div className="avatar" title="Mathilde D.">MD</div>
      </div>
    </header>
  );
};

// ============ Sidebar ============
const Sidebar = ({ collapsed, onToggle }) => {
  const { screen, go } = useNav();

  // Map current screen to sidebar id
  const activeId = ({
    catalogue: "catalogue", detail: "catalogue",
    deploy: "endpoint", endpoint: "endpoint",
    grid: "grid", edge: "grid",
    monitor: "monitor",
  })[screen];

  // Map current screen to its Act label
  const currentAct = ({
    catalogue: 1, detail: 1,
    deploy: 2, endpoint: 2,
    grid: 3, edge: 3,
  })[screen];

  const groups = [
    {
      act: 1,
      title: "Selection",
      desc: "Choose the model",
      items: [
        { id: "catalogue", icon: "catalog", label: "Model catalogue" },
      ],
    },
    {
      act: 2,
      title: "Deployment",
      desc: "Provision & serve",
      items: [
        { id: "endpoint", icon: "deploy", label: "Deployments", badge: 1 },
      ],
    },
    {
      act: 3,
      title: "Edge",
      desc: "Routing & impact",
      items: [
        { id: "grid", icon: "grid", label: "AI Grid" },
      ],
    },
  ];

  return (
    <aside className="sidebar">
      <div className="nav">
        {groups.map((g) => {
          const isActive = currentAct === g.act;
          return (
            <div key={g.act} className={`nav-group ${isActive ? "is-active" : ""}`}>
              {!collapsed && (
                <div className="nav-act">
                  <div className="nav-act-num">Act {String(g.act).padStart(2, "0")}</div>
                  <div className="nav-act-meta">
                    <span className="nav-act-title">{g.title}</span>
                    <span className="nav-act-desc">{g.desc}</span>
                  </div>
                </div>
              )}
              {g.items.map(it => (
                <button
                  key={it.id}
                  className={`nav-item ${activeId === it.id ? "active" : ""}`}
                  onClick={() => go(it.id)}
                  title={it.label}
                >
                  <Icon name={it.icon} size={16} className="ico" />
                  {!collapsed && (
                    <>
                      <span className="label" style={{ flex: 1 }}>{it.label}</span>
                      {it.badge && (
                        <span style={{
                          background: "var(--orange)", color: "#fff",
                          fontSize: 10, fontWeight: 700,
                          padding: "1px 6px", lineHeight: 1.2,
                        }}>{it.badge}</span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          );
        })}

        {/* Secondary nav */}
        {!collapsed && <div className="nav-divider" />}
        <button className={`nav-item ${activeId === "monitor" ? "active" : ""}`} onClick={() => go("monitor")} title="Monitoring">
          <Icon name="monitor" size={16} className="ico" />
          {!collapsed && <span className="label">Monitoring</span>}
        </button>
        <button className="nav-item" disabled style={{ opacity: 0.4, cursor: "not-allowed" }}>
          <Icon name="settings" size={16} className="ico" />
          {!collapsed && <span className="label">Settings</span>}
        </button>

        <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar"
          style={{ position: "static", margin: "12px 16px 4px", width: "calc(100% - 32px)", height: 26, gap: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--ink-faint)" }}>
          <Icon name={collapsed ? "chevron" : "chevronLeft"} size={11} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
      <div className="sovereign-card">
        <div className="h">
          <EUFlag size={10} />
          <span>{collapsed ? "" : "Sovereignty"}</span>
        </div>
        <div className="body">
          <span className="dot" />
          {!collapsed && <>EU jurisdiction · isolated data</>}
        </div>
      </div>
    </aside>
  );
};

// ============ Footer ============
const Footer = () => (
  <footer className="footer">
    <div>
      <span className="orange-square-mini" />
      Powered by Orange Cloud Avenue · NVIDIA × Gcore bare metal
    </div>
    <div style={{ display: "flex", gap: 16 }}>
      <span>v0.4.2-preview</span>
      <span>4 cloud regions · EU edge network</span>
    </div>
  </footer>
);

// ============ Shell wrapper ============
const Shell = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`app ${collapsed ? "collapsed" : ""}`}>
      <Topbar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main className="main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

Object.assign(window, {
  Icon, OrangeSquare, EUFlag, FrFlag, GCoreMark, HFOrgAvatar,
  NavCtx, useNav, Shell,
});
