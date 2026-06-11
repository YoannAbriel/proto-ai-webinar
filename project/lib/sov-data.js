/* Shared data + logic for the Orange × Gcore orchestrator demo.
   Loaded before every screen so all surfaces read the same numbers.
   Plain JS (no JSX) — exposes everything on window. */

// ============ Carbon intensity of the electricity grid (gCO2e / kWh) ============
// Realistic 2024 yearly averages. France is ~5–7× cleaner than Germany — the demo story.
const CARBON_INTENSITY = {
  NO: 29,   // ~100% hydro
  SE: 41,   // hydro + nuclear
  FR: 56,   // 98% low-carbon (nuclear + hydro)
  PT: 167,  // wind + hydro heavy
  ES: 171,  // wind + solar + some gas
  IT: 233,  // gas heavy
  NL: 268,  // mixed grid
  BE: 138,  // nuclear + gas
  DE: 381,  // mixed — coal still significant
  PL: 635,  // coal dominant
  EU: 250,  // EU-27 average
};

const ENERGY_MIX = {
  NO: "~100% hydro",
  SE: "hydro + nuclear",
  FR: "98% low-carbon · nuclear + hydro",
  PT: "renewables · wind + hydro",
  ES: "renewables · wind + solar",
  IT: "gas-heavy grid",
  NL: "mixed grid",
  BE: "nuclear + gas",
  DE: "mixed grid · coal share",
  PL: "coal-dominant grid",
  EU: "EU-27 average",
};

// ============ Deployable bare-metal sites (Orange Cloud Avenue × Gcore) ============
// The four strategic Cloud Avenue cloud regions (Oslo, Stockholm, Berlin, Paris),
// plus more Orange DCs in other EU countries. gpu/gpuFree gate whether the model's
// required GPU can be provisioned there.
const DEPLOY_POPS = [
  { id: "paris",     city: "Paris",     country: "FR", site: "Cloud Avenue PA-1", gpu: "H100", gpuFree: 248, latency: 4,  lon: 2.35,  lat: 48.86, hub: true, strategic: true },
  { id: "oslo",      city: "Oslo",      country: "NO", site: "Cloud Avenue OS-1", gpu: "H100", gpuFree: 96,  latency: 22, lon: 10.75, lat: 59.91, strategic: true },
  { id: "stockholm", city: "Stockholm", country: "SE", site: "Cloud Avenue ST-1", gpu: "H100", gpuFree: 80,  latency: 24, lon: 18.07, lat: 59.33, strategic: true },
  { id: "berlin",    city: "Berlin",    country: "DE", site: "Cloud Avenue BE-1", gpu: "H100", gpuFree: 120, latency: 14, lon: 13.4,  lat: 52.52, strategic: true },
  { id: "frankfurt", city: "Frankfurt", country: "DE", site: "Gcore FR-1",        gpu: "H100", gpuFree: 120, latency: 9,  lon: 8.68,  lat: 50.11 },
  { id: "lyon",      city: "Lyon",      country: "FR", site: "Gcore LY-1",        gpu: "A100", gpuFree: 48,  latency: 12, lon: 4.85,  lat: 45.76 },
  { id: "marseille", city: "Marseille", country: "FR", site: "Gcore MR-1",        gpu: "L40S", gpuFree: 40,  latency: 14, lon: 5.37,  lat: 43.3 },
];
const POP_BY_ID = Object.fromEntries(DEPLOY_POPS.map(p => [p.id, p]));

// GPU tiers — a site can host a model if its GPU tier ≥ the model's required tier.
const GPU_RANK = { L4: 1, L40S: 2, A100: 3, H100: 4 };
const popCanHost = (pop, modelId) => (GPU_RANK[pop.gpu] || 0) >= (GPU_RANK[(hwFor(modelId).gpu)] || 0);

