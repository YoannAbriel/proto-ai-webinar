/* global React */
// Brand marks — inline SVG paths from Simple Icons (MIT-licensed brand registry).
// All logos are vector + offline-safe. No CDN fallback needed.

// ============ Orange Business logo ============
const OrangeBusinessLogo = ({ size = 36 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <img
      src="assets/orange-logo.png"
      alt="Orange"
      width={size}
      height={size}
      style={{ display: "block", width: size, height: size, objectFit: "contain" }}
    />
    <span style={{
      fontFamily: "var(--font-sans)",
      fontWeight: 700,
      fontSize: size * 0.5,
      color: "#000",
      letterSpacing: "-0.01em",
      lineHeight: 1,
    }}>
      Business
    </span>
  </div>
);

// ============ Gcore wordmark — uses official Gcore logo asset ============
const GcoreLogo = ({ size = 16, dark = false, wordmarkOnly = false }) => {
  // Use the full wordmark version when there's enough room; just the G mark when compact.
  const useFull = size >= 22 || wordmarkOnly;
  if (useFull) {
    return (
      <img
        src="assets/logos/gcore-wordmark.png"
        alt="Gcore"
        height={size}
        style={{
          display: "inline-block",
          height: size,
          width: "auto",
          verticalAlign: "middle",
          filter: dark ? "brightness(0) invert(1)" : "none",
        }}
      />
    );
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: "var(--font-sans)",
      fontWeight: 800,
      fontSize: size * 0.95,
      letterSpacing: "0.01em",
      color: dark ? "#fff" : "#FF6E1F",
      lineHeight: 1,
    }}>
      <img
        src="assets/logos/gcore-mark.png"
        alt=""
        width={size}
        height={size}
        style={{ display: "block", width: size, height: size, objectFit: "contain" }}
      />
      <span style={{ color: dark ? "#fff" : "#FF6E1F" }}>GCORE</span>
    </span>
  );
};

// ============ Inline brand glyphs ============
// Each renders an SVG centered in viewBox 0 0 24 24, fill via currentColor or hardcoded.
const BRAND_GLYPHS = {
  // Hugging Face — yellow smiley
  huggingface: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="#FFD21E" />
      <circle cx="11.2" cy="13.5" r="1.8" fill="#000" />
      <circle cx="20.8" cy="13.5" r="1.8" fill="#000" />
      <circle cx="11.9" cy="13" r="0.5" fill="#fff" />
      <circle cx="21.5" cy="13" r="0.5" fill="#fff" />
      {/* Smile (mouth as path) */}
      <path d="M 9.5 18 Q 16 23.5 22.5 18 Q 22 22 16 22 Q 10 22 9.5 18 Z" fill="#7E2517" />
      <path d="M 9.5 18 Q 16 23.5 22.5 18" fill="#fff" />
      {/* Hands */}
      <circle cx="7" cy="20" r="2.5" fill="#F59E0B" />
      <circle cx="25" cy="20" r="2.5" fill="#F59E0B" />
    </svg>
  ),

  // Mistral AI — official orange/yellow/red stacked bars logo
  mistral: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="2" y="6"  width="6" height="4" fill="#FFD800" />
      <rect x="2" y="10" width="6" height="4" fill="#FFAF00" />
      <rect x="2" y="14" width="6" height="4" fill="#FF8205" />
      <rect x="2" y="18" width="6" height="4" fill="#FA520F" />
      <rect x="2" y="22" width="6" height="4" fill="#E10500" />
      <rect x="11" y="6"  width="6" height="4" fill="#FFD800" />
      <rect x="11" y="22" width="6" height="4" fill="#E10500" />
      <rect x="20" y="6"  width="6" height="4" fill="#FFD800" />
      <rect x="20" y="10" width="6" height="4" fill="#FFAF00" />
      <rect x="20" y="14" width="6" height="4" fill="#FF8205" />
      <rect x="20" y="18" width="6" height="4" fill="#FA520F" />
      <rect x="20" y="22" width="6" height="4" fill="#E10500" />
    </svg>
  ),

  // Meta — blue infinity loop (simplified)
  meta: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M 6 16 Q 6 8 12 8 Q 16 8 19 14 L 22 19 Q 23 21 24.5 21 Q 26 21 26 19 Q 26 17 24 17 L 16 17 Q 14 17 11.5 21 Q 9 25 6 25 Q 2 25 2 21 Q 2 14 8 11"
        fill="none" stroke="#0866FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),

  // OpenAI — black hexagonal swirl
  openai: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <g fill="#fff" stroke="none">
        <path d="M 21 5 L 27 8.5 L 27 16 L 21 19.5 L 15 16 L 15 8.5 Z" opacity="0.95" />
        <path d="M 5 12.5 L 11 9 L 17 12.5 L 17 19.5 L 11 23 L 5 19.5 Z" opacity="0.85" />
        <path d="M 13 18 L 19 14.5 L 25 18 L 25 25 L 19 28.5 L 13 25 Z" opacity="0.9" />
      </g>
    </svg>
  ),

  // Microsoft — 4 colored squares
  microsoft: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="3"  y="3"  width="12" height="12" fill="#F25022" />
      <rect x="17" y="3"  width="12" height="12" fill="#7FBA00" />
      <rect x="3"  y="17" width="12" height="12" fill="#00A4EF" />
      <rect x="17" y="17" width="12" height="12" fill="#FFB900" />
    </svg>
  ),

  // Alibaba (Qwen) — orange brackets + cloud
  alibaba: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M 5 14 Q 5 9 10 9 L 14 9 L 14 12 L 10 12 Q 8 12 8 14 L 8 18 Q 8 20 10 20 L 14 20 L 14 23 L 10 23 Q 5 23 5 18 Z" fill="#FF6A00" />
      <path d="M 27 14 Q 27 9 22 9 L 18 9 L 18 12 L 22 12 Q 24 12 24 14 L 24 18 Q 24 20 22 20 L 18 20 L 18 23 L 22 23 Q 27 23 27 18 Z" fill="#FF6A00" />
      <rect x="14" y="14" width="4" height="4" fill="#FF6A00" />
    </svg>
  ),

  // BAAI — placeholder using "智" symbol via styled letter (in flag-red bg)
  baai: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" fill="#16a34a" />
      <text x="16" y="22" fontSize="18" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="var(--font-sans)">B</text>
    </svg>
  ),

  // LLaVA — red L
  llava: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" fill="#dc2626" />
      <text x="16" y="22" fontSize="18" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="var(--font-sans)">L</text>
    </svg>
  ),

  mixedbread: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" fill="#ca8a04" />
      <text x="16" y="22" fontSize="18" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="var(--font-sans)">m</text>
    </svg>
  ),
};

