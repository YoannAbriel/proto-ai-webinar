/* global React, Icon, EUFlag, GCoreMark, useNav */
const { useState: useState2, useEffect: useEffect2, useMemo: useMemo2, useRef: useRef2 } = React;

// ============ Screen 3: Deployment configuration ============
const DeployScreen = () => {
  const { go, modelId } = useNav();
  const model = (window.MODELS || []).find(x => x.id === modelId) || (window.MODELS || [])[0] || { name: "Mistral-Small-3-24B", id: "mistral-small-24b" };
  const hw = window.hwFor ? window.hwFor(model.id) : { gpu: "H100", costPerH: 2.40, tokps: 142 };
  const [step, setStep] = useState2(1);
  const [config, setConfig] = useState2({
    deployPops: ["paris"],          // multi-POP bare-metal deployment (primary first)
    hardware: (hw.gpu || "H100").toLowerCase(),
    allocation: "baremetal",
    isolatedEU: true,   // locked
    logsEU: true,
    hsm: true,
    scaling: "scale-to-zero",
    maxInstances: 4,
    edgeRouting: true,
    dynamo: true,       // NVIDIA Dynamo inference optimisation
  });
  const [edgeModalOpen, setEdgeModalOpen] = useState2(false);

  const canLaunch = step === 3;
  const handleLaunch = () => {
    // Carry the configuration into the live endpoint so it reflects real choices.
    window.__deployConfig = { config, model, hw };
    go("endpoint");
  };

  return (
    <div className="fade-in">
      <button onClick={() => go("detail")} className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
        <Icon name="chevronLeft" size={14} />
        Back
      </button>

      <div className="page-head" style={{ alignItems: "center" }}>
        <div>
          <div className="kicker">Act 2 · Configuration</div>
          <h1>Deploy {model.name}</h1>
          <p className="subtitle">Three steps to production. Sovereignty scored live, carbon and edge optimised.</p>
        </div>
        <button className="btn btn-primary btn-lg" disabled={!canLaunch} onClick={handleLaunch}>
          <Icon name="play" size={14} />
          Launch deployment
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
          {step === 1 && <StepInfra config={config} setConfig={setConfig} model={model} hw={hw} onNext={() => setStep(2)} />}
          {step === 2 && <StepSovereign config={config} setConfig={setConfig} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <StepScaling config={config} setConfig={setConfig} model={model} hw={hw} onBack={() => setStep(2)} onLaunch={handleLaunch} openEdgeModal={() => setEdgeModalOpen(true)} />}
        </div>

        <DeploySummary config={config} model={model} hw={hw} canLaunch={canLaunch} onLaunch={handleLaunch} />
      </div>

      {edgeModalOpen && <EdgeInfoModal onClose={() => setEdgeModalOpen(false)} />}
    </div>
  );
};

