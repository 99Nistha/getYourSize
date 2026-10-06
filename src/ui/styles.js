/**
 * All widget CSS lives here and is injected into the Shadow DOM.
 * The host page's styles can never reach these rules.
 */
export const CSS = `
  :host { all: initial; }

  *, *::before, *::after { box-sizing: border-box; }

  /* ── Tokens ─────────────────────────────────────── */
  :host {
    --gys-primary:      #E84C6B;
    --gys-primary-dk:   #c73a58;
    --gys-bg:           #ffffff;
    --gys-text:         #1a1a1a;
    --gys-subtle:       #6b7280;
    --gys-border:       #e5e7eb;
    --gys-surface:      #f9fafb;
    --gys-radius:       16px;
    --gys-font:         -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  }

  /* ── Overlay ─────────────────────────────────────── */
  #gys-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 2147483647;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    animation: gys-backdrop 0.2s ease;
  }

  @media (min-width: 640px) {
    #gys-overlay { align-items: center; }
  }

  @keyframes gys-backdrop {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes gys-rise {
    from { transform: translateY(32px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  /* ── Modal box ───────────────────────────────────── */
  #gys-modal {
    background: var(--gys-bg);
    border-radius: var(--gys-radius) var(--gys-radius) 0 0;
    width: 100%;
    max-width: 480px;
    max-height: 92dvh;
    overflow-y: auto;
    padding: 24px 22px 36px;
    font-family: var(--gys-font);
    animation: gys-rise 0.25s ease;
    -webkit-overflow-scrolling: touch;
  }

  @media (min-width: 640px) {
    #gys-modal {
      border-radius: var(--gys-radius);
      max-height: 86vh;
    }
  }

  /* ── Header ──────────────────────────────────────── */
  .gys-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .gys-logo {
    font-size: 14px;
    font-weight: 700;
    color: var(--gys-primary);
    letter-spacing: -0.2px;
  }

  .gys-close {
    all: unset;
    cursor: pointer;
    color: var(--gys-subtle);
    font-size: 20px;
    line-height: 1;
    padding: 6px;
    border-radius: 50%;
    transition: background 0.15s;
  }
  .gys-close:hover { background: var(--gys-border); }

  /* ── Progress dots ───────────────────────────────── */
  .gys-dots {
    display: flex;
    gap: 5px;
    margin-bottom: 24px;
  }

  .gys-dot {
    flex: 1;
    height: 3px;
    border-radius: 2px;
    background: var(--gys-border);
    transition: background 0.3s;
  }
  .gys-dot.active { background: var(--gys-primary); }
  .gys-dot.done   { background: var(--gys-primary-dk); }

  /* ── Steps ───────────────────────────────────────── */
  .gys-step { display: none; }
  .gys-step.visible { display: block; }

  .gys-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--gys-text);
    margin: 0 0 8px;
    line-height: 1.25;
  }

  .gys-sub {
    font-size: 14px;
    color: var(--gys-subtle);
    margin: 0 0 22px;
    line-height: 1.55;
  }

  /* ── Chart status pill ───────────────────────────── */
  .gys-chart-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    padding: 5px 11px;
    border-radius: 20px;
    margin-bottom: 20px;
  }
  .gys-chart-pill.found   { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  .gys-chart-pill.missing { background: #fefce8; color: #a16207; border: 1px solid #fde68a; }
  .gys-chart-pill.ocr     { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }

  /* ── Unit toggle ─────────────────────────────────── */
  .gys-unit-toggle {
    display: flex;
    background: var(--gys-surface);
    border-radius: 10px;
    padding: 3px;
    margin-bottom: 18px;
    width: fit-content;
  }

  .gys-unit-btn {
    all: unset;
    cursor: pointer;
    padding: 7px 18px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--gys-subtle);
    transition: background 0.15s, color 0.15s;
  }
  .gys-unit-btn.active {
    background: var(--gys-bg);
    color: var(--gys-text);
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  }

  /* ── Inputs ──────────────────────────────────────── */
  .gys-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--gys-subtle);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 7px;
  }

  .gys-input-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
  }

  .gys-input {
    flex: 1;
    padding: 12px 14px;
    border: 1.5px solid var(--gys-border);
    border-radius: 10px;
    font-size: 16px;
    font-family: var(--gys-font);
    outline: none;
    background: var(--gys-bg);
    color: var(--gys-text);
    transition: border-color 0.2s;
    width: 100%;
  }
  .gys-input:focus  { border-color: var(--gys-primary); }
  .gys-input.narrow { flex: 0 0 72px; }

  .gys-unit-lbl {
    font-size: 14px;
    color: var(--gys-subtle);
    white-space: nowrap;
  }

  select.gys-input { cursor: pointer; }

  /* ── Camera box ──────────────────────────────────── */
  .gys-camera-box {
    position: relative;
    background: #111;
    border-radius: 12px;
    overflow: hidden;
    aspect-ratio: 3 / 4;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gys-camera-box video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1);
    display: block;
  }

  .gys-camera-box canvas { display: none; }

  /* silhouette guide overlay */
  .gys-guide {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .gys-guide-body {
    width: 36%;
    height: 80%;
    border: 2px dashed rgba(255,255,255,0.4);
    border-radius: 40% 40% 30% 30% / 15% 15% 10% 10%;
    position: relative;
  }

  .gys-guide-body::before {
    content: '';
    position: absolute;
    top: -16%;
    left: 50%;
    transform: translateX(-50%);
    width: 36%;
    height: 24%;
    border: 2px dashed rgba(255,255,255,0.4);
    border-radius: 50%;
  }

  /* photo preview */
  .gys-preview {
    position: absolute;
    inset: 0;
  }
  .gys-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }

  .gys-camera-hint {
    font-size: 12px;
    color: var(--gys-subtle);
    text-align: center;
    margin-bottom: 14px;
    line-height: 1.4;
  }

  /* ── Processing ──────────────────────────────────── */
  .gys-processing {
    text-align: center;
    padding: 40px 0 24px;
  }

  .gys-spinner {
    width: 44px;
    height: 44px;
    border: 3px solid var(--gys-border);
    border-top-color: var(--gys-primary);
    border-radius: 50%;
    animation: gys-spin 0.75s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes gys-spin { to { transform: rotate(360deg); } }

  .gys-processing p {
    font-size: 15px;
    color: var(--gys-subtle);
    margin: 4px 0;
  }

  .gys-processing .gys-processing-sub {
    font-size: 13px;
  }

  /* ── Result ──────────────────────────────────────── */
  .gys-result-card {
    background: linear-gradient(145deg, #fff5f7, #fff);
    border: 1.5px solid #fce7ec;
    border-radius: 14px;
    padding: 22px;
    text-align: center;
    margin-bottom: 18px;
  }

  .gys-result-size {
    font-size: 58px;
    font-weight: 800;
    color: var(--gys-primary);
    line-height: 1;
    margin-bottom: 4px;
  }

  .gys-result-lbl { font-size: 13px; color: var(--gys-subtle); margin-bottom: 10px; }

  .gys-result-note {
    font-size: 14px;
    color: var(--gys-text);
    font-style: italic;
    line-height: 1.4;
  }

  .gys-meas-row {
    display: flex;
    justify-content: space-around;
    background: var(--gys-surface);
    border-radius: 10px;
    padding: 14px 8px;
    margin-bottom: 18px;
  }

  .gys-meas-item { text-align: center; }
  .gys-meas-val  { font-size: 17px; font-weight: 700; color: var(--gys-text); }
  .gys-meas-lbl  { font-size: 11px; color: var(--gys-subtle); margin-top: 2px; }

  .gys-confidence {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    border-radius: 20px;
    padding: 4px 11px;
    margin-bottom: 8px;
  }
  .gys-confidence.high   { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  .gys-confidence.medium { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
  .gys-confidence.low    { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

  .gys-wrong-link {
    display: block;
    text-align: center;
    font-size: 12px;
    color: var(--gys-subtle);
    margin-top: 6px;
    cursor: pointer;
    text-decoration: underline;
  }

  /* ── Error ───────────────────────────────────────── */
  .gys-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    padding: 13px 15px;
    font-size: 14px;
    color: #dc2626;
    margin-bottom: 14px;
    line-height: 1.4;
  }

  /* ── Buttons ─────────────────────────────────────── */
  .gys-btn {
    all: unset;
    display: block;
    width: 100%;
    padding: 15px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    font-family: var(--gys-font);
    cursor: pointer;
    text-align: center;
    transition: opacity 0.15s, transform 0.1s;
    margin-bottom: 9px;
  }
  .gys-btn:active { transform: scale(0.98); }
  .gys-btn:disabled { opacity: 0.4; pointer-events: none; }

  .gys-btn-primary  { background: var(--gys-primary); color: #fff; }
  .gys-btn-primary:hover { opacity: 0.9; }

  .gys-btn-secondary {
    background: transparent;
    color: var(--gys-subtle);
    border: 1.5px solid var(--gys-border);
    font-size: 15px;
  }
  .gys-btn-secondary:hover { background: var(--gys-surface); }

  /* file input label acts like a button */
  label.gys-btn { box-sizing: border-box; }
`;
