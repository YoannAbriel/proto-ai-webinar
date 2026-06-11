/* global React, Icon, GcoreLogo, useNav */
const { useState: useStateD } = React;

// ============ Tab: Overview (existing content, cleaned) ============
const DetailOverview = ({ m }) => {
  const model = m || (window.MODELS && window.MODELS[0]) || {};
  const hw = window.hwFor ? window.hwFor(model.id) : { gpu: "H100", count: 1, vram: 80, alt: "2× L40S 48GB", costPerH: 2.40, weightGb: 47, ctx: "32k", precision: "bf16" };
  const carbonFR = window.gco2PerMtok ? window.gco2PerMtok(model.id, "FR") : 77;
  const carbonDE = window.gco2PerMtok ? window.gco2PerMtok(model.id, "DE") : 521;
  const isMistral = model.id === "mistral-small-24b";
  const desc = isMistral
    ? "Mistral-Small-3 is a 24-billion parameter instruct model from Mistral AI, optimised for European languages and enterprise tasks. Strong on internal assistance, sovereign RAG and document summarisation. Native bf16 quantisation, 32k token context window, native function calling."
    : `${model.name} is a ${model.size} ${(model.task || "").toLowerCase()} model from ${model.org}. Deployable on sovereign Gcore EU bare metal with strict data isolation, served at the edge across the Orange network.`;
  return (
  <>
    <div className="panel" style={{ padding: 24, marginBottom: 16 }}>
      <h3 className="detail-h3">Description</h3>
      <p style={{ margin: 0, lineHeight: 1.6 }}>{desc}</p>
    </div>

    <div className="grid-2" style={{ marginBottom: 16 }}>
      <div className="panel" style={{ padding: 24 }}>
        <h3 className="detail-h3">Technical specs</h3>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <tbody>
            {[
              ["Parameters", model.size || "24B"],
              ["Context", hw.ctx],
              ["Precision", hw.precision],
              ["License", model.license || "Apache 2.0"],
              ["Weight size", `${hw.weightGb} GB`],
              ["Architecture", "Decoder-only transformer"],
            ].map(([k, v]) => (
              <tr key={k} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "10px 0", color: "var(--ink-soft)" }}>{k}</td>
                <td style={{ padding: "10px 0", textAlign: "right", fontWeight: 700 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        <h3 className="detail-h3" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Hardware requirements <GcoreLogo size={14} />
        </h3>
        <div style={{ padding: 16, background: "var(--color-grey-100)", borderLeft: "3px solid var(--orange)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Icon name="server" size={20} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{hw.count}× NVIDIA {hw.gpu} {hw.vram}GB</div>
              <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>or {hw.alt}</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>Bare metal EU cost</span>
            <strong style={{ fontSize: 16 }}>€{hw.costPerH.toFixed(2)}<span style={{ fontSize: 11, color: "var(--ink-faint)" }}>/h</span></strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, marginTop: 8, borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 12, color: "var(--ink-soft)", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Icon name="leaf" size={13} style={{ color: "#1e8e1e" }} /> Carbon · France grid
            </span>
            <strong style={{ fontSize: 14, color: "#1e8e1e" }}>{carbonFR} g<span style={{ fontSize: 11, color: "var(--ink-faint)" }}>/Mtok</span></strong>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4 }}>
            {Math.round(carbonDE / Math.max(carbonFR, 1))}× lower than the same model on the German grid ({carbonDE} g/Mtok).
          </div>
        </div>
        <ul style={{ margin: "12px 0 0", padding: "0 0 0 18px", fontSize: 12, color: "var(--ink-soft)" }}>
          <li>Provisioning ~3 min in France</li>
          <li>Scale-to-zero available</li>
          <li>vLLM + NVIDIA Dynamo optimised</li>
        </ul>
      </div>
    </div>

    <div className="panel" style={{ padding: 24 }}>
      <h3 className="detail-h3">Quick benchmark</h3>
      {[
        ["MMLU (general knowledge)", 81, "vs Mistral-7B: 60.1"],
        ["GSM8k (math reasoning)", 76, "vs Llama-3-8B: 68.2"],
        ["HumanEval (code)", 64, "vs Mixtral-8x7B: 49.4"],
        ["MT-Bench (chat quality)", 87, "vs Claude Haiku: 84.0"],
      ].map(([label, score, comp]) => (
        <div key={label} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
            <span>{label}</span>
            <span>
              <strong style={{ fontSize: 13 }}>{score}</strong>
              <span style={{ color: "var(--ink-faint)", marginLeft: 10, fontSize: 11 }}>{comp}</span>
            </span>
          </div>
          <div style={{ height: 6, background: "var(--color-grey-200)" }}>
            <div style={{ width: `${score}%`, height: "100%", background: "var(--orange)" }} />
          </div>
        </div>
      ))}
    </div>
  </>
  );
};

// ============ Tab: Model card (HuggingFace-style markdown) ============
const DetailModelCard = () => (
  <div className="panel modelcard" style={{ padding: "28px 32px", marginBottom: 16 }}>
    <div className="kicker">Model card</div>
    <h2 style={{ fontSize: 22, fontWeight: 700, margin: "4px 0 18px" }}>Mistral-Small-3-24B-Instruct</h2>

    <McSection title="Overview">
      <p>
        Mistral-Small-3 is the latest mid-size instruct model from Mistral AI, released in early 2025. With 24B parameters, it sits between Mistral-7B and Mixtral-8x22B in the lineup, designed as a cost-efficient drop-in for enterprise assistants, retrieval pipelines and structured generation.
      </p>
      <p>
        The model is multilingual, with particular strength on French, German, Spanish, and Italian, and ships with native function-calling and a JSON output mode.
      </p>
    </McSection>

    <McSection title="Capabilities">
      <ul className="mc-list">
        <li><strong>Instruction following</strong> — strong adherence to multi-step instructions with system + user roles</li>
        <li><strong>Function calling</strong> — native, OpenAI-compatible tool schema with parallel calls</li>
        <li><strong>JSON mode</strong> — guaranteed valid JSON output via constrained decoding</li>
        <li><strong>32k context</strong> — long enough for full contracts, multi-doc RAG, codebases</li>
        <li><strong>Multilingual</strong> — 9 European languages with parity-grade quality (FR, EN, DE, ES, IT, PT, NL, PL, RO)</li>
      </ul>
    </McSection>

    <McSection title="Intended use">
      <ul className="mc-list">
        <li>Internal copilots (HR, legal, IT helpdesk) on sovereign infrastructure</li>
        <li>RAG over confidential corpora — contracts, regulations, knowledge bases</li>
        <li>Document summarisation, extraction and classification at scale</li>
        <li>Function-calling agents orchestrating internal APIs</li>
      </ul>
      <p className="mc-callout">
        <strong>Out of scope:</strong> medical diagnosis, legally binding advice, autonomous decision-making without human review. The model is general-purpose; downstream task evaluation is required.
      </p>
    </McSection>

    <McSection title="Training details">
      <table className="mc-table">
        <tbody>
          <tr><td>Architecture</td><td>Decoder-only transformer, GQA, sliding-window attention</td></tr>
          <tr><td>Pre-training tokens</td><td>~8T (curated web, code, books, multilingual)</td></tr>
          <tr><td>Post-training</td><td>SFT + DPO + constitutional preference tuning</td></tr>
          <tr><td>Tokenizer</td><td>Byte-pair encoding, 32,768 vocab, multilingual</td></tr>
          <tr><td>Compute</td><td>~600 H100-years on AWS Trn2 + Mistral cluster</td></tr>
          <tr><td>Carbon</td><td>Disclosed via Mistral's annual sustainability report</td></tr>
        </tbody>
      </table>
    </McSection>

    <McSection title="Limitations & known biases">
      <ul className="mc-list">
        <li>Hallucinates plausible-sounding citations; always verify factual claims against your KB</li>
        <li>English remains the strongest language; non-EU languages are best-effort</li>
        <li>Mathematical reasoning is weaker than dedicated reasoning models (o-series, DeepSeek-R1)</li>
        <li>Sensitive to prompt formatting; use the chat template provided in <code>tokenizer_config.json</code></li>
      </ul>
    </McSection>

    <McSection title="Citation">
      <pre className="mc-code">{`@misc{mistral-small-3-2025,
  title={Mistral-Small-3: A 24B Multilingual Instruct Model},
  author={Mistral AI Team},
  year={2025},
  url={https://huggingface.co/mistralai/Mistral-Small-3-24B-Instruct}
}`}</pre>
    </McSection>

    <McSection title="Sourced from" last>
      <a href="#" className="mc-link">huggingface.co/mistralai/Mistral-Small-3-24B-Instruct ↗</a>
      <p className="mc-meta">Card last fetched 4 minutes ago · checksum verified · synced to your tenant</p>
    </McSection>
  </div>
);

const McSection = ({ title, children, last }) => (
  <section style={{ marginBottom: last ? 0 : 22, paddingBottom: last ? 0 : 22, borderBottom: last ? "none" : "1px solid var(--line)" }}>
    <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", margin: "0 0 10px" }}>{title}</h4>
    {children}
  </section>
);

// ============ Tab: Files (HF file tree) ============
const DetailFiles = () => {
  const files = [
    { name: "README.md",                            size: "8.4 KB",   ext: "md",  mod: "3 days ago" },
    { name: "config.json",                          size: "1.4 KB",   ext: "json", mod: "3 days ago" },
    { name: "generation_config.json",               size: "132 B",    ext: "json", mod: "3 days ago" },
    { name: "model.safetensors.index.json",         size: "28.4 KB",  ext: "json", mod: "3 days ago" },
    { name: "model-00001-of-00010.safetensors",     size: "4.71 GB",  ext: "weights", mod: "3 days ago" },
    { name: "model-00002-of-00010.safetensors",     size: "4.71 GB",  ext: "weights", mod: "3 days ago" },
    { name: "model-00003-of-00010.safetensors",     size: "4.71 GB",  ext: "weights", mod: "3 days ago" },
    { name: "model-00004-of-00010.safetensors",     size: "4.71 GB",  ext: "weights", mod: "3 days ago" },
    { name: "model-00005-of-00010.safetensors",     size: "4.71 GB",  ext: "weights", mod: "3 days ago" },
    { name: "model-00006-of-00010.safetensors",     size: "4.71 GB",  ext: "weights", mod: "3 days ago", collapsed: true },
    { name: "tokenizer.json",                       size: "3.51 MB",  ext: "json", mod: "3 days ago" },
    { name: "tokenizer.model",                      size: "488 KB",   ext: "bin",  mod: "3 days ago" },
    { name: "tokenizer_config.json",                size: "2.1 KB",   ext: "json", mod: "3 days ago" },
    { name: "special_tokens_map.json",              size: "412 B",    ext: "json", mod: "3 days ago" },
  ];

  return (
    <>
      {/* Summary bar */}
      <div className="panel" style={{ padding: "14px 20px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 28, fontSize: 13 }}>
          <Stat label="Files" value="14" />
          <Stat label="Total size" value="47.1 GB" />
          <Stat label="Weight shards" value="10" />
          <Stat label="Format" value="safetensors" />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm">
            <Icon name="download" size={12} />
            Download all
          </button>
          <button className="btn btn-ghost btn-sm">
            <Icon name="code" size={12} />
            Use with HF CLI
          </button>
        </div>
      </div>

      {/* File tree */}
      <div className="panel" style={{ padding: 0, marginBottom: 16 }}>
        <div className="filetree-head">
          <span style={{ flex: 1 }}>Name</span>
          <span style={{ width: 100, textAlign: "right" }}>Size</span>
          <span style={{ width: 120, textAlign: "right" }}>Modified</span>
          <span style={{ width: 36 }} />
        </div>
        {files.map((f, i) => (
          <div key={f.name} className="filetree-row" style={{ opacity: f.collapsed ? 0.5 : 1 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
              <FileIcon ext={f.ext} />
              <span className="mono" style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
              {f.ext === "weights" && <span className="chip chip-outline" style={{ fontSize: 9, padding: "1px 5px" }}>shard {i - 3}/10</span>}
            </span>
            <span style={{ width: 100, textAlign: "right", fontSize: 12, color: "var(--ink-soft)", fontFamily: "var(--font-mono)" }}>{f.size}</span>
            <span style={{ width: 120, textAlign: "right", fontSize: 12, color: "var(--ink-faint)" }}>{f.mod}</span>
            <span style={{ width: 36, display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost btn-sm" style={{ padding: "4px 6px" }} title="Preview"><Icon name="play" size={12} /></button>
            </span>
          </div>
        ))}
      </div>

      <div className="panel" style={{ padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ flex: "0 0 36px", height: 36, background: "rgba(50,200,50,0.1)", color: "#1e8e1e", display: "grid", placeItems: "center" }}>
          <Icon name="shield" size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Checksum verified · sandboxed mirror</div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
            All weight shards have been hash-verified against the HuggingFace canonical and cached on Orange Business' EU mirror. No outbound fetch to HuggingFace at deploy time.
          </div>
        </div>
        <span className="chip chip-eu" style={{ alignSelf: "center", fontSize: 10 }}>EU mirror · Paris</span>
      </div>
    </>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{value}</div>
  </div>
);

const FileIcon = ({ ext }) => {
  const map = {
    md:      { color: "#0a0a0a", label: "MD" },
    json:    { color: "#5C4EE5", label: "{ }" },
    weights: { color: "#FF7900", label: "ST" },
    bin:     { color: "#6b7280", label: "BIN" },
  };
  const it = map[ext] || map.bin;
  return (
    <span style={{
      width: 22, height: 22,
      background: it.color, color: "#fff",
      fontSize: 9, fontWeight: 700,
      display: "grid", placeItems: "center",
      flexShrink: 0,
      fontFamily: "var(--font-mono)",
    }}>{it.label}</span>
  );
};

// ============ Tab: Benchmark (richer comparison) ============
const DetailBenchmark = () => {
  const BENCHMARKS = [
    { id: "mmlu",      name: "MMLU",      desc: "Multitask language understanding",  unit: "% acc" },
    { id: "gsm8k",     name: "GSM8k",     desc: "Grade-school math reasoning",       unit: "% acc" },
    { id: "humaneval", name: "HumanEval", desc: "Python code generation pass@1",     unit: "% acc" },
    { id: "mtbench",   name: "MT-Bench",  desc: "Chat quality (judge: GPT-4o)",      unit: "/100" },
    { id: "ifeval",    name: "IFEval",    desc: "Instruction following strict prompt", unit: "% acc" },
  ];
  const MODELS_B = [
    { name: "Mistral-Small-3-24B", target: true, scores: { mmlu: 81, gsm8k: 76, humaneval: 64, mtbench: 87, ifeval: 83 } },
    { name: "Mistral-7B-v0.3",                    scores: { mmlu: 60, gsm8k: 42, humaneval: 30, mtbench: 71, ifeval: 64 } },
    { name: "Llama-3-8B-Instruct",                scores: { mmlu: 68, gsm8k: 79, humaneval: 62, mtbench: 81, ifeval: 75 } },
    { name: "Mixtral-8x7B",                       scores: { mmlu: 70, gsm8k: 58, humaneval: 49, mtbench: 84, ifeval: 70 } },
    { name: "GPT-4o-mini (ref)",                  scores: { mmlu: 82, gsm8k: 87, humaneval: 87, mtbench: 89, ifeval: 84 }, ref: true },
  ];

  return (
    <>
      <div className="panel" style={{ padding: "14px 20px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Benchmark comparison</div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>5 standard benchmarks · vs comparable open-weights & a closed-source baseline</div>
        </div>
        <button className="btn btn-outline btn-sm">
          <Icon name="bolt" size={12} />
          Run on your eval set
        </button>
      </div>

      <div className="panel" style={{ padding: 0, marginBottom: 16, overflowX: "auto" }}>
        <table className="bench-table">
          <thead>
            <tr>
              <th>Model</th>
              {BENCHMARKS.map(b => (
                <th key={b.id}>
                  <div>{b.name}</div>
                  <div className="th-sub">{b.unit}</div>
                </th>
              ))}
              <th>Avg.</th>
            </tr>
          </thead>
          <tbody>
            {MODELS_B.map(m => {
              const avg = (Object.values(m.scores).reduce((a, b) => a + b, 0) / BENCHMARKS.length).toFixed(1);
              return (
                <tr key={m.name} className={m.target ? "target" : m.ref ? "reference" : ""}>
                  <td className="model-cell">
                    <div className="m-name">{m.name}</div>
                    {m.target && <span className="chip chip-orange" style={{ fontSize: 9, marginTop: 4 }}>This model</span>}
                    {m.ref && <span className="chip chip-outline" style={{ fontSize: 9, marginTop: 4 }}>Closed-source baseline</span>}
                  </td>
                  {BENCHMARKS.map(b => {
                    const s = m.scores[b.id];
                    return (
                      <td key={b.id}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <strong style={{ fontFamily: "var(--font-mono)", fontSize: 13, width: 26, textAlign: "right" }}>{s}</strong>
                          <div style={{ flex: 1, height: 4, background: "var(--color-grey-200)" }}>
                            <div style={{ width: `${s}%`, height: "100%", background: m.target ? "var(--orange)" : m.ref ? "#000" : "var(--color-grey-600)" }} />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td><strong style={{ fontFamily: "var(--font-mono)" }}>{avg}</strong></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="panel" style={{ padding: 20 }}>
          <h3 className="detail-h3">Benchmark methodology</h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.7 }}>
            <li>All evaluations run on Gcore H100 in Paris, same hardware as production deploy</li>
            <li>5-shot MMLU, 5-shot GSM8k, 0-shot HumanEval, single-judge MT-Bench, strict IFEval</li>
            <li>Scores are reproducible via published seeds and Mistral's open eval harness</li>
            <li>No benchmark contamination detected in pre-training corpus (Mistral's audit)</li>
          </ul>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <h3 className="detail-h3">Latency on H100 bare metal</h3>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["First token", "84 ms", "P50"],
                ["First token", "112 ms", "P99"],
                ["Throughput", "142 tok/s", "single stream"],
                ["Throughput", "1,840 tok/s", "16 concurrent"],
                ["Max batch", "32 streams", "vLLM continuous batch"],
              ].map(([k, v, n], i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "9px 0", color: "var(--ink-soft)" }}>{k}</td>
                  <td style={{ padding: "9px 0", textAlign: "right", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{v}</td>
                  <td style={{ padding: "9px 0", textAlign: "right", fontSize: 11, color: "var(--ink-faint)", width: 110 }}>{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// ============ Tab: License ============
const DetailLicense = () => (
  <>
    {/* License header */}
    <div className="panel" style={{ padding: 24, marginBottom: 16, display: "flex", gap: 18, alignItems: "center" }}>
      <div style={{
        width: 52, height: 52, background: "#000", color: "#fff",
        display: "grid", placeItems: "center", flexShrink: 0,
        fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 11, letterSpacing: "0.05em",
      }}>APL 2.0</div>
      <div style={{ flex: 1 }}>
        <div className="kicker">License</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "2px 0 4px" }}>Apache License 2.0</h2>
        <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
          Permissive open-source license · commercial use allowed · no copyleft · patent grant included
        </div>
      </div>
      <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
        Full text
        <Icon name="arrow" size={12} />
      </a>
    </div>

    {/* Permissions / Conditions / Limitations */}
    <div className="panel" style={{ padding: 0, marginBottom: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
        <LicCol kind="ok" title="Permissions">
          {["Commercial use", "Modification", "Distribution", "Patent use", "Private use"]}
        </LicCol>
        <LicCol kind="info" title="Conditions">
          {["License & copyright notice", "State changes"]}
        </LicCol>
        <LicCol kind="warn" title="Limitations">
          {["No trademark grant", "No liability", "No warranty"]}
        </LicCol>
      </div>
    </div>

    {/* Orange Business compliance attestation */}
    <div className="panel" style={{ padding: 0, marginBottom: 16, borderLeft: "3px solid var(--orange)", boxShadow: "inset 0 0 0 1px var(--panel-border), inset 3px 0 0 0 var(--orange)" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="kicker">Orange Business compliance attestation</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "2px 0 0" }}>This model has been audited for sovereign EU deployment</h3>
        </div>
        <span className="chip chip-success" style={{ fontSize: 11 }}>
          <Icon name="check" size={12} />
          Cleared
        </span>
      </div>
      <div style={{ padding: 24 }}>
        <div className="grid-2" style={{ gap: 24 }}>
          <ComplianceItem name="Original weights verified" status="ok" detail="SHA-256 of every shard matches Mistral AI's published weights. Served unmodified: no re-quantisation, fine-tune or distillation. Integrity re-checked on each pull and signed in the tenant audit log." />
          <ComplianceItem name="AI Act compliance" status="ok" detail="No high-risk traits triggered (Annex IIIa). General-purpose AI model, Article 28 transparency obligations met by Mistral AI." />
          <ComplianceItem name="GDPR (Article 9)" status="ok" detail="Training data audited for personal & sensitive data exclusion. No memorisation tests above threshold." />
          <ComplianceItem name="Copyright training data" status="ok" detail="Mistral AI's training data audit available under NDA. Major opt-out lists (CC, ai.txt, robots.txt) respected." />
          <ComplianceItem name="Export control (EU dual-use)" status="ok" detail="Below 10^25 FLOP threshold. No export restriction applies." />
          <ComplianceItem name="NIS2 supply-chain attestation" status="ok" detail="Mistral AI is registered as an EU critical supplier. SBOM available." />
          <ComplianceItem name="Trademark usage" status="info" detail="Apache 2.0 does not grant trademark rights. Display 'Mistral AI' name in attribution only." />
        </div>
        <div style={{ marginTop: 18, padding: 14, background: "var(--color-grey-100)", fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.6 }}>
          <strong style={{ color: "#000" }}>Orange Business indemnification:</strong> for customers under contract, Orange Business indemnifies IP and copyright claims on the deployment of this model up to €10M per contract year, per the Master Services Agreement § 12.4. Attestation document available in <a href="#" style={{ color: "var(--orange)", textDecoration: "underline" }}>your customer portal</a>.
        </div>
      </div>
    </div>

    <div className="panel" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
      <Icon name="info" size={20} className="muted" />
      <div style={{ flex: 1, fontSize: 12, color: "var(--ink-soft)" }}>
        This attestation reflects the state of the model and regulatory landscape as of <strong style={{ color: "#000" }}>2 February 2025</strong>. Re-attestation is automatic on each model version update.
      </div>
      <button className="btn btn-ghost btn-sm">
        <Icon name="download" size={12} />
        Download attestation (PDF)
      </button>
    </div>
  </>
);

const LicCol = ({ kind, title, children }) => {
  const accents = {
    ok:   { color: "#1e8e1e", icon: "check" },
    info: { color: "var(--orange)", icon: "info" },
    warn: { color: "#b45309", icon: "close" },
  };
  const a = accents[kind];
  return (
    <div style={{ padding: 20, borderRight: "1px solid var(--line)" }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: a.color, marginBottom: 12 }}>{title}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {children.map((c, i) => (
          <li key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
            <Icon name={a.icon} size={14} style={{ color: a.color }} />
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ComplianceItem = ({ name, status, detail }) => {
  const colors = {
    ok:   { bg: "rgba(50,200,50,0.1)", fg: "#1e8e1e", icon: "check" },
    info: { bg: "rgba(255,121,0,0.1)", fg: "var(--orange)", icon: "info" },
    warn: { bg: "rgba(255,204,0,0.15)", fg: "#b45309", icon: "info" },
  };
  const c = colors[status];
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div style={{ width: 28, height: 28, background: c.bg, color: c.fg, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon name={c.icon} size={14} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{name}</div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.5 }}>{detail}</div>
      </div>
    </div>
  );
};

Object.assign(window, { DetailOverview, DetailModelCard, DetailFiles, DetailBenchmark, DetailLicense });
