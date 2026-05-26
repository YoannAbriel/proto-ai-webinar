/* global React, Icon, EUFlag, GCoreMark, useNav */
const { useState: useState2, useEffect: useEffect2, useMemo: useMemo2, useRef: useRef2 } = React;

// ============ Screen 3: Deployment configuration ============
const DeployScreen = () => {
  const { go } = useNav();
  const [step, setStep] = useState2(1);
  const [config, setConfig] = useState2({
    pop: "paris",
    hardware: "h100",
    allocation: "baremetal",
    isolatedEU: true,   // locked
    logsEU: true,
    hsm: true,
    scaling: "scale-to-zero",
    maxInstances: 4,
    edgeRouting: true,
  });
  const [edgeModalOpen, setEdgeModalOpen] = useState2(false);

  const canLaunch = step === 3;
  const handleLaunch = () => go("endpoint");

  return (
    <div className="fade-in">
      <button onClick={() => go("detail")} className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
        <Icon name="chevronLeft" size={14} />
        Back
      </button>

      <div className="page-head" style={{ alignItems: "center" }}>
        <div>
          <div className="kicker">Act 2 · Configuration</div>
          <h1>Deploy Mistral-Small-3-24B</h1>
          <p className="subtitle">Trois étapes pour passer en production. Sovereignty pré-câblée, scaling et edge en option.</p>
        </div>
        <button className="btn btn-primary btn-lg" disabled={!canLaunch} onClick={handleLaunch}>
          <Icon name="play" size={14} />
          Review & launch
        </button>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "stretch", marginBottom: 24, background: "#fff", boxShadow: "inset 0 0 0 1px var(--panel-border)" }}>
        {[
          [1, "Infrastructure", "server"],
          [2, "Sovereignty", "shield"],
          [3, "Scaling", "sliders"],
        ].map(([n, label, icon], idx) => (
          <button key={n} onClick={() => setStep(n)} style={{
            flex: 1,
            display: "flex", alignItems: "center", gap: 12,
            padding: "16px 24px",
            background: step === n ? "#000" : (step > n ? "var(--color-grey-100)" : "#fff"),
            color: step === n ? "#fff" : "#000",
            border: 0,
            borderRight: idx < 2 ? "1px solid var(--panel-border)" : 0,
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
            transition: "all var(--dur-base)",
          }}>
            <div style={{
              width: 28, height: 28,
              background: step > n ? "var(--color-success)" : (step === n ? "var(--orange)" : "var(--color-grey-300)"),
              color: "#fff",
              display: "grid", placeItems: "center",
              fontWeight: 700, fontSize: 13,
            }}>
              {step > n ? <Icon name="check" size={14} /> : n}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.7 }}>Step {n}</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 20, alignItems: "start" }}>
        <div>
          {step === 1 && <StepInfra config={config} setConfig={setConfig} onNext={() => setStep(2)} />}
          {step === 2 && <StepSovereign config={config} setConfig={setConfig} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <StepScaling config={config} setConfig={setConfig} onBack={() => setStep(2)} onLaunch={handleLaunch} openEdgeModal={() => setEdgeModalOpen(true)} />}
        </div>

        <DeploySummary config={config} canLaunch={canLaunch} onLaunch={handleLaunch} />
      </div>

      {edgeModalOpen && <EdgeInfoModal onClose={() => setEdgeModalOpen(false)} />}
    </div>
  );
};