// ============ Per-model hardware mapping ============
// Every catalogue model maps to a recommended GPU, cost, throughput and board power.
// powerKw = sustained board power of the GPU set (used for the carbon estimate).
const MODEL_HW = {
  // Mistral
  "mistral-small-24b": { gpu: "H100", count: 1, vram: 80, alt: "2× L40S 48GB", costPerH: 2.40, tokps: 142, unit: "tok/s", powerKw: 0.70, weightGb: 47,  ctx: "32k",  precision: "bf16" },
  "mistral-large-2411":{ gpu: "H100", count: 4, vram: 80, alt: "8× A100 80GB", costPerH: 9.60, tokps: 58,  unit: "tok/s", powerKw: 2.80, weightGb: 228, ctx: "128k", precision: "bf16" },
  "mixtral-8x7b":      { gpu: "H100", count: 2, vram: 80, alt: "2× A100 80GB", costPerH: 4.80, tokps: 115, unit: "tok/s", powerKw: 1.40, weightGb: 87,  ctx: "32k",  precision: "bf16" },
  "mistral-nemo":      { gpu: "L40S", count: 1, vram: 48, alt: "1× A100 80GB", costPerH: 1.20, tokps: 120, unit: "tok/s", powerKw: 0.35, weightGb: 24,  ctx: "128k", precision: "bf16" },
  "codestral-22b":     { gpu: "A100", count: 1, vram: 80, alt: "1× H100 80GB", costPerH: 1.60, tokps: 105, unit: "tok/s", powerKw: 0.40, weightGb: 44,  ctx: "32k",  precision: "bf16" },
  "mistral-7b":        { gpu: "L40S", count: 1, vram: 48, alt: "1× A100 40GB", costPerH: 1.20, tokps: 175, unit: "tok/s", powerKw: 0.35, weightGb: 14,  ctx: "32k",  precision: "bf16" },
  "pixtral-12b":       { gpu: "A100", count: 1, vram: 80, alt: "1× H100 80GB", costPerH: 1.60, tokps: 90,  unit: "tok/s", powerKw: 0.40, weightGb: 25,  ctx: "128k", precision: "bf16" },
  // Meta
  "llama-3-3-70b":     { gpu: "H100", count: 2, vram: 80, alt: "4× L40S 48GB", costPerH: 4.80, tokps: 88,  unit: "tok/s", powerKw: 1.40, weightGb: 132, ctx: "128k", precision: "bf16" },
  "llama-3-1-8b":      { gpu: "L40S", count: 1, vram: 48, alt: "1× A100 40GB", costPerH: 1.20, tokps: 168, unit: "tok/s", powerKw: 0.35, weightGb: 16,  ctx: "128k", precision: "bf16" },
  "llama-3-8b":        { gpu: "L40S", count: 1, vram: 48, alt: "1× A100 40GB", costPerH: 1.20, tokps: 165, unit: "tok/s", powerKw: 0.35, weightGb: 16,  ctx: "8k",   precision: "bf16" },
  "codellama-34b":     { gpu: "H100", count: 1, vram: 80, alt: "2× L40S 48GB", costPerH: 2.40, tokps: 120, unit: "tok/s", powerKw: 0.70, weightGb: 67,  ctx: "16k",  precision: "bf16" },
  // Qwen
  "qwen-2-5-72b":      { gpu: "H100", count: 2, vram: 80, alt: "4× L40S 48GB", costPerH: 4.80, tokps: 88,  unit: "tok/s", powerKw: 1.40, weightGb: 145, ctx: "128k", precision: "bf16" },
  "qwen-2-5-7b":       { gpu: "L40S", count: 1, vram: 48, alt: "1× A100 40GB", costPerH: 1.20, tokps: 172, unit: "tok/s", powerKw: 0.35, weightGb: 15,  ctx: "128k", precision: "bf16" },
  "qwen-2-5-coder-32b":{ gpu: "H100", count: 1, vram: 80, alt: "2× L40S 48GB", costPerH: 2.40, tokps: 112, unit: "tok/s", powerKw: 0.70, weightGb: 64,  ctx: "128k", precision: "bf16" },
  "qwq-32b":           { gpu: "H100", count: 1, vram: 80, alt: "2× L40S 48GB", costPerH: 2.40, tokps: 110, unit: "tok/s", powerKw: 0.70, weightGb: 64,  ctx: "32k",  precision: "bf16" },
  // DeepSeek
  "deepseek-r1-distill":{ gpu: "H100", count: 1, vram: 80, alt: "2× L40S 48GB", costPerH: 2.40, tokps: 110, unit: "tok/s", powerKw: 0.70, weightGb: 64,  ctx: "128k", precision: "bf16" },
  "deepseek-v3":       { gpu: "H200", count: 8, vram: 141, alt: "16× H100 80GB", costPerH: 28.00, tokps: 48, unit: "tok/s", powerKw: 5.60, weightGb: 685, ctx: "128k", precision: "fp8" },
  "deepseek-coder-v2": { gpu: "H100", count: 8, vram: 80, alt: "—",            costPerH: 19.20, tokps: 65, unit: "tok/s", powerKw: 5.60, weightGb: 440, ctx: "128k", precision: "bf16" },
  // Google
  "gemma-2-27b":       { gpu: "H100", count: 1, vram: 80, alt: "2× L40S 48GB", costPerH: 2.40, tokps: 120, unit: "tok/s", powerKw: 0.70, weightGb: 54,  ctx: "8k",   precision: "bf16" },
  "gemma-2-9b":        { gpu: "L40S", count: 1, vram: 48, alt: "1× A100 40GB", costPerH: 1.20, tokps: 150, unit: "tok/s", powerKw: 0.35, weightGb: 18,  ctx: "8k",   precision: "bf16" },
  // Microsoft
  "phi-4":             { gpu: "L40S", count: 1, vram: 48, alt: "1× A100 80GB", costPerH: 1.20, tokps: 110, unit: "tok/s", powerKw: 0.35, weightGb: 29,  ctx: "16k",  precision: "bf16" },
  "phi-3-mini":        { gpu: "L4",   count: 1, vram: 24, alt: "1× A10 24GB",  costPerH: 0.45, tokps: 210, unit: "tok/s", powerKw: 0.072, weightGb: 7.6, ctx: "4k",  precision: "bf16" },
  // NVIDIA / Databricks
  "nemotron-70b":      { gpu: "H100", count: 2, vram: 80, alt: "4× L40S 48GB", costPerH: 4.80, tokps: 86,  unit: "tok/s", powerKw: 1.40, weightGb: 132, ctx: "128k", precision: "bf16" },
  "dbrx":              { gpu: "H100", count: 4, vram: 80, alt: "8× A100 80GB", costPerH: 9.60, tokps: 72,  unit: "tok/s", powerKw: 2.80, weightGb: 245, ctx: "32k",  precision: "bf16" },
  // Vision / Audio
  "llava-next":        { gpu: "A100", count: 1, vram: 80, alt: "1× H100 80GB", costPerH: 1.60, tokps: 96,  unit: "tok/s", powerKw: 0.40, weightGb: 15,  ctx: "4k",   precision: "fp16" },
  "whisper-l3":        { gpu: "L40S", count: 1, vram: 48, alt: "1× A100 40GB", costPerH: 1.20, tokps: 32,  unit: "× realtime", powerKw: 0.35, weightGb: 3.1, ctx: "—", precision: "fp16" },
  // Embeddings
  "bge-m3":            { gpu: "L4",   count: 1, vram: 24, alt: "1× T4 16GB",   costPerH: 0.45, tokps: 12000, unit: "emb/s", powerKw: 0.072, weightGb: 2.2, ctx: "8k", precision: "fp16" },
  "bge-reranker":      { gpu: "L4",   count: 1, vram: 24, alt: "1× T4 16GB",   costPerH: 0.45, tokps: 9000,  unit: "emb/s", powerKw: 0.072, weightGb: 2.3, ctx: "8k", precision: "fp16" },
  "mxbai-embed":       { gpu: "L4",   count: 1, vram: 24, alt: "1× T4 16GB",   costPerH: 0.45, tokps: 18000, unit: "emb/s", powerKw: 0.072, weightGb: 1.3, ctx: "—", precision: "fp16" },
};
const hwFor = (id) => MODEL_HW[id] || MODEL_HW["mistral-small-24b"];
const hwLabelFull = (id) => { const h = hwFor(id); return `${h.count}× ${h.gpu} ${h.vram}GB`; };