// ============ HuggingFace logo (bundled SVG asset) ============
const HuggingFaceLogo = ({ size = 16, showText = true }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: size * 0.9, fontWeight: 600, color: "#000", lineHeight: 1 }}>
    <img src="assets/logos/hugging-face.svg" alt="Hugging Face" width={size} height={size} style={{ display: "block" }} />
    {showText && <span>Hugging Face</span>}
  </span>
);
const HuggingFaceIcon = ({ size = 14 }) => (
  <img src="assets/logos/hugging-face.svg" alt="HF" width={size} height={size} style={{ display: "inline-block", verticalAlign: "middle" }} />
);

// ============ Brand registry: org name → local SVG asset + background ============
// Logos sourced from homarr-labs/dashboard-icons (MIT) and bundled in assets/logos/.
const ORG_BRANDS = {
  "Mistral AI":     { src: "assets/logos/mistral-ai.svg",   bg: "#fff", border: true, padded: true },
  "Meta":           { src: "assets/logos/meta.svg",         bg: "#fff", border: true, padded: true },
  "Qwen / Alibaba": { src: "assets/logos/qwen.svg",         bg: "#fff", border: true, padded: true },
  "Microsoft":      { src: "assets/logos/microsoft.svg",    bg: "#fff", border: true, padded: true },
  "OpenAI":         { src: "assets/logos/openai.svg",       bg: "#fff", border: true, padded: true },
  "DeepSeek":       { src: "assets/logos/deepseek.svg",     bg: "#fff", border: true, padded: true },
  "Google":         { src: "assets/logos/google.svg",       bg: "#fff", border: true, padded: true },
  "NVIDIA":         { src: "assets/logos/nvidia.svg",       bg: "#fff", border: true, padded: true },
  "Databricks":     { src: "assets/logos/databricks.svg",   bg: "#fff", border: true, padded: true },
  // Real HuggingFace org avatars (the actual logos shown on huggingface.co).
  "LLaVA":          { src: "assets/logos/llava.webp",       bg: "#fff", border: true, padded: false },
  "BAAI":           { src: "assets/logos/baai.webp",        bg: "#fff", border: true, padded: true },
  "mixedbread":     { src: "assets/logos/mixedbread.webp",  bg: "#fff", border: true, padded: true },
};

// Coloured square containing the brand's logo (image or inline fallback).
const BrandAvatar = ({ org, size = 36 }) => {
  const brand = ORG_BRANDS[org];
  const inset = brand?.padded ? size * 0.18 : 0;
  const innerSize = size - inset * 2;

  if (!brand) {
    return (
      <div style={{
        width: size, height: size,
        background: "var(--color-grey-300)",
        color: "#000",
        display: "grid", placeItems: "center",
        flexShrink: 0,
      }} title={org}>
        <span style={{ fontSize: size * 0.45, fontWeight: 700, lineHeight: 1 }}>{org?.[0] || "?"}</span>
      </div>
    );
  }

  const glyph = brand.glyph && BRAND_GLYPHS[brand.glyph];

  return (
    <div
      title={org}
      style={{
        width: size, height: size,
        background: brand.bg || "transparent",
        color: brand.fg || "#000",
        display: "grid", placeItems: "center",
        flexShrink: 0,
        border: brand.border ? "1px solid var(--line)" : "none",
        overflow: "hidden",
      }}
    >
      <div style={{ width: innerSize, height: innerSize, display: "grid", placeItems: "center" }}>
        {brand.src ? (
          <img
            src={brand.src}
            alt={org}
            width={innerSize}
            height={innerSize}
            style={{ display: "block", width: innerSize, height: innerSize, objectFit: "contain" }}
          />
        ) : glyph ? (
          glyph({ size: innerSize })
        ) : brand.wordmark ? (
          <span style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 900,
            fontSize: Math.min(innerSize * 0.42, brand.wordmark.length > 4 ? innerSize * 0.28 : innerSize * 0.42),
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: brand.fg || "#fff",
          }}>{brand.wordmark}</span>
        ) : (
          <span style={{ fontSize: innerSize * 0.55, fontWeight: 700, lineHeight: 1 }}>{org?.[0] || "?"}</span>
        )}
      </div>
    </div>
  );
};

Object.assign(window, {
  OrangeBusinessLogo, GcoreLogo, HuggingFaceLogo, HuggingFaceIcon,
  BrandAvatar, ORG_BRANDS, BRAND_GLYPHS,
});