// ============ Step 1: Infrastructure ============
const StepInfra = ({ config, setConfig, model, hw, onNext }) => {
  const ALL_POPS = window.DEPLOY_POPS || [];
  const CARBON = window.CARBON_INTENSITY || {};
  const MIX = window.ENERGY_MIX || {};
  const canHost = (pop) => window.popCanHost ? window.popCanHost(pop, model.id) : true;
  const primary = config.deployPops[0];
  const primaryPop = (window.POP_BY_ID || {})[primary] || ALL_POPS[0] || {};
  const carbonPrimary = CARBON[primaryPop.country] || 56;

  const togglePop = (id) => setConfig(c => {
    if (id === c.deployPops[0]) return c;                 // primary stays
    const has = c.deployPops.includes(id);
    return { ...c, deployPops: has ? c.deployPops.filter(p => p !== id) : [...c.deployPops, id] };
  });

  return (
    <div className="panel fade-in" style={{ padding: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Infrastructure</h2>
      <p className="muted" style={{ margin: "0 0 24px", fontSize: 13 }}>Deploy the model on bare metal in one or several EU sites, for residency, latency and a low-carbon grid.</p>

      <SectionLabel>Deployment regions · Cloud Avenue (Oslo, Stockholm, Berlin, Paris) + EU DCs</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 240px", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "var(--color-grey-100)", overflow: "hidden", aspectRatio: "1.6/1", position: "relative" }}>
          {window.EUMap ? (
            <EUMap theme="light" width={560} height={350} showLabels={true} center={[11, 55]} scaleFactor={0.62}
                   pops={ALL_POPS.map(p => ({ ...p, hub: config.deployPops.includes(p.id), hubLabel: false }))}
                   selectedPop={primary} onPopClick={(id) => { const p = (window.POP_BY_ID||{})[id]; if (p && canHost(p)) togglePop(id); }}>
              {() => null}
            </EUMap>
          ) : <div style={{ padding: 20, color: "var(--ink-faint)" }}>Loading map…</div>}
        </div>
        <div>
          <div style={{ padding: 16, background: "var(--color-grey-100)", borderLeft: "3px solid var(--orange)" }}>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Deployment footprint</div>
            <div style={{ fontSize: 18, fontWeight: 700, margin: "4px 0" }}>{config.deployPops.length} site{config.deployPops.length > 1 ? "s" : ""}</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 12 }}>
              {config.deployPops.map(id => (window.POP_BY_ID||{})[id]?.city).filter(Boolean).join(" · ")}
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span className="faint">Primary</span><strong>{primaryPop.city} {primaryPop.country}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span className="faint">Local latency</span><strong>{primaryPop.latency} ms</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 0" }}>
                <span className="faint" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="leaf" size={12} style={{ color: "#1e8e1e" }} />Carbon</span>
                <strong style={{ color: "#1e8e1e" }}>{carbonPrimary} g/kWh</strong>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 8, lineHeight: 1.4 }}>{MIX[primaryPop.country]}</div>
          </div>
        </div>
      </div>

      {/* POP picker — gated on GPU availability for this model */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 24 }}>
        {ALL_POPS.map(pop => {
          const selected = config.deployPops.includes(pop.id);
          const hostable = canHost(pop);
          const isPrimary = pop.id === primary;
          return (
            <button key={pop.id} disabled={!hostable} onClick={() => togglePop(pop.id)} style={{
              textAlign: "left", padding: "10px 12px", fontFamily: "inherit", cursor: hostable ? "pointer" : "not-allowed",
              background: selected ? "rgba(255,121,0,0.06)" : "#fff",
              border: `2px solid ${selected ? "var(--orange)" : "var(--color-grey-400)"}`,
              opacity: hostable ? 1 : 0.55,
              display: "flex", flexDirection: "column", gap: 3,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 13, height: 13, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${selected ? "var(--orange)" : "var(--color-grey-500)"}`,
                    background: selected ? "var(--orange)" : "transparent", boxShadow: selected ? "inset 0 0 0 2px #fff" : "none",
                  }} />
                  {pop.city}
                </span>
                {isPrimary ? <span className="chip chip-orange" style={{ fontSize: 9 }}>Primary</span>
                  : pop.strategic ? <span className="chip chip-outline" style={{ fontSize: 9 }}>Cloud Avenue</span> : null}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-faint)", paddingLeft: 19 }}>
                {hostable ? `${pop.gpu} · ${pop.gpuFree} free · ${pop.latency} ms` : `No ${hw.gpu}, edge-cache only`}
              </div>
              <div style={{ fontSize: 11, paddingLeft: 19, color: (CARBON[pop.country] || 0) < 120 ? "#1e8e1e" : "var(--ink-faint)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon name="leaf" size={11} /> {CARBON[pop.country]} g/kWh
              </div>
            </button>
          );
        })}
      </div>

      <SectionLabel>Hardware · recommended for {model.name}</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { id: "h100", title: "1× H100 80GB", tps: 142, price: "€2.40" },
          { id: "l40s", title: "2× L40S 48GB", tps: 128, price: "€1.95" },
          { id: "a100", title: "1× A100 80GB", tps: 98,  price: "€1.60" },
        ].map(h => {
          const recommended = (hw.gpu || "h100").toLowerCase() === h.id;
          return (
            <RadioCard
              key={h.id}
              selected={config.hardware === h.id}
              onClick={() => setConfig(c => ({ ...c, hardware: h.id }))}
              title={h.title}
              note={`${recommended ? "Recommended" : "Compatible"} · ${h.tps} tok/s`}
              extra={recommended && <span className="chip chip-orange" style={{ fontSize: 10 }}>Recommended</span>}
              price={h.price + "/h"}
            />
          );
        })}
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
const sovCfg = (config) => {
  const primaryPop = (window.POP_BY_ID || {})[config.deployPops[0]] || {};
  return {
    country: primaryPop.country, regionEU: true,
    allocation: config.allocation, isolatedEU: config.isolatedEU,
    logsEU: config.logsEU, hsm: config.hsm,
    edgeRouting: config.edgeRouting, popCount: config.deployPops.length,
  };
};

const StepSovereign = ({ config, setConfig, onNext, onBack }) => {
  const sov = window.computeSovereignty ? window.computeSovereignty(sovCfg(config)) : { score: 0, dims: [], level: null };
  return (
    <div className="panel fade-in" style={{ padding: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Sovereignty</h2>
      <p className="muted" style={{ margin: "0 0 20px", fontSize: 13 }}>Four dimensions of the Orange sovereignty framework. The index updates live as you change the configuration.</p>

      {/* Reactive sovereignty index */}
      <div style={{ marginBottom: 24, boxShadow: "inset 0 0 0 1px var(--panel-border)", borderLeft: "3px solid var(--orange)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "1px solid var(--line)", background: "var(--color-grey-100)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--orange)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="gauge" size={14} /> Sovereignty index
          </div>
          <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>{config.deployPops.length} EU site{config.deployPops.length > 1 ? "s" : ""} · {(window.POP_BY_ID||{})[config.deployPops[0]]?.city}</span>
        </div>
        <div style={{ padding: 18 }}>
          {window.SovereigntyPanel ? <SovereigntyPanel cfg={sovCfg(config)} /> : <div style={{ fontSize: 40, fontWeight: 700 }}>{sov.score}/100</div>}
        </div>
      </div>

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
          icon="lock" title="Encrypt everything stored on disk"
          desc="Your prompts, the model's responses, the logs and the model weights are all encrypted at rest. The key lives in an ANSSI-certified hardware module (HSM) held by Orange Business, never leaves the EU, so no one (not even the provider) can read your data."
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
            This configuration meets <strong>AI Act (Art. 28, general-purpose models)</strong>, <strong>GDPR</strong> and <strong>NIS2</strong>. Orange Business provides the contractual attestation.
          </div>
        </div>
        <span className="chip chip-eu" style={{ alignSelf: "flex-start" }}>
          <EUFlag size={10} />
          Compliant
        </span>
      </div>

      <div style={{ background: "var(--color-grey-100)", padding: 16, marginBottom: 24 }}>
        {window.ComplianceCerts ? <ComplianceCerts title="Cloud Avenue certifications" /> : null}
        <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 10 }}>
          The right level on each axis depends on your industry positioning and risk tolerance.
        </div>
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
const StepScaling = ({ config, setConfig, model, hw, onBack, onLaunch, openEdgeModal }) => {
  const D = window.DYNAMO || { tokpsGainPct: 35, ttftReductionPct: 42, kvReusePct: 72 };
  const baseTps = (hw && hw.tokps) || 142;
  const effTps = Math.round(baseTps * (config.dynamo ? 1 + D.tokpsGainPct / 100 : 1));
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
          Peak capacity : {(config.maxInstances * effTps).toLocaleString()} tok/s · {(config.maxInstances * Math.round(effTps * 4)).toLocaleString()} req/min{config.dynamo ? " · with Dynamo" : ""}
        </div>
      </div>

      <SectionLabel>Inference optimisation</SectionLabel>
      <div style={{
        padding: 18, marginBottom: 24,
        background: config.dynamo ? "linear-gradient(135deg, rgba(118,185,0,0.07), rgba(118,185,0,0.02))" : "#fff",
        border: `2px solid ${config.dynamo ? "#76b900" : "var(--color-grey-400)"}`,
      }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 44, height: 44, background: "#fff", border: "1px solid var(--color-grey-400)", display: "grid", placeItems: "center", padding: 7, flexShrink: 0 }}>
            <img src="assets/logos/nvidia.svg" alt="NVIDIA" style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{D.name}: {D.tagline}</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.5 }}>{D.desc}</div>
          </div>
          <div className={`toggle ${config.dynamo ? "on" : ""}`} onClick={() => setConfig(c => ({ ...c, dynamo: !c.dynamo }))}>
            <span className="track" />
          </div>
        </div>
        {config.dynamo && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed #76b900", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, fontSize: 12 }}>
            <div><div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Throughput</div><strong>+{D.tokpsGainPct}% · {effTps} tok/s</strong></div>
            <div><div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Time-to-first-token</div><strong>−{D.ttftReductionPct}%</strong></div>
            <div><div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>KV cache reuse</div><strong>{D.kvReusePct}%</strong></div>
          </div>
        )}
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
              Inference stays in your Cloud Avenue regions, and the token travels the Orange fibre backbone. <button onClick={openEdgeModal} style={{ background: "none", border: 0, color: "var(--orange)", padding: 0, fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Learn more →</button>
            </div>
          </div>
          <div className={`toggle ${config.edgeRouting ? "on" : ""}`} onClick={() => setConfig(c => ({ ...c, edgeRouting: !c.edgeRouting }))}>
            <span className="track" />
          </div>
        </div>
        {config.edgeRouting && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--orange)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, fontSize: 12 }}>
            <div><div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>POPs enabled</div><strong>{(window.POPS||[]).length || 11} EU</strong></div>
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
          Launch deployment
        </button>
      </div>
    </div>
  );
};

// ============ Récap (right column) ============
const DeploySummary = ({ config, model, hw, canLaunch, onLaunch }) => {
  const D = window.DYNAMO || { tokpsGainPct: 35 };
  const primaryPop = (window.POP_BY_ID || {})[config.deployPops[0]] || { city: "Paris", country: "FR" };
  const sov = window.computeSovereignty ? window.computeSovereignty(sovCfg(config)) : { score: 0, level: null };
  const perH = (config.hardware === "h100" ? 2.40 : config.hardware === "l40s" ? 1.95 : 1.60);
  const totalPerH = perH * config.deployPops.length;
  const carbon = window.gco2PerMtok ? window.gco2PerMtok(model.id, primaryPop.country, config.dynamo) : 77;
  return (
    <div className="panel" style={{ position: "sticky", top: 80 }}>
      <div style={{ padding: 16, borderBottom: "1px solid var(--line)", background: "#000", color: "#fff" }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--orange)" }}>Summary</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>Deployment express</div>
      </div>

      {/* Sovereignty index strip */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 14, background: "var(--color-grey-100)" }}>
        {window.SovGauge ? <SovGauge score={sov.score} level={sov.level} size={68} stroke={7} /> : null}
        <div style={{ minWidth: 0 }}>
          <div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Sovereignty index</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{sov.level ? sov.level.label : ""}</div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>Data · Technical · Operational · Legal</div>
        </div>
      </div>

      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
        <SummaryRow label="Model"  value={model.name} />
        <SummaryRow label="Regions"  value={`${primaryPop.city}${config.deployPops.length > 1 ? ` +${config.deployPops.length - 1}` : ""} (${config.deployPops.length} site${config.deployPops.length > 1 ? "s" : ""})`} />
        <SummaryRow label="Hardware" value={hwLabel(config.hardware)} />
        <SummaryRow label="Allocation" value="Dedicated bare metal" />
        <SummaryRow label="Optimisation" value={config.dynamo ? "NVIDIA Dynamo" : "vLLM standard"} />
        <SummaryRow label="Scaling" value={config.scaling === "scale-to-zero" ? "Scale-to-zero" : "Always on"} />
        <SummaryRow label="Max capacity" value={`${config.maxInstances} GPU`} />

        <hr className="divider" style={{ margin: "4px 0" }} />

        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Cost</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <strong style={{ fontSize: 20 }}>€{totalPerH.toFixed(2)}</strong>
              <span className="faint" style={{ fontSize: 11 }}>/h active</span>
            </div>
            <div className="faint" style={{ fontSize: 11 }}>€0/h scale-to-zero</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="leaf" size={11} style={{ color: "#1e8e1e" }} />Carbon</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <strong style={{ fontSize: 20, color: "#1e8e1e" }}>{carbon}</strong>
              <span className="faint" style={{ fontSize: 11 }}>g/Mtok</span>
            </div>
            <div className="faint" style={{ fontSize: 11 }}>{primaryPop.country} grid</div>
          </div>
        </div>

        <hr className="divider" style={{ margin: "4px 0" }} />

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span className="chip chip-eu"><EUFlag size={10} />Sovereign</span>
          {config.dynamo && <span className="chip" style={{ background: "rgba(118,185,0,0.14)", color: "#4d7c00" }}><Icon name="cpu" size={10} />Dynamo</span>}
          {config.edgeRouting && <span className="chip chip-orange"><Icon name="grid" size={10} />Orange Edge</span>}
          <span className="chip chip-success"><span className="dot" />AI Act ready</span>
        </div>
      </div>
      <div style={{ padding: 18, borderTop: "1px solid var(--line)" }}>
        <button className="btn btn-primary btn-block" style={{ width: "100%" }} disabled={!canLaunch} onClick={onLaunch}>
          {canLaunch ? <><Icon name="play" size={14} /> Launch deployment</> : "Complete the steps"}
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
        The model is deployed on bare metal across your Cloud Avenue regions (sovereign). When a request arrives, it enters via the Orange edge POP closest to the end user, transits through the Orange fibre backbone to the nearest inference region, and returns via the same POP.
      </p>
      <ul style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 18 }}>
        <li>100% Orange network traffic, no public internet transit</li>
        <li>Perceived latency reduced 3-4× for users outside the inference regions</li>
        <li>Lightweight cache replicated to POPs (NVIDIA Dynamo KV cache, frequent embeddings)</li>
        <li>Coverage: pan-EU edge POPs, Asia/Africa expansion planned 2026</li>
      </ul>
      <div style={{ marginTop: 16, padding: 12, background: "var(--color-grey-100)", fontSize: 12, color: "var(--ink-soft)" }}>
        <strong>Orange differentiator :</strong> neither Gcore, OVH nor Scaleway can combine sovereign bare metal AND edge routing — Orange is the only EU operator running its own fibre network.
      </div>
      <button onClick={onClose} className="btn btn-secondary" style={{ marginTop: 16, width: "100%" }}>Got it</button>
    </div>
  </div>
);

Object.assign(window, { DeployScreen });

const hwLabel = (h) => h === "h100" ? "1× H100 80GB" : h === "l40s" ? "2× L40S 48GB" : "1× A100 80GB";
