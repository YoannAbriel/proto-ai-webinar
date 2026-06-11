/* global React, Icon, BrandAvatar, EUFlag, HuggingFaceIcon, useNav */
const { useState: useState1, useMemo: useMemo1 } = React;

// ============ Model data ============
const MODELS = [
  { id: "mistral-small-24b", name: "Mistral-Small-3-24B-Instruct", org: "Mistral AI", orgColor: "#ff5f00", initial: "M", task: "Text generation", size: "24B", license: "Apache 2.0", downloads: "1.2M", likes: "8.4k", updated: "3 days ago", featured: true, ctx: "32k tokens", precision: "bf16", weight: "47 GB", euReady: true },
  { id: "llama-3-8b",       name: "Meta-Llama-3-8B-Instruct",      org: "Meta",        orgColor: "#0866ff", initial: "M", task: "Text generation", size: "8B",  license: "Llama 3",   downloads: "4.8M", likes: "12.1k", updated: "1 week ago", euReady: true },
  { id: "qwen-2-5-72b",     name: "Qwen2.5-72B-Instruct",          org: "Qwen / Alibaba", orgColor: "#9333ea", initial: "Q", task: "Text generation", size: "72B", license: "Qwen", downloads: "892k", likes: "5.1k", updated: "2 days ago" },
  { id: "bge-m3",           name: "bge-m3",                         org: "BAAI",        orgColor: "#16a34a", initial: "B", task: "Embeddings",      size: "560M", license: "MIT",       downloads: "3.4M", likes: "2.8k", updated: "2 months ago", euReady: true },
  { id: "phi-3-mini",       name: "Phi-3-mini-4k-instruct",         org: "Microsoft",   orgColor: "#0078d4", initial: "M", task: "Text generation", size: "3.8B", license: "MIT",      downloads: "2.1M", likes: "4.6k", updated: "1 month ago", euReady: true },
  { id: "whisper-l3",       name: "whisper-large-v3",               org: "OpenAI",      orgColor: "#10a37f", initial: "O", task: "Audio",           size: "1.5B", license: "MIT",      downloads: "8.7M", likes: "9.8k", updated: "4 months ago", euReady: true },
  { id: "llava-next",       name: "llava-v1.6-mistral-7b",          org: "LLaVA",       orgColor: "#dc2626", initial: "L", task: "Vision",          size: "7B",   license: "Apache 2.0", downloads: "412k", likes: "1.9k", updated: "2 weeks ago", euReady: true },
  { id: "codellama-34b",    name: "CodeLlama-34b-Instruct-hf",      org: "Meta",        orgColor: "#0866ff", initial: "M", task: "Text generation", size: "34B",  license: "Llama 2",  downloads: "654k", likes: "3.2k", updated: "1 month ago" },
  { id: "mxbai-embed",      name: "mxbai-embed-large-v1",           org: "mixedbread",  orgColor: "#ca8a04", initial: "m", task: "Embeddings",      size: "335M", license: "Apache 2.0", downloads: "987k", likes: "1.4k", updated: "3 weeks ago", euReady: true },
];

// Parse a HuggingFace-style size string ("560M", "24B") into billions of params.
const sizeToB = (s) => {
  const n = parseFloat(s);
  return /m/i.test(s) ? n / 1000 : n;
};
// Carbon for 1M tokens served on the French (low-carbon) grid — drives the card + the filter.
const modelCarbonFR = (id) => (window.gco2PerMtok ? window.gco2PerMtok(id, "FR") : 0);

const RECOMMENDED = [
  { id: "mistral-small-24b", name: "Mistral-Small-3-24B", org: "Mistral AI", note: "Sovereign · Native French" },
  { id: "bge-m3",            name: "bge-m3 (Embeddings)",  org: "BAAI",       note: "Multilingual RAG" },
  { id: "phi-3-mini",        name: "Phi-3-mini",           org: "Microsoft",  note: "Edge · 3.8B compact" },
  { id: "llava-next",        name: "llava-v1.6-mistral",   org: "LLaVA",      note: "Vision · OCR documents" },
];

// ============ Screen 1: Catalogue ============
const SIZE_OPTIONS = { "Any size": Infinity, "≤ 8B": 8, "≤ 34B": 34, "≤ 70B": 70 };
const LICENSE_OPTIONS = ["All licenses", "Open source", "Commercial"];
const TASK_OPTIONS = ["All tasks", "Text generation", "Embeddings", "Vision", "Audio"];
// Open-source = OSI licenses (Apache/MIT/BSD); the rest (Llama, Qwen…) are
// custom/community licenses, grouped as "Commercial".
const isOpenSourceLicense = (lic) => /apache|mit|bsd/i.test(lic || "");