// ============ Step 1: Infrastructure ============
const StepInfra = ({ config, setConfig, onNext }) => {
  const REGION_POPS = [
    { id: "paris",     city: "Paris",     country: "FR", lon: 2.35,  lat: 48.86, hub: true },
    { id: "amsterdam", city: "Amsterdam", country: "NL", lon: 4.9,   lat: 52.37 },
    { id: "frankfurt", city: "Francfort", country: "DE", lon: 8.68,  lat: 50.11 },
    { id: "madrid",    city: "Madrid",    country: "ES", lon: -3.7,  lat: 40.4 },
    { id: "milan",     city: "Milan",     country: "IT", lon: 9.19,  lat: 45.46 },
    { id: "warsaw",    city: "Varsovie",  country: "PL", lon: 21.0,  lat: 52.23 },
  ];

  return (
    <div className="panel fade-in" style={{ padding: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Infrastructure</h2>
      <p className="muted" style={{ margin: "0 0 24px", fontSize: 13 }}>Choose where your model is physically provisioned.</p>

      <SectionLabel>Region (POPs Gcore × Orange edge)</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 220px", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "var(--color-grey-100)", overflow: "hidden", aspectRatio: "1.6/1", position: "relative" }}>
          {window.EUMap ? (
            <EUMap theme="light" width={560} height={350} showLabels={true} pops={REGION_POPS}
                   hoveredPop={config.pop} onPopHover={(id) => id && setConfig(c => ({ ...c, pop: id }))}>
              {() => null}
            </EUMap>
          ) : <div style={{ padding: 20, color: "var(--ink-faint)" }}>Chargement carte…</div>}
        </div>
        <div>
          <div style={{ padding: 16, background: "var(--color-grey-100)", borderLeft: "3px solid var(--orange)" }}>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Selectionné</div>
            <div style={{ fontSize: 18, fontWeight: 700, margin: "4px 0" }}>Paris, FR</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 12 }}>Gcore PA-1 · Tier IV datacenter</div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span className="faint">H100 capacity</span><strong>248 GPU</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span className="faint">Local latency</span><strong>4 ms</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span className="faint">Energy</span><strong>98% nuclear</strong></div>
            </div>
          </div>
        </div>
      </div>

      <SectionLabel>Hardware</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { id: "h100", title: "1× H100 80GB", note: "Recommended · 142 tok/s", price: "€2.40", recommended: true },
          { id: "l40s", title: "2× L40S 48GB", note: "Equivalent · 128 tok/s", price: "€1.95" },
          { id: "a100", title: "1× A100 80GB", note: "Economical · 98 tok/s",  price: "€1.60" },
        ].map(h => (
          <RadioCard
            key={h.id}
            selected={config.hardware === h.id}
            onClick={() => setConfig(c => ({ ...c, hardware: h.id }))}
            title={h.title}
            note={h.note}
            extra={h.recommended && <span className="chip chip-orange" style={{ fontSize: 10 }}>Recommended</span>}
            price={h.price + "/h"}
          />
        ))}
      </div>

      <SectionLabel>Allocation type</SectionLabel>
      <div style={{ display: "flex", gap: 0, marginBottom: 24, border: "1px solid var(--color-grey-500)" }}>
        <button onClick={() => setConfig(c => ({ ...c, allocation: "baremetal" }))} style={{
          flex: 1, padding: "14px 18px",
          background: config.allocation === "baremetal" ? "#000" : "#fff",
          color: config.allocation === "baremetal" ? "#fff" : "#000",
          border: 0, fontFamily: "inherit", fontSize: 13, fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="server" size={16} />
            Dedicated bare metal
          </span>
          <span className="chip" style={{ background: config.allocation === "baremetal" ? "var(--orange)" : "rgba(255,121,0,0.1)", color: config.allocation === "baremetal" ? "#fff" : "var(--orange)", fontSize: 10 }}>Sovereign</span>
        </button>
        <button disabled title="Incompatible with strict sovereignty" style={{
          flex: 1, padding: "14px 18px",
          background: "var(--color-grey-100)",
          color: "var(--ink-faint)",
          borderLeft: "1px solid var(--color-grey-500)",
          fontFamily: "inherit", fontSize: 13, fontWeight: 700,
          cursor: "not-allowed", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="globe" size={16} />
            Shared container
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="lock" size={12} />
            <span style={{ fontSize: 10 }}>Blocked</span>
          </span>
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={onNext}>
          Next step
          <Icon name="arrow" size={14} />
        </button>
      </div>
    </div>
  );
};

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", margin: "0 0 12px" }}>{children}</div>
);

const RadioCard = ({ selected, onClick, title, note, price, extra, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: selected ? "rgba(255,121,0,0.04)" : "#fff",
    border: `2px solid ${selected ? "var(--orange)" : "var(--color-grey-400)"}`,
    padding: 16,
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex", flexDirection: "column", gap: 4,
    transition: "all var(--dur-fast)",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 14, height: 14, borderRadius: "50%",
          border: `2px solid ${selected ? "var(--orange)" : "var(--color-grey-500)"}`,
          background: selected ? "var(--orange)" : "transparent",
          boxShadow: selected ? "inset 0 0 0 2px #fff" : "none",
        }} />
        <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
      </div>
      {extra}
    </div>
    <div style={{ fontSize: 12, color: "var(--ink-soft)", marginLeft: 22 }}>{note}</div>
    {price && <div style={{ marginLeft: 22, fontSize: 13, fontWeight: 700, marginTop: 2 }}>{price}</div>}
  </button>
);