// ============ Realistic pricing & carbon, driven by the deploy settings ============
// Per-GPU hourly rate by tier. The model's GPU count scales the bill; L40S needs
// ~2× the cards to match the memory of the recommended tier.
const PER_GPU_HOUR = { h200: 3.50, h100: 2.40, a100: 1.60, l40s: 1.20, l4: 0.45 };
// Hourly cost of one region serving `modelId` on the chosen hardware `tier`.
function tierHourly(modelId, tier) {
  const h = hwFor(modelId);
  const t = String(tier || h.gpu).toLowerCase();
  const perGpu = PER_GPU_HOUR[t] != null ? PER_GPU_HOUR[t] : PER_GPU_HOUR.h100;
  return +(perGpu * (h.count || 1)).toFixed(2);
}
// Total active €/h across all deployed regions.
function deployHourly(modelId, tier, regionCount) {
  return +(tierHourly(modelId, tier) * Math.max(1, regionCount || 1)).toFixed(2);
}
// Average gCO2e / 1M tokens across the deployed regions (each region's grid).
function deployCarbon(modelId, popIds, dynamoOn) {
  const ids = (popIds && popIds.length) ? popIds : ["paris"];
  const vals = ids.map(id => { const p = POP_BY_ID[id] || {}; return gco2PerMtok(modelId, p.country || "FR", dynamoOn); });
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// ============ NVIDIA Dynamo (inference optimisation) ============
const DYNAMO = {
  name: "NVIDIA Dynamo",
  tagline: "Disaggregated serving + KV-cache reuse",
  desc: "Prefill and decode run on separate GPU pools (NIXL transfers the KV cache GPU-to-GPU); a KV-aware router reuses the cache across requests to skip redundant prefill.",
  tokpsGainPct: 35,     // throughput uplift
  ttftReductionPct: 42, // time-to-first-token reduction
  kvReusePct: 72,       // KV cache reuse rate (matches the live metric)
  costReductionPct: 22, // €/M-token reduction from the prefill saving
  prefillMs: 11,
  decodeMsPerTok: 3.1,
};

// ============ Carbon estimate ============
// kWh to generate 1M tokens at a given throughput, then gCO2e via grid intensity.
function energyPerMtokKwh(modelId) {
  const h = hwFor(modelId);
  const tps = h.unit === "tok/s" ? h.tokps : 1200; // embeddings/audio: nominal token-equivalent
  const seconds = 1e6 / tps;
  return (h.powerKw * seconds) / 3600; // kWh per 1M tokens
}
function gco2PerMtok(modelId, countryOrCode, dynamoOn) {
  const code = (countryOrCode || "FR").toUpperCase();
  const intensity = CARBON_INTENSITY[code] != null ? CARBON_INTENSITY[code] : CARBON_INTENSITY.EU;
  let g = energyPerMtokKwh(modelId) * intensity;
  if (dynamoOn) g *= (1 - DYNAMO.costReductionPct / 100); // fewer GPU-seconds per token
  return Math.round(g);
}
// Helper: car-km equivalent (passenger car ≈ 120 gCO2/km)
const carKmFor = (grams) => (grams / 120);

// ============ Sovereignty index ============
// The four dimensions of Orange's sovereignty framework (Data · Technical ·
// Operational · Legal). Each is scored 0–100 from the deployment config, then
// averaged. Reactive: every toggle moves the score. Per Orange, the right level
// on each axis "depends on the business' industry positioning and risk tolerance".
//   cfg = { country, regionEU, allocation, isolatedEU, logsEU, hsm, edgeRouting, popCount }
// Sub-criteria behind each dimension (Orange "Sovereignty is multi-dimensional"):
const SOV_CRITERIA = {
  data:        ["Location", "Ownership", "Access management", "Observability"],
  technical:   ["Interoperability", "Reversibility & portability", "Vendor governance", "Roadmap control"],
  operational: ["Operations resilience", "Third-party sovereignty", "Staff location & clearance", "Cybersecurity controls"],
  legal:       ["Jurisdictional protection", "Contractual protection", "Regulatory compliance"],
};
function computeSovereignty(cfg) {
  const c = cfg || {};
  const regionEU = c.regionEU !== false;            // all Gcore EU sites are EU
  const baremetal = c.allocation !== "shared";
  const popCount = c.popCount || 1;
  const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

  // Data: residency, key management, access, observability
  const data = clamp(
    50 + (c.isolatedEU !== false ? 25 : 0) + (c.logsEU ? 15 : 0) + (regionEU ? 10 : 0)
  );
  // Technical: open-source + dedicated infra (portability / vendor independence)
  const technical = clamp(
    45 + (baremetal ? 35 : 0) + (regionEU ? 20 : 0)
  );
  // Operational: resilience (multi-region back-up), local managed services, cyber
  const operational = clamp(
    45 + (c.edgeRouting ? 22 : 0) + (popCount >= 2 ? 23 : 0) + (c.hsm ? 10 : 0)
  );
  // Legal: EU jurisdiction + EU-held keys outside the US Cloud Act
  const legal = clamp(
    50 + (c.hsm ? 28 : 0) + (regionEU ? 22 : 0)
  );

  const dims = [
    { key: "data",        label: "Data",        score: data,        criteria: SOV_CRITERIA.data,
      detail: c.isolatedEU !== false ? "Multi-region hosting · residency + EU key management" : "Data residency disabled" },
    { key: "technical",   label: "Technical",   score: technical,   criteria: SOV_CRITERIA.technical,
      detail: baremetal ? "Open-source model · dedicated Gcore bare metal · reversible" : "Shared container — limited portability" },
    { key: "operational", label: "Operational", score: operational, criteria: SOV_CRITERIA.operational,
      detail: popCount >= 2 ? `${popCount} regions · contingency + back-up · Orange-run` : (c.edgeRouting ? "Orange-run · single region" : "No operational autonomy") },
    { key: "legal",       label: "Legal",       score: legal,       criteria: SOV_CRITERIA.legal,
      detail: c.hsm ? "Native EU provider · keys in EU HSM · outside US Cloud Act" : "Keys not EU-held" },
  ];
  const score = clamp(dims.reduce((s, d) => s + d.score, 0) / dims.length);
  return { score, dims, level: sovLevel(score) };
}
function sovLevel(score) {
  if (score >= 90) return { label: "Sovereign",        color: "#1e8e1e" };
  if (score >= 75) return { label: "Mostly sovereign", color: "#1e8e1e" };
  if (score >= 60) return { label: "Partial",          color: "#b45309" };
  return { label: "At risk", color: "#dc2626" };
}

Object.assign(window, {
  CARBON_INTENSITY, ENERGY_MIX, DEPLOY_POPS, POP_BY_ID, GPU_RANK, popCanHost,
  MODEL_HW, hwFor, hwLabelFull, PER_GPU_HOUR, tierHourly, deployHourly, deployCarbon,
  DYNAMO, energyPerMtokKwh, gco2PerMtok, carKmFor,
  computeSovereignty, sovLevel, SOV_CRITERIA,
});