const CatalogueScreen = () => {
  const { openModel } = useNav();
  const [filters, setFilters] = useState1({
    task: "All tasks",
    license: "All licenses",
    size: "Any size",
    privateGpu: true,
    lowCarbon: false,
  });
  const [search, setSearch] = useState1("");

  // Real filtering — search + every chip now narrows the grid.
  const filtered = useMemo1(() => {
    const q = search.trim().toLowerCase();
    const sizeCap = SIZE_OPTIONS[filters.size] ?? Infinity;
    return MODELS.filter(m => {
      if (q && !(`${m.name} ${m.org} ${m.task}`.toLowerCase().includes(q))) return false;
      if (filters.task !== "All tasks" && m.task !== filters.task) return false;
      if (filters.license === "Open source" && !isOpenSourceLicense(m.license)) return false;
      if (filters.license === "Commercial" && isOpenSourceLicense(m.license)) return false;
      if (sizeToB(m.size) > sizeCap) return false;
      if (filters.lowCarbon && modelCarbonFR(m.id) > 150) return false;
      return true;
    });
  }, [search, filters]);

  // Sovereignty index reacts to what the operator narrows to.
  const sovScore = filtered.length ? Math.round(filtered.reduce((s, m) => s + (m.euReady ? 99 : 92), 0) / filtered.length) : 0;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="kicker">Act 1 · Catalogue</div>
          <h1>Model catalogue</h1>
          <p className="subtitle">
            Browse any open <strong>HuggingFace</strong> model, deploy it on <strong>sovereign EU</strong>.
          </p>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <span className="faint" style={{ fontSize: 12 }}>Updated 12&nbsp;min</span>
          <button className="btn btn-outline btn-sm">
            <Icon name="refresh" size={14} />
            Sync HF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="panel" style={{ marginBottom: 24, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, borderBottom: "1px solid var(--line)" }}>
          <div style={{ position: "relative" }}>
            <input
              className="input"
              style={{ paddingLeft: 40, height: 44 }}
              placeholder="Search by name, task, organisation…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div style={{ position: "absolute", left: 14, top: 14, color: "var(--ink-faint)" }}>
              <Icon name="search" size={16} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>Filters</span>
            <FilterChip label="Task" value={filters.task} options={TASK_OPTIONS} onChange={v => setFilters(f => ({ ...f, task: v }))} />
            <FilterChip label="Size" value={filters.size} options={Object.keys(SIZE_OPTIONS)} onChange={v => setFilters(f => ({ ...f, size: v }))} />
            <FilterChip label="License" value={filters.license} options={LICENSE_OPTIONS} onChange={v => setFilters(f => ({ ...f, license: v }))} />
            <ToggleChip label="Private GPUs" on={filters.privateGpu} onClick={() => setFilters(f => ({ ...f, privateGpu: !f.privateGpu }))} />
            <ToggleChip label="Low carbon" icon="leaf" on={filters.lowCarbon} onClick={() => setFilters(f => ({ ...f, lowCarbon: !f.lowCarbon }))} />
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-faint)" }}>
              <strong style={{ color: "#000" }}>{filtered.length}</strong> of {MODELS.length} models
            </span>
          </div>
        </div>
      </div>

      {/* Layout: cards take primary, recommendations drop to bottom strip */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 20, alignItems: "start" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {filtered.length === 0 && (
            <div className="panel" style={{ padding: 32, textAlign: "center", color: "var(--ink-faint)", gridColumn: "1 / -1" }}>
              No model matches these filters. <button onClick={() => { setSearch(""); setFilters({ task: "All tasks", license: "All licenses", size: "Any size", privateGpu: true, lowCarbon: false }); }} style={{ background: "none", border: 0, color: "var(--orange)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Reset filters</button>
            </div>
          )}
          {filtered.map(m => <ModelCard key={m.id} m={m} onOpen={() => openModel(m.id)} />)}
        </div>

        <div style={{ position: "sticky", top: 200, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Sovereignty index — kept prominent at the top of the rail */}
          <div className="panel" style={{ padding: 18 }}>
            <div className="kicker" style={{ color: "var(--ink-faint)", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="gauge" size={13} className="" style={{ color: "var(--orange)" }} />
              Sovereignty index
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "4px 0" }}>
              {sovScore}<span style={{ fontSize: 14, color: "var(--ink-faint)" }}>/100</span>
            </div>
            <div style={{ height: 6, background: "var(--color-grey-200)", marginBottom: 8 }}>
              <div style={{ width: `${sovScore}%`, height: "100%", background: "var(--orange)", transition: "width var(--dur-base)" }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
              {filtered.length} model{filtered.length === 1 ? "" : "s"} deployable on Gcore EU bare metal · keys in EU HSM, outside the US Cloud Act.
            </div>
          </div>

          {/* Recommended */}
          <div className="panel">
            <div style={{ padding: "16px 20px", background: "#000", color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="spark" size={16} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--orange)" }}>Recommended</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>by Orange Business</div>
              </div>
            </div>
            <div>
              {RECOMMENDED.map((r, i) => (
                <div key={r.id} onClick={() => openModel(r.id)} style={{
                  padding: "14px 18px",
                  display: "flex", gap: 12, alignItems: "center",
                  borderBottom: i < RECOMMENDED.length - 1 ? "1px solid var(--line)" : 0,
                  cursor: "pointer",
                }}>
                  <BrandAvatar org={r.org} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{r.note}</div>
                  </div>
                  <Icon name="chevron" size={14} className="muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterChip = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState1(false);
  const active = value && !/^(All|Any)/.test(value);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: active ? "rgba(255,121,0,0.08)" : "#fff",
        border: `1px solid ${active ? "var(--orange)" : "var(--color-grey-500)"}`,
        padding: "6px 12px",
        fontSize: 12, fontWeight: 500,
        cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "inherit",
      }}>
        <span style={{ color: "var(--ink-faint)" }}>{label}:</span>
        <strong style={{ color: active ? "var(--orange)" : "#000", fontWeight: 700 }}>{value}</strong>
        <Icon name="chevronDown" size={12} />
      </button>
      {open && options && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 20,
            background: "#fff", border: "1px solid var(--color-grey-500)",
            boxShadow: "var(--shadow-md)", minWidth: 160, padding: 4,
          }}>
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange && onChange(opt); setOpen(false); }} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                width: "100%", textAlign: "left", background: opt === value ? "var(--color-grey-100)" : "transparent",
                border: 0, padding: "8px 10px", fontSize: 13, fontFamily: "inherit",
                color: "#000", cursor: "pointer", fontWeight: opt === value ? 700 : 500,
              }}>
                {opt}
                {opt === value && <Icon name="check" size={12} style={{ color: "var(--orange)" }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ToggleChip = ({ label, on, onClick, icon }) => (
  <button onClick={onClick} style={{
    background: on ? "rgba(255,121,0,0.1)" : "#fff",
    border: `1px solid ${on ? "var(--orange)" : "var(--color-grey-500)"}`,
    color: on ? "var(--orange)" : "#000",
    padding: "6px 12px",
    fontSize: 12, fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: "inherit",
  }}>
    <span style={{
      width: 14, height: 14,
      border: `2px solid ${on ? "var(--orange)" : "var(--color-grey-500)"}`,
      background: on ? "var(--orange)" : "transparent",
      display: "grid", placeItems: "center",
    }}>
      {on && <Icon name="check" size={10} className="" />}
    </span>
    {icon && <Icon name={icon} size={13} />}
    {label}
  </button>
);

const ModelCard = ({ m, onOpen }) => (
  <div className="panel" style={{
    padding: 18, display: "flex", flexDirection: "column", gap: 12,
    transition: "transform var(--dur-base), box-shadow var(--dur-base)",
    cursor: "pointer",
  }}
    onClick={onOpen}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-md), inset 0 0 0 1px var(--orange)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = ""}
  >
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <BrandAvatar org={m.org} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "var(--ink-faint)", marginBottom: 2, display: "flex", alignItems: "center", gap: 5 }}>
          <HuggingFaceIcon size={14} />
          {m.org}
        </div>
        <div style={{
          fontSize: 14, fontWeight: 700, lineHeight: 1.2, wordBreak: "break-word",
          minHeight: "2.4em",                 // reserve 2 lines so every card aligns
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }} title={m.name}>{m.name}</div>
      </div>
      {m.featured && <span className="chip chip-orange" style={{ fontSize: 10, flexShrink: 0 }}>Demo flagship</span>}
    </div>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <span className="chip chip-outline">{m.task}</span>
      <span className="chip chip-outline">{m.size}</span>
      <span className="chip chip-outline">{m.license}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--ink-faint)", flexWrap: "wrap" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }} title="Recommended Gcore hardware">
        <Icon name="cpu" size={12} />
        {window.hwLabelFull ? window.hwLabelFull(m.id) : "1× H100 80GB"}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#1e8e1e" }} title="CO₂ per 1M tokens on the French low-carbon grid">
        <Icon name="leaf" size={12} />
        {modelCarbonFR(m.id)} g/Mtok
      </span>
    </div>
    <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--ink-faint)" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        <Icon name="download" size={11} />
        {m.downloads}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        <Icon name="heart" size={11} />
        {m.likes}
      </span>
      <span style={{ marginLeft: "auto" }}>{m.updated}</span>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--line)", marginTop: "auto" }}>
      <span className="chip chip-eu">
        <EUFlag size={10} />
        EU deployable
      </span>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--orange)", display: "inline-flex", alignItems: "center", gap: 4 }}>
        View details
        <Icon name="chevron" size={12} />
      </span>
    </div>
  </div>
);