const EUMapPicker = null;
const EUOutline = null;

// ============ Step 2: Sovereignty ============
const StepSovereign = ({ config, setConfig, onNext, onBack }) => {
  return (
    <div className="panel fade-in" style={{ padding: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Sovereignty</h2>
      <p className="muted" style={{ margin: "0 0 20px", fontSize: 13 }}>Compliance guarantees on by default. Unchecking breaks AI Act compliance.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <SovereignRow
          icon="server" title="Processing data isolated in EU"
          desc="Inference exclusively on GPUs located in the EU. No out-of-zone pre-processing."
          on locked
        />
        <SovereignRow
          icon="receipt" title="Logs and telemetry in EU"
          desc="Logs stored on sovereign S3 (Paris). No export to SaaS telemetry."
          on={config.logsEU}
          onToggle={() => setConfig(c => ({ ...c, logsEU: !c.logsEU }))}
        />
        <SovereignRow
          icon="lock" title="Encryption at rest with EU HSM key"
          desc="ANSSI-certified HSM module · keys held by Orange Business, never exported."
          on={config.hsm}
          onToggle={() => setConfig(c => ({ ...c, hsm: !c.hsm }))}
        />
      </div>

      <div style={{
        background: "rgba(0,51,153,0.04)",
        border: "1px solid rgba(0,51,153,0.2)",
        borderLeft: "3px solid var(--eu)",
        padding: 16,
        display: "flex", gap: 12,
        marginBottom: 24,
      }}>
        <Icon name="info" size={20} className="" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Compliant configuration</div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
            This configuration meets <strong>AI Act (Art. 28 — general-purpose models)</strong>, <strong>RGPD</strong> et <strong>NIS2</strong>. Orange Business provides the contractual attestation.
          </div>
        </div>
        <span className="chip chip-eu" style={{ alignSelf: "flex-start" }}>
          <EUFlag size={10} />
          Compliant
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button className="btn btn-ghost" onClick={onBack}>
          <Icon name="chevronLeft" size={14} />
          Previous
        </button>
        <button className="btn btn-primary" onClick={onNext}>
          Next step
          <Icon name="arrow" size={14} />
        </button>
      </div>
    </div>
  );
};

const SovereignRow = ({ icon, title, desc, on, locked, onToggle }) => (
  <div style={{
    display: "flex", gap: 14, padding: 16,
    background: "#fff", border: "1px solid var(--line)",
    alignItems: "flex-start",
  }}>
    <div style={{
      width: 36, height: 36, background: on ? "rgba(50,200,50,0.1)" : "var(--color-grey-200)",
      color: on ? "#1e8e1e" : "var(--ink-faint)",
      display: "grid", placeItems: "center",
    }}>
      <Icon name={icon} size={18} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        {locked && <Icon name="lock" size={11} className="muted" />}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>{desc}</div>
    </div>
    <div className={`toggle ${on ? "on" : ""} ${locked ? "locked" : ""}`} onClick={!locked ? onToggle : undefined}>
      <span className="track" />
    </div>
  </div>
);

// ============ Step 3: Scaling ============
const StepScaling = ({ config, setConfig, onBack, onLaunch, openEdgeModal }) => {
  return (
    <div className="panel fade-in" style={{ padding: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Scaling & routing</h2>
      <p className="muted" style={{ margin: "0 0 24px", fontSize: 13 }}>How your endpoint reacts to load and where tokens are served.</p>

      <SectionLabel>Scaling strategy</SectionLabel>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <RadioCard
          selected={config.scaling === "always-on"}
          onClick={() => setConfig(c => ({ ...c, scaling: "always-on" }))}
          title="Always on"
          note="Zero cold start · €2.40/h continuous"
        />
        <RadioCard
          selected={config.scaling === "scale-to-zero"}
          onClick={() => setConfig(c => ({ ...c, scaling: "scale-to-zero" }))}
          title="Scale-to-zero after 5 min"
          note="€0/h idle · cold start ~12s"
          extra={<span className="chip chip-orange" style={{ fontSize: 10 }}>Economical</span>}
        />
      </div>

      <SectionLabel>Max capacity</SectionLabel>
      <div style={{ marginBottom: 24, padding: 18, background: "var(--color-grey-100)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 13 }}>Max instances under peak load</span>
          <strong style={{ fontSize: 16 }}>{config.maxInstances} GPU</strong>
        </div>
        <input
          type="range" min="1" max="20" value={config.maxInstances}
          onChange={e => setConfig(c => ({ ...c, maxInstances: +e.target.value }))}
          style={{ width: "100%", accentColor: "var(--orange)" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-faint)", marginTop: 4 }}>
          <span>1</span>
          <span>20</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 8 }}>
          Peak capacity : {config.maxInstances * 142} tok/s · {config.maxInstances * 568} req/min
        </div>
      </div>

      <SectionLabel>Orange edge routing</SectionLabel>
      <div style={{
        padding: 18,
        background: config.edgeRouting ? "linear-gradient(135deg, rgba(255,121,0,0.06), rgba(255,121,0,0.02))" : "#fff",
        border: `2px solid ${config.edgeRouting ? "var(--orange)" : "var(--color-grey-400)"}`,
      }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, background: "var(--orange)", color: "#fff", display: "grid", placeItems: "center" }}>
            <Icon name="grid" size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Enable edge routing via the Orange network (AI Grid)</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.5 }}>
              Requests will be routed to the Orange edge POP closest to the end user.
              Inference stays in Paris, but the token travels the Orange fibre backbone. <button onClick={openEdgeModal} style={{ background: "none", border: 0, color: "var(--orange)", padding: 0, fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Learn more →</button>
            </div>
          </div>
          <div className={`toggle ${config.edgeRouting ? "on" : ""}`} onClick={() => setConfig(c => ({ ...c, edgeRouting: !c.edgeRouting }))}>
            <span className="track" />
          </div>
        </div>
        {config.edgeRouting && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--orange)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, fontSize: 12 }}>
            <div><div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>POPs enabled</div><strong>14 EU</strong></div>
            <div><div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Target latency</div><strong>&lt; 40 ms</strong></div>
            <div><div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Additional cost</div><strong>€0.00</strong></div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={onBack}>
          <Icon name="chevronLeft" size={14} />
          Previous
        </button>
        <button className="btn btn-primary btn-lg" onClick={onLaunch}>
          <Icon name="play" size={14} />
          Review & launch
        </button>
      </div>
    </div>
  );
};

// ============ Récap (right column) ============
const DeploySummary = ({ config, canLaunch, onLaunch }) => {
  return (
    <div className="panel" style={{ position: "sticky", top: 80 }}>
      <div style={{ padding: 16, borderBottom: "1px solid var(--line)", background: "#000", color: "#fff" }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--orange)" }}>Summary</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>Deployment express</div>
      </div>
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
        <SummaryRow label="Model"  value="Mistral-Small-3-24B" />
        <SummaryRow label="Region"  value={<><span style={{ display: "inline-block", width: 14, height: 10, background: "#0055A4", marginRight: 4, verticalAlign: -1 }}><span style={{ display: "inline-block", width: 5, height: 10, background: "#fff" }} /><span style={{ display: "inline-block", width: 5, height: 10, background: "#EF4135" }} /></span>Paris (PA-1)</>} />
        <SummaryRow label="Hardware" value={config.hardware === "h100" ? "1× H100 80GB" : config.hardware === "l40s" ? "2× L40S 48GB" : "1× A100 80GB"} />
        <SummaryRow label="Allocation" value="Dedicated bare metal" />
        <SummaryRow label="Scaling" value={config.scaling === "scale-to-zero" ? "Scale-to-zero" : "Always on"} />
        <SummaryRow label="Max capacity" value={`${config.maxInstances} GPU`} />

        <hr className="divider" style={{ margin: "4px 0" }} />

        <div>
          <div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Cost</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <strong style={{ fontSize: 22 }}>€2.40</strong>
            <span className="faint" style={{ fontSize: 12 }}>/h active</span>
          </div>
          <div className="faint" style={{ fontSize: 11 }}>€0/h during scale-to-zero</div>
        </div>

        <hr className="divider" style={{ margin: "4px 0" }} />

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span className="chip chip-eu"><EUFlag size={10} />Sovereign</span>
          {config.edgeRouting && <span className="chip chip-orange"><Icon name="grid" size={10} />Orange Edge</span>}
          <span className="chip chip-success"><span className="dot" />AI Act ready</span>
        </div>
      </div>
      <div style={{ padding: 18, borderTop: "1px solid var(--line)" }}>
        <button className="btn btn-primary btn-block" style={{ width: "100%" }} disabled={!canLaunch} onClick={onLaunch}>
          {canLaunch ? <><Icon name="play" size={14} /> Review & launch</> : "Complete the steps"}
        </button>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}>
    <span className="faint">{label}</span>
    <strong style={{ textAlign: "right" }}>{value}</strong>
  </div>
);

// ============ Edge info modal ============
const EdgeInfoModal = ({ onClose }) => (
  <div onClick={onClose} style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "grid", placeItems: "center", zIndex: 100, padding: 24,
  }}>
    <div onClick={e => e.stopPropagation()} className="panel fade-in" style={{
      maxWidth: 540, background: "#fff", padding: 28, position: "relative",
    }}>
      <button onClick={onClose} style={{
        position: "absolute", top: 16, right: 16,
        background: "none", border: 0, cursor: "pointer", padding: 4,
      }}>
        <Icon name="close" size={18} />
      </button>
      <div className="kicker">Orange AI Grid</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: "4px 0 12px" }}>How edge routing works</h2>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)" }}>
        The model is deployed once on bare metal in Paris (sovereign). When a request arrives, it enters via the Orange edge POP closest to the end user, transits through the Orange fibre backbone to the GPU, and returns via the same POP.
      </p>
      <ul style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 18 }}>
        <li>100% Orange network traffic — no public internet transit</li>
        <li>Perceived latency reduced 3-4× for users outside Paris</li>
        <li>Lightweight cache replicated to POPs (KV cache, frequent embeddings)</li>
        <li>Coverage: 14 EU POPs, Asia/Africa expansion planned 2026</li>
      </ul>
      <div style={{ marginTop: 16, padding: 12, background: "var(--color-grey-100)", fontSize: 12, color: "var(--ink-soft)" }}>
        <strong>Orange differentiator :</strong> neither Gcore, OVH nor Scaleway can combine sovereign bare metal AND edge routing — Orange is the only EU operator running its own fibre network.
      </div>
      <button onClick={onClose} className="btn btn-secondary" style={{ marginTop: 16, width: "100%" }}>Got it</button>
    </div>
  </div>
);