// ============ Screen 2: Model Detail ============
const DetailScreen = () => {
  const { go, modelId } = useNav();
  const m = MODELS.find(x => x.id === modelId) || MODELS[0];
  const hw = window.hwFor ? window.hwFor(m.id) : { costPerH: 2.40 };
  const [tab, setTab] = useState1("overview");

  return (
    <div className="fade-in">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 24, alignItems: "start" }}>
        {/* Left col */}
        <div>
          <button onClick={() => go("catalogue")} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
            <Icon name="chevronLeft" size={14} />
            Back to catalogue
          </button>

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
            <BrandAvatar org={m.org} size={48} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <HuggingFaceIcon size={14} />
                {m.org} · <a href="#" style={{ color: "var(--ink-faint)" }}>huggingface.co/{m.name}</a>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>{m.name}</h1>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                <span className="chip chip-outline">{m.task}</span>
                <span className="chip chip-outline">{m.size}</span>
                <span className="chip chip-outline">{m.license}</span>
                <span className="chip chip-outline">{m.ctx}</span>
                <span className="chip chip-eu"><EUFlag size={10} />EU deployable</span>
                <span className="chip chip-success"><span className="dot" />Bare metal compatible</span>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => go("deploy")}>
              Deploy to Gcore
              <Icon name="arrow" size={14} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--line)", marginBottom: 24 }}>
            {[
              ["overview", "Overview"],
              ["modelcard", "Model card"],
              ["files", "Files"],
              ["benchmark", "Benchmark"],
              ["license", "License"],
            ].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                background: "none", border: 0,
                padding: "12px 18px",
                fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                color: tab === id ? "#000" : "var(--ink-faint)",
                borderBottom: `3px solid ${tab === id ? "var(--orange)" : "transparent"}`,
                marginBottom: -1, cursor: "pointer",
              }}>{label}</button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "overview" && <DetailOverview m={m} />}
          {tab === "modelcard" && <DetailModelCard />}
          {tab === "files" && <DetailFiles />}
          {tab === "benchmark" && <DetailBenchmark />}
          {tab === "license" && <DetailLicense />}
        </div>

        {/* Right col — deploy panel */}
        <div className="panel" style={{ padding: 24, position: "sticky", top: 80 }}>
          <div className="kicker">Deployment express</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 16px" }}>Launch in 3 minutes</h3>

          <DeployField label="Region">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1px solid var(--color-grey-500)", background: "#fff" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FrFlag size={12} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Paris (Cloud Avenue PA-1)</span>
              </span>
              <Icon name="lock" size={12} className="muted" />
            </div>
            <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>Primary · +3 Cloud Avenue regions available</div>
          </DeployField>

          <DeployField label="Instance type">
            <div style={{ padding: "10px 12px", border: "1px solid var(--color-grey-500)", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{hw.gpu} bare metal</span>
              <Icon name="chevronDown" size={12} />
            </div>
          </DeployField>

          <div style={{ background: "var(--color-grey-100)", padding: 14, margin: "16px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
            <div>
              <div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Provisioning</div>
              <div style={{ fontWeight: 700 }}>~3 min</div>
            </div>
            <div>
              <div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Active cost</div>
              <div style={{ fontWeight: 700 }}>€{hw.costPerH.toFixed(2)}/h</div>
            </div>
            <div style={{ gridColumn: "1 / -1", paddingTop: 8, borderTop: "1px solid var(--line)" }}>
              <span className="chip chip-success" style={{ fontSize: 10 }}>
                <span className="dot" />Scale-to-zero ON · €0/h inactif
              </span>
            </div>
          </div>

          <SovereignToggle locked />

          <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 16 }} onClick={() => go("deploy")}>
            Deploy now
            <Icon name="arrow" size={14} />
          </button>
          <p className="faint" style={{ fontSize: 11, marginTop: 10, textAlign: "center", margin: "10px 0 0" }}>
            Billed per second · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

const DeployField = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", marginBottom: 6 }}>{label}</div>
    {children}
  </div>
);

const SovereignToggle = ({ locked }) => (
  <div style={{ padding: 14, background: "rgba(0,51,153,0.04)", border: "1px solid rgba(0,51,153,0.2)" }}>
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <EUFlag size={14} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Strict sovereignty</div>
        <div style={{ fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.4 }}>
          Zero data flow outside EU. AI Act & GDPR compliant.
        </div>
      </div>
      <div className="toggle on locked">
        <span className="track" />
      </div>
    </div>
  </div>
);

Object.assign(window, { CatalogueScreen, DetailScreen, MODELS });