Object.assign(window, { DeployScreen });

// ============ Review YAML modal ============
const ReviewYamlModal = ({ config, onClose, onConfirm }) => {
  const [copied, setCopied] = useState2(false);
  const [launching, setLaunching] = useState2(false);
  const bodyRef = useRef2(null);
  const yaml = buildYaml(config);

  useEffect2(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, []);

  const handleLaunch = () => {
    setLaunching(true);
    setTimeout(() => onConfirm(), 600);
  };

  const handleCopy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(yaml).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="review-overlay" onClick={onClose}>
      <div className="review-modal" onClick={e => e.stopPropagation()}>
        <header className="review-head">
          <div>
            <div className="kicker" style={{ margin: 0 }}>Review · before launch</div>
            <h2 style={{ margin: "4px 0 4px", fontSize: 20, fontWeight: 700 }}>Generated infrastructure manifest</h2>
            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
              This is the exact YAML the Orange AI Orchestrator will apply. Review, copy, or launch.
            </div>
          </div>
          <button onClick={onClose} className="pop-close" aria-label="Close">
            <Icon name="close" size={16} />
          </button>
        </header>

        <div className="review-body" ref={bodyRef}>
          {/* Quick summary chips */}
          <div className="review-chips">
            <SummaryChip icon="catalog"  label="Model"      value="Mistral-Small-3-24B" />
            <SummaryChip icon="globe"    label="Region"     value="Paris (PA-1)" />
            <SummaryChip icon="server"   label="Hardware"   value={hwLabel(config.hardware)} />
            <SummaryChip icon="shield"   label="Sovereign"  value="EU strict" highlight />
            <SummaryChip icon="grid"     label="Edge"       value={config.edgeRouting ? "AI Grid · 14 POPs" : "Disabled"} highlight={config.edgeRouting} />
            <SummaryChip icon="sliders"  label="Scale"      value={config.scaling === "scale-to-zero" ? `→0 · max ${config.maxInstances}` : `Always · max ${config.maxInstances}`} />
          </div>

          {/* YAML preview */}
          <div className="review-yaml-wrap">
            <div className="review-yaml-head">
              <span className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>orange-orchestrator/v1 · deployment.yaml</span>
              <button onClick={handleCopy} className="btn btn-ghost btn-sm" style={{ color: "#fff", padding: "4px 10px" }}>
                <Icon name={copied ? "check" : "copy"} size={12} />
                {copied ? "Copied" : "Copy YAML"}
              </button>
            </div>
            <pre className="review-yaml">{highlightYaml(yaml)}</pre>
          </div>

          {/* Pre-flight checks */}
          <div className="review-checks">
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", margin: "0 0 10px" }}>Pre-flight checks</h3>
            <Check label="Region quota available"                  status="ok"  meta="Paris PA-1 · 247 / 248 H100 free" />
            <Check label="Model weights cached on EU mirror"       status="ok"  meta="47 GB · checksum verified" />
            <Check label="Sovereignty policy enforced"             status="ok"  meta="AI Act + RGPD + NIS2 ready" />
            <Check label="Edge cache plan generated"                status={config.edgeRouting ? "ok" : "skip"} meta={config.edgeRouting ? "14 POPs will warm cache" : "edge routing disabled"} />
            <Check label="Cost cap configured"                     status="warn" meta="Cap not set — billed to your tenant. Set later in Settings." />
          </div>
        </div>

        <footer className="review-foot">
          <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
            By launching you accept the Orange Business AI Orchestrator Terms · billed per second
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} className="btn btn-outline">Back to config</button>
            <button onClick={handleLaunch} className="btn btn-primary btn-lg" disabled={launching}>
              {launching ? (
                <>
                  <span style={{ width: 12, height: 12, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  Launching…
                </>
              ) : (
                <>
                  <Icon name="play" size={14} />
                  Launch deployment
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

const SummaryChip = ({ icon, label, value, highlight }) => (
  <div className="review-chip" style={highlight ? { borderColor: "var(--orange)", background: "rgba(255,121,0,0.05)" } : null}>
    <div className="review-chip-icon" style={highlight ? { background: "var(--orange)", color: "#fff" } : null}>
      <Icon name={icon} size={14} />
    </div>
    <div>
      <div className="review-chip-label">{label}</div>
      <div className="review-chip-value">{value}</div>
    </div>
  </div>
);

const Check = ({ label, status, meta }) => {
  const c = status === "ok"   ? { icon: "check", color: "#1e8e1e" }
        : status === "warn"   ? { icon: "info",  color: "#b45309" }
        : status === "skip"   ? { icon: "close", color: "var(--ink-faint)" }
        :                       { icon: "close", color: "#dc2626" };
  return (
    <div className="review-check">
      <div className="review-check-icon" style={{ color: c.color, background: status === "ok" ? "rgba(50,200,50,0.12)" : status === "warn" ? "rgba(255,204,0,0.18)" : "var(--color-grey-200)" }}>
        <Icon name={c.icon} size={12} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{meta}</div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: c.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {status === "ok" ? "Pass" : status === "warn" ? "Warning" : status === "skip" ? "Skipped" : "Fail"}
      </span>
    </div>
  );
};

const hwLabel = (h) => h === "h100" ? "1× H100 80GB" : h === "l40s" ? "2× L40S 48GB" : "1× A100 80GB";

// Build a deterministic YAML manifest from the deploy config
function buildYaml(c) {
  const hw = c.hardware === "h100" ? "h100-80gb"
           : c.hardware === "l40s" ? "l40s-48gb"
           :                          "a100-80gb";
  const replicas = c.hardware === "l40s" ? 2 : 1;
  return `apiVersion: orange-orchestrator/v1
kind: Deployment
metadata:
  name: mistral-small-24b
  region: paris-1
  tenant: orange-business
spec:
  model:
    source: huggingface
    repo: mistralai/Mistral-Small-3-24B-Instruct
    revision: main
    weights: safetensors
    sha256: c1b8...verified
  infrastructure:
    provider: gcore
    site: PA-1
    hardware: ${hw}
    replicas: ${replicas}
    allocation: ${c.allocation === "baremetal" ? "bare-metal-dedicated" : "shared-container"}
  sovereignty:
    strict: true
    dataProcessingRegion: EU
    logsRegion: ${c.logsEU ? "EU" : "GLOBAL"}
    encryption:
      atRest: ${c.hsm ? "hsm-eu-anssi" : "aes256"}
      keyHolder: orange-business
    attestations:
      - ai-act-article-28
      - gdpr
      - nis2
  scaling:
    strategy: ${c.scaling === "scale-to-zero" ? "scale-to-zero" : "always-on"}
    idleTimeoutSeconds: ${c.scaling === "scale-to-zero" ? 300 : "null"}
    minReplicas: ${c.scaling === "scale-to-zero" ? 0 : 1}
    maxReplicas: ${c.maxInstances}
    targetGpuUtilization: 0.75
  routing:
    edge:
      enabled: ${c.edgeRouting}
      network: orange-fibre
      pops: 14
      strategy: nearest-user
    public:
      url: https://api.gcore.orange-ai.eu/v1/chat/completions
      openaiCompatible: true
  cost:
    estimateHourly: €${c.hardware === "h100" ? "2.40" : c.hardware === "l40s" ? "1.95" : "1.60"}
    billingGranularity: second
  observability:
    metrics: sovereign-prometheus-eu
    logs: sovereign-s3-paris
    retentionDays: 30
`;
}

// Highlight YAML for the preview pane. Returns an array of React nodes.
function highlightYaml(yaml) {
  return yaml.split("\n").map((line, i) => {
    if (line.trim() === "") return <span key={i}>{"\n"}</span>;
    const indent = line.match(/^\s*/)[0];
    const rest = line.slice(indent.length);
    // Comment line
    if (rest.startsWith("#")) return <span key={i}>{indent}<span style={{ color: "#6b7280" }}>{rest}</span>{"\n"}</span>;
    // List item
    if (rest.startsWith("- ")) {
      return <span key={i}>{indent}<span style={{ color: "#a78bfa" }}>- </span><span style={{ color: "#fbbf24" }}>{rest.slice(2)}</span>{"\n"}</span>;
    }
    // key: value
    const colonIdx = rest.indexOf(":");
    if (colonIdx > -1) {
      const key = rest.slice(0, colonIdx);
      const value = rest.slice(colonIdx + 1).trimStart();
      return (
        <span key={i}>
          {indent}
          <span style={{ color: "#60a5fa" }}>{key}</span>
          <span style={{ color: "#9ca3af" }}>:</span>
          {value && <> <span style={{ color: yamlValueColor(value) }}>{value}</span></>}
          {"\n"}
        </span>
      );
    }
    return <span key={i}>{line}{"\n"}</span>;
  });
}
function yamlValueColor(v) {
  if (v === "true" || v === "false" || v === "null") return "#c084fc";
  if (/^-?\d+(\.\d+)?$/.test(v)) return "#fbbf24";
  return "#fbbf24";
}
