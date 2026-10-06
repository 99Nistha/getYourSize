(function(){"use strict";const V=/^(xs|s|m|l|xl|2xl|xxl|3xl|xxxl)$/i,tt=/^(x-?small|small|medium|large|x-?large|xx-?large|2x-?large)$/i,et=/^(28|30|32|34|36|38|40|42|44|46|48|50|52)$/;function T(s){const t=s.trim();return V.test(t)||tt.test(t)||et.test(t)}function st(){const s=document.getElementById("getyoursize-btn");if(s)return{el:s,mode:"inside"};for(const i of document.querySelectorAll("select"))if(Array.from(i.options).map(o=>o.text.trim()).some(T))return{el:i,mode:"after"};for(const i of document.querySelectorAll("input[type=radio]"))if(T(i.value||""))return{el:i.closest("fieldset")||i.closest("[class*=size]")||i.closest("[class*=variant]")||i.closest("[class*=swatch]")||i.parentElement,mode:"after"};const e=Array.from(document.querySelectorAll("button, a, [role=radio], [role=option], [role=button]")).filter(i=>T(i.textContent));return e.length>=2?{el:e[0].closest("[class*=size]")||e[0].closest("[class*=variant]")||e[0].closest("ul")||e[0].parentElement,mode:"after"}:null}function $(s){const t=document.createElement("button");return t.id="gys-trigger",t.type="button",t.textContent="📐 Get Your Size",Object.assign(t.style,{display:"inline-flex",alignItems:"center",gap:"6px",padding:"10px 18px",marginTop:"12px",background:"#E84C6B",color:"#fff",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:"600",fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',cursor:"pointer",letterSpacing:"-0.1px",transition:"opacity 0.15s"}),t.onmouseenter=()=>{t.style.opacity="0.88"},t.onmouseleave=()=>{t.style.opacity="1"},t.addEventListener("click",s),t}function it(s){const t=$(s);return Object.assign(t.style,{position:"fixed",bottom:"24px",right:"24px",zIndex:"2147483646",marginTop:"0",boxShadow:"0 4px 16px rgba(232,76,107,0.35)",borderRadius:"24px",padding:"12px 22px",fontSize:"15px"}),t}function nt(s){if(document.getElementById("gys-trigger"))return;function t(){if(document.getElementById("gys-trigger"))return;const i=st();if(i){const n=$(s);i.mode==="inside"?i.el.appendChild(n):i.el.insertAdjacentElement("afterend",n)}else document.body.appendChild(it(s))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t(),new MutationObserver(()=>{document.getElementById("gys-trigger")||t()}).observe(document.body,{childList:!0,subtree:!0})}const ot=`
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
`;class at{constructor(){this._host=null,this._shadow=null,this._step=null,this._data={heightCm:null,frontPhoto:null,sidePhoto:null,measurements:null,result:null},this._sizeChart=null,this._onResult=null,this._streams=[]}setSizeChart(t){this._sizeChart=t}onResult(t){this._onResult=t}open(){this._shadow||this._build(),this._host.style.display="",this._goTo("welcome")}close(){this._stopStreams(),this._host&&(this._host.style.display="none")}_build(){this._host=document.createElement("div"),this._host.id="gys-host",document.body.appendChild(this._host),this._shadow=this._host.attachShadow({mode:"open"});const t=document.createElement("style");t.textContent=ot,this._shadow.appendChild(t);const e=document.createElement("div");e.id="gys-overlay",e.innerHTML=this._html(),this._shadow.appendChild(e),this._wire()}_html(){return`
      <div id="gys-modal" role="dialog" aria-modal="true" aria-label="Get Your Size">

        <!-- Header -->
        <div class="gys-header">
          <span class="gys-logo">✦ GetYourSize</span>
          <button class="gys-close" aria-label="Close">✕</button>
        </div>

        <!-- Progress dots (only for main photo flow) -->
        <div class="gys-dots" id="gys-dots">
          ${[1,2,3,4].map(t=>`<div class="gys-dot" data-n="${t}"></div>`).join("")}
        </div>

        <!-- ① Welcome -->
        <div class="gys-step" id="gys-s-welcome">
          <h2 class="gys-title">Find your perfect fit</h2>
          <p class="gys-sub">
            Take 2 quick photos and get a personalised size recommendation.
            Everything is analysed on your device — your photos are never uploaded.
          </p>
          <div id="gys-chart-status"></div>
          <button class="gys-btn gys-btn-primary" id="gys-start">Get Started →</button>
          <button class="gys-btn gys-btn-secondary" id="gys-to-quiz">Use size quiz instead</button>
        </div>

        <!-- ② Height -->
        <div class="gys-step" id="gys-s-height">
          <h2 class="gys-title">How tall are you?</h2>
          <p class="gys-sub">Your height lets us convert photo pixels into real measurements.</p>

          <div class="gys-unit-toggle">
            <button class="gys-unit-btn active" data-unit="cm">cm</button>
            <button class="gys-unit-btn" data-unit="ftin">ft / in</button>
          </div>

          <div id="gys-cm-row">
            <label class="gys-label">Height</label>
            <div class="gys-input-row">
              <input id="gys-h-cm" type="number" class="gys-input"
                     placeholder="165" min="120" max="220" inputmode="numeric">
              <span class="gys-unit-lbl">cm</span>
            </div>
          </div>

          <div id="gys-ftin-row" style="display:none">
            <label class="gys-label">Height</label>
            <div class="gys-input-row">
              <input id="gys-h-ft" type="number" class="gys-input narrow"
                     placeholder="5" min="3" max="7" inputmode="numeric">
              <span class="gys-unit-lbl">ft</span>
              <input id="gys-h-in" type="number" class="gys-input narrow"
                     placeholder="6" min="0" max="11" inputmode="numeric">
              <span class="gys-unit-lbl">in</span>
            </div>
          </div>

          <button class="gys-btn gys-btn-primary" id="gys-height-next" disabled>
            Continue →
          </button>
        </div>

        <!-- ③ Front photo -->
        <div class="gys-step" id="gys-s-front">
          <h2 class="gys-title">Front photo</h2>
          <p class="gys-sub">Stand ~2 m from the camera. Full body in frame. Arms slightly away from your body.</p>
          <div class="gys-camera-box" id="gys-cam-front">
            <video id="gys-vid-front" autoplay playsinline muted></video>
            <canvas id="gys-can-front"></canvas>
            <div class="gys-guide"><div class="gys-guide-body"></div></div>
            <div class="gys-preview" id="gys-prev-front" style="display:none">
              <img id="gys-img-front" alt="Your front photo">
            </div>
          </div>
          <p class="gys-camera-hint">💡 Wear fitted clothes for best accuracy</p>
          <button class="gys-btn gys-btn-primary" id="gys-cap-front">📷 Take Photo</button>
          <label class="gys-btn gys-btn-secondary">
            Upload photo instead
            <input type="file" accept="image/*" id="gys-upl-front" style="display:none">
          </label>
          <div id="gys-err-front"></div>
        </div>

        <!-- ④ Side photo -->
        <div class="gys-step" id="gys-s-side">
          <h2 class="gys-title">Side photo</h2>
          <p class="gys-sub">Turn 90° to your right. Same distance. Arms relaxed at your sides.</p>
          <div class="gys-camera-box" id="gys-cam-side">
            <video id="gys-vid-side" autoplay playsinline muted></video>
            <canvas id="gys-can-side"></canvas>
            <div class="gys-guide"><div class="gys-guide-body"></div></div>
            <div class="gys-preview" id="gys-prev-side" style="display:none">
              <img id="gys-img-side" alt="Your side photo">
            </div>
          </div>
          <p class="gys-camera-hint">💡 Profile view — shoulders, waist and hips all visible</p>
          <button class="gys-btn gys-btn-primary" id="gys-cap-side">📷 Take Photo</button>
          <label class="gys-btn gys-btn-secondary">
            Upload photo instead
            <input type="file" accept="image/*" id="gys-upl-side" style="display:none">
          </label>
          <div id="gys-err-side"></div>
        </div>

        <!-- ⑤ Processing -->
        <div class="gys-step" id="gys-s-processing">
          <div class="gys-processing">
            <div class="gys-spinner"></div>
            <p id="gys-proc-msg">Loading measurement model…</p>
            <p class="gys-processing-sub">This can take a few seconds on first use</p>
          </div>
        </div>

        <!-- ⑥ Result -->
        <div class="gys-step" id="gys-s-result">
          <div id="gys-result-content"></div>
        </div>

        <!-- Quiz fallback -->
        <div class="gys-step" id="gys-s-quiz">
          <h2 class="gys-title">Quick size quiz</h2>
          <p class="gys-sub">Answer 3 questions for a size estimate without photos.</p>

          <label class="gys-label">Your height</label>
          <div class="gys-input-row">
            <input id="gys-q-height" type="number" class="gys-input"
                   placeholder="165" min="120" max="220" inputmode="numeric">
            <span class="gys-unit-lbl">cm</span>
          </div>

          <label class="gys-label">Your weight (optional)</label>
          <div class="gys-input-row">
            <input id="gys-q-weight" type="number" class="gys-input"
                   placeholder="60" min="30" max="200" inputmode="numeric">
            <span class="gys-unit-lbl">kg</span>
          </div>

          <label class="gys-label">Size you usually wear</label>
          <div class="gys-input-row">
            <select id="gys-q-usual" class="gys-input">
              <option value="">Select…</option>
              <option>XS</option><option>S</option><option>M</option>
              <option>L</option><option>XL</option><option>XXL</option>
            </select>
          </div>

          <button class="gys-btn gys-btn-primary" id="gys-quiz-go">Get My Size →</button>
          <button class="gys-btn gys-btn-secondary" id="gys-quiz-back">Try photos instead</button>
        </div>

      </div>
    `}_wire(){const t=this._shadow;t.querySelector(".gys-close").addEventListener("click",()=>this.close()),t.querySelector("#gys-overlay").addEventListener("click",e=>{e.target.id==="gys-overlay"&&this.close()}),t.querySelector("#gys-start").addEventListener("click",()=>this._goTo("height")),t.querySelector("#gys-to-quiz").addEventListener("click",()=>this._goTo("quiz")),t.querySelectorAll(".gys-unit-btn").forEach(e=>{e.addEventListener("click",()=>{t.querySelectorAll(".gys-unit-btn").forEach(n=>n.classList.remove("active")),e.classList.add("active");const i=e.dataset.unit;t.getElementById("gys-cm-row").style.display=i==="cm"?"":"none",t.getElementById("gys-ftin-row").style.display=i==="ftin"?"":"none",this._validateHeight()})}),t.getElementById("gys-h-cm").addEventListener("input",()=>this._validateHeight()),t.getElementById("gys-h-ft").addEventListener("input",()=>this._validateHeight()),t.getElementById("gys-h-in").addEventListener("input",()=>this._validateHeight()),t.getElementById("gys-height-next").addEventListener("click",()=>{this._saveHeight(),this._goTo("front")}),t.getElementById("gys-cap-front").addEventListener("click",()=>this._capture("front")),t.getElementById("gys-upl-front").addEventListener("change",e=>this._uploadFile(e,"front")),t.getElementById("gys-cap-side").addEventListener("click",()=>this._capture("side")),t.getElementById("gys-upl-side").addEventListener("change",e=>this._uploadFile(e,"side")),t.getElementById("gys-quiz-go").addEventListener("click",()=>this._runQuiz()),t.getElementById("gys-quiz-back").addEventListener("click",()=>this._goTo("welcome"))}_goTo(t){this._step=t;const e=this._shadow;e.querySelectorAll(".gys-step").forEach(r=>r.classList.remove("visible"));const i=e.getElementById(`gys-s-${t}`);i&&i.classList.add("visible");const n={height:1,front:2,side:3,processing:4,result:4},o=e.querySelectorAll(".gys-dot"),a=n[t];e.getElementById("gys-dots").style.display=t==="welcome"||t==="quiz"?"none":"",o.forEach((r,l)=>{r.classList.toggle("done",a!=null&&l+1<a),r.classList.toggle("active",a!=null&&l+1===a)}),t!=="front"&&t!=="side"&&this._stopStreams(),t==="front"&&this._startCamera("front"),t==="side"&&this._startCamera("side"),t==="welcome"&&this._renderChartStatus()}_renderChartStatus(){const t=this._shadow.getElementById("gys-chart-status");if(!t)return;const e=this._sizeChart;e?e.source==="ocr"?t.innerHTML='<div class="gys-chart-pill ocr">🔍 Size chart read from image on this page</div>':t.innerHTML='<div class="gys-chart-pill found">✓ Size chart found on this page</div>':t.innerHTML='<div class="gys-chart-pill missing">⚠ No size chart found — using default chart</div>'}_validateHeight(){var n;const t=this._shadow,e=((n=t.querySelector(".gys-unit-btn.active"))==null?void 0:n.dataset.unit)==="ftin";let i=!1;if(e){const o=parseFloat(t.getElementById("gys-h-ft").value),a=parseFloat(t.getElementById("gys-h-in").value||"0");i=o>=3&&o<=7&&a>=0&&a<=11}else{const o=parseFloat(t.getElementById("gys-h-cm").value);i=o>=120&&o<=220}t.getElementById("gys-height-next").disabled=!i}_saveHeight(){var i;const t=this._shadow;if(((i=t.querySelector(".gys-unit-btn.active"))==null?void 0:i.dataset.unit)==="ftin"){const n=parseFloat(t.getElementById("gys-h-ft").value),o=parseFloat(t.getElementById("gys-h-in").value||"0");this._data.heightCm=Math.round((n*12+o)*2.54)}else this._data.heightCm=parseFloat(t.getElementById("gys-h-cm").value)}async _startCamera(t){const e=this._shadow.getElementById(`gys-vid-${t}`);if(e)try{const i=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1280},height:{ideal:720}},audio:!1});this._streams.push(i),e.srcObject=i}catch(i){this._showError(t,"Camera access denied. Please upload a photo instead."),this._shadow.getElementById(`gys-cap-${t}`).style.display="none"}}_stopStreams(){this._streams.forEach(t=>t.getTracks().forEach(e=>e.stop())),this._streams=[]}_capture(t){const e=this._shadow,i=e.getElementById(`gys-vid-${t}`),n=e.getElementById(`gys-can-${t}`);n.width=i.videoWidth||640,n.height=i.videoHeight||480;const o=n.getContext("2d");o.translate(n.width,0),o.scale(-1,1),o.drawImage(i,0,0),this._savePhoto(t,n)}_uploadFile(t,e){const i=t.target.files[0];if(!i)return;const n=new Image;n.onload=()=>{const o=this._shadow.getElementById(`gys-can-${e}`);o.width=n.naturalWidth,o.height=n.naturalHeight,o.getContext("2d").drawImage(n,0,0),this._savePhoto(e,o),URL.revokeObjectURL(n.src)},n.src=URL.createObjectURL(i)}_savePhoto(t,e){const i=e.toDataURL("image/jpeg",.85);this._data[`${t}Photo`]={canvas:e,dataUrl:i};const n=this._shadow.getElementById(`gys-prev-${t}`),o=this._shadow.getElementById(`gys-img-${t}`);o.src=i,n.style.display="",this._stopStreams();const a=this._shadow.getElementById(`gys-cap-${t}`);a.textContent="🔄 Retake",setTimeout(()=>{t==="front"?this._goTo("side"):this._runAnalysis()},700)}_showError(t,e){const i=this._shadow.getElementById(`gys-err-${t}`);i&&(i.innerHTML=`<div class="gys-error">${e}</div>`)}async _runAnalysis(){this._goTo("processing");try{const{detectPose:t}=await Promise.resolve().then(()=>kt),{toMeasurements:e}=await Promise.resolve().then(()=>It),{recommend:i}=await Promise.resolve().then(()=>J),n=g=>this._setProcessingMsg(g),o=await t(this._data.frontPhoto.canvas,{isSide:!1,onProgress:n});this._setProcessingMsg("Detecting side pose…");const a=await t(this._data.sidePhoto.canvas,{isSide:!0,onProgress:()=>{}});this._setProcessingMsg("Calculating your measurements…");const r=e(o,a,this._data.heightCm);this._setProcessingMsg("Finding your size…");const l=this._sizeChart,c=i(r,"women",(l==null?void 0:l.sizes)||null,"tops",(l==null?void 0:l.chartType)||"body");this._data.measurements=r,this._data.result=c,this._data.frontPhoto=null,this._data.sidePhoto=null,Promise.resolve().then(()=>Dt).then(({saveProfile:g})=>g(r)).catch(()=>{}),this._showResult(c,r),this._onResult&&this._onResult(c)}catch(t){console.error("[GetYourSize]",t),this._showResultError(t.message)}}_setProcessingMsg(t){const e=this._shadow.getElementById("gys-proc-msg");e&&(e.textContent=t)}_showResult(t,e){var a,r;const i=t.confidence,n=`
      <h2 class="gys-title" style="margin-bottom:16px">Your recommended size</h2>
      <div class="gys-result-card">
        <div class="gys-result-size">${t.size}</div>
        <div class="gys-result-lbl">Recommended size</div>
        <div class="gys-confidence ${i}">
          ${i==="high"?"✓ High confidence":i==="medium"?"~ Medium confidence":"⚠ Low confidence"}
        </div>
        <div class="gys-result-note">${t.note}</div>
      </div>
      <div class="gys-meas-row">
        <div class="gys-meas-item">
          <div class="gys-meas-val">${e.chest} cm</div>
          <div class="gys-meas-lbl">Chest</div>
        </div>
        <div class="gys-meas-item">
          <div class="gys-meas-val">${e.waist} cm</div>
          <div class="gys-meas-lbl">Waist</div>
        </div>
        <div class="gys-meas-item">
          <div class="gys-meas-val">${e.hip} cm</div>
          <div class="gys-meas-lbl">Hip</div>
        </div>
      </div>
      ${(a=t.alternatives)!=null&&a.length?`
        <p style="font-size:13px;color:var(--gys-subtle);margin-bottom:8px">
          Also fits: ${t.alternatives.join(", ")}
        </p>`:""}
      <button class="gys-btn gys-btn-primary" id="gys-retake">Retake photos</button>
      <span class="gys-wrong-link" id="gys-wrong">This looks wrong</span>
    `,o=this._shadow.getElementById("gys-result-content");o.innerHTML=n,this._goTo("result"),(r=this._shadow.getElementById("gys-retake"))==null||r.addEventListener("click",()=>{this._data.frontPhoto=null,this._data.sidePhoto=null,this._goTo("height")})}_showResultError(t=""){var n,o;const e=t||"Could not analyse your photos.",i=this._shadow.getElementById("gys-result-content");i.innerHTML=`
      <h2 class="gys-title" style="margin-bottom:12px">Something went wrong</h2>
      <div class="gys-error">${e}<br><br>Tips: stand 2 m back, full body in frame, bright even lighting.</div>
      <button class="gys-btn gys-btn-primary" id="gys-err-retry">Retake photos</button>
      <button class="gys-btn gys-btn-secondary" id="gys-err-quiz">Use quiz instead</button>
    `,this._goTo("result"),(n=this._shadow.getElementById("gys-err-retry"))==null||n.addEventListener("click",()=>this._goTo("height")),(o=this._shadow.getElementById("gys-err-quiz"))==null||o.addEventListener("click",()=>this._goTo("quiz"))}_runQuiz(){const t=this._shadow,e=parseFloat(t.getElementById("gys-q-height").value),i=parseFloat(t.getElementById("gys-q-weight").value||"0"),n=t.getElementById("gys-q-usual").value;if(!e||e<120||e>220){t.getElementById("gys-s-quiz").querySelector(".gys-sub").insertAdjacentHTML("afterend",'<div class="gys-error">Please enter a valid height (120–220 cm).</div>');return}Promise.resolve().then(()=>J).then(({quizRecommend:o})=>{const a=o({heightCm:e,weightKg:i,usualSize:n});this._data.result=a,this._showResult(a,a.measurements||{chest:"—",waist:"—",hip:"—"}),this._onResult&&this._onResult(a)})}}const rt={size:"label",sizes:"label",bust:"chest",chest:"chest","bust/chest":"chest","chest/bust":"chest",waist:"waist",hip:"hip",hips:"hip","hip/seat":"hip",seat:"hip",shoulder:"shoulder",shoulders:"shoulder",length:"length","garment length":"length","dress length":"length","full length":"length","total length":"length"};function F(s){const t=s.toLowerCase().replace(/\s*\(.*?\)\s*/g,"").replace(/\s*:.*$/g,"").replace(/\bto[\s-]fit[\s-]?/g,"").replace(/\s*\/\s*/g,"/").replace(/[^\w\s/]/g," ").replace(/\s+/g," ").trim();return rt[t]||null}const lt=new Set(["XS","S","M","L","XL","XXL","2XL","3XL","XXXL","XXXXL","4XL","XSMALL","SMALL","MEDIUM","LARGE","XLARGE","XXLARGE","X-SMALL","X-LARGE","XX-LARGE"]);function B(s){if(!s)return!1;const t=s.trim().toUpperCase().replace(/[\s-]/g,"");if(lt.has(t))return!0;if(/^\d{2}$/.test(t)){const e=parseInt(t,10);return e>=28&&e<=60}return!1}function E(s){const t={XSMALL:"XS","X-SMALL":"XS",SMALL:"S",MEDIUM:"M",LARGE:"L",XLARGE:"XL","X-LARGE":"XL",XXLARGE:"XXL","XX-LARGE":"XXL","2XL":"XXL","3XL":"XXXL"},e=s.trim().toUpperCase().replace(/[\s-]/g,"");return t[e]||s.trim().toUpperCase()}function S(s){if(!s&&s!==0)return null;const t=String(s).replace(/,/g,".").trim(),e=t.match(/(\d+(?:\.\d+)?)\s*[-–—\/to]+\s*(\d+(?:\.\d+)?)/);if(e){const n=parseFloat(e[1]),o=parseFloat(e[2]);return n<=o?[n,o]:[o,n]}const i=t.match(/(\d+(?:\.\d+)?)/);if(i){const n=parseFloat(i[1]);return[Math.max(0,n-2),n+2]}return null}function k(s=""){const t=s.toLowerCase();if(/\bcm\b|\bcentim/.test(t))return"cm";if(/\binch(es)?\b|\"\s|\bin\b|\bfeet\b|\bft\b/.test(t))return"in";const i=[...t.matchAll(/\b(\d{2})\b/g)].map(n=>parseInt(n[1],10)).filter(n=>n>24&&n<70);return i.length>=3&&i.reduce((o,a)=>o+a,0)/i.length<52?"in":"cm"}function L(s=""){const t=s.toLowerCase();return/\bto[ -]fit\b|\bbody\b|\bbody size\b|\bwear\b/.test(t)?"body":/\bgarment\b|\bfinished\b|\bactual\b|\bclothing\b/.test(t)?"garment":"body"}function ct(s){return s.map(t=>Math.round(t*2.54*2)/2)}function C(s,t){if(t!=="in")return s;const e={label:s.label};for(const[i,n]of Object.entries(s))i!=="label"&&(e[i]=Array.isArray(n)?ct(n):n);return e}function dt(s=document){var e,i;const t=Array.from(s.querySelectorAll("table"));for(const n of t){const o=Array.from(n.querySelectorAll("tr"));if(o.length<3)continue;let a=null,r=0;const l=n.querySelector("thead tr");if(l){const y=Array.from(l.querySelectorAll("th, td")),x=y.map(f=>f.textContent).join(" ").toLowerCase();/size|bust|chest|waist|hip/.test(x)&&(a=y,r=0)}if(!a){const y=Array.from(o[0].querySelectorAll("th, td")),x=y.map(f=>f.textContent).join(" ").toLowerCase();/size|bust|chest|waist|hip/.test(x)&&(a=y,r=1)}if(!a)continue;const c={};a.forEach((y,x)=>{const f=F(y.textContent.trim());f&&(c[x]=f)});const g=Object.values(c).includes("label"),u=Object.values(c).some(y=>["chest","waist","hip"].includes(y));if(!g||!u)continue;const d=((e=n.caption)==null?void 0:e.textContent)||""+((i=n.closest("[class*=size],[class*=chart],[class*=sizing]"))==null?void 0:i.textContent)||""+n.textContent,m=k(d),h=L(d),p=l?Array.from(n.querySelectorAll("tbody tr")):o.slice(r),_=[];for(const y of p){const x=Array.from(y.querySelectorAll("td"));if(x.length<2)continue;const f={};x.forEach((P,z)=>{const H=c[z];if(!H)return;const D=P.textContent.trim();if(H==="label")B(D)&&(f.label=E(D));else{const Z=S(D);Z&&(f[H]=Z)}}),f.label&&(f.chest||f.waist||f.hip)&&_.push(C(f,m))}if(_.length>=2)return{sizes:_,unit:"cm",chartType:h,source:"html",confidence:Math.min(.5+_.length*.1,.97)}}return null}function gt(s=document){var e;for(const i of s.querySelectorAll("dl")){const n=Array.from(i.querySelectorAll("dt")),o=Array.from(i.querySelectorAll("dd"));if(n.length<2)continue;const a=((e=i.closest("section, div, article"))==null?void 0:e.textContent)||i.textContent,r=k(a),l=L(a),c=[];if(n.forEach((g,u)=>{const d=g.textContent.trim();if(!B(d))return;const m=o[u];if(!m)return;const h=m.textContent,p={label:E(d)},_=h.match(/(?:bust|chest)\s*[:\s]+([0-9.]+\s*[-–—\/to]+\s*[0-9.]+|[0-9.]+)/i),y=h.match(/(?:waist)\s*[:\s]+([0-9.]+\s*[-–—\/to]+\s*[0-9.]+|[0-9.]+)/i),x=h.match(/(?:hip|hips|seat)\s*[:\s]+([0-9.]+\s*[-–—\/to]+\s*[0-9.]+|[0-9.]+)/i);_&&(p.chest=S(_[1])),y&&(p.waist=S(y[1])),x&&(p.hip=S(x[1])),(p.chest||p.waist||p.hip)&&c.push(C(p,r))}),c.length>=2)return{sizes:c,unit:"cm",chartType:l,source:"html",confidence:.75}}const t=Array.from(s.querySelectorAll("[class*=size],[class*=chart],[class*=sizing],[class*=guide]"));for(const i of t){const n=i.textContent;if(!/\b(xs|s|m|l|xl|xxl)\b/i.test(n)||!/\b(bust|chest|waist|hip)/i.test(n))continue;const o=k(n),a=L(n),r=[],l=n.split(/\b(xs|s|m|l|xl|xxl|2xl|xxxl)\b/i);for(let c=1;c<l.length;c+=2){const g=E(l[c]),u=l[c+1]||"",d={label:g},m=u.match(/(?:bust|chest)\s*[:\s]+([0-9.]+\s*[-–—\/to]+\s*[0-9.]+|[0-9.]+)/i),h=u.match(/(?:waist)\s*[:\s]+([0-9.]+\s*[-–—\/to]+\s*[0-9.]+|[0-9.]+)/i),p=u.match(/(?:hip|hips)\s*[:\s]+([0-9.]+\s*[-–—\/to]+\s*[0-9.]+|[0-9.]+)/i);m&&(d.chest=S(m[1])),h&&(d.waist=S(h[1])),p&&(d.hip=S(p[1])),(d.chest||d.waist||d.hip)&&r.push(C(d,o))}if(r.length>=2)return{sizes:r,unit:"cm",chartType:a,source:"html",confidence:.65}}return null}function ht(s=document){var e,i,n,o;const t=Array.from(s.querySelectorAll('script[type="application/ld+json"]'));for(const a of t)try{const r=JSON.parse(a.textContent),l=Array.isArray(r)?r.find(g=>g["@type"]==="Product"):r;if(!l)continue;const c=l.sizeChart||((n=(i=(e=l.additionalProperty)==null?void 0:e.find)==null?void 0:i.call(e,g=>/size/i.test(g.name)))==null?void 0:n.value);if(((o=c==null?void 0:c.sizes)==null?void 0:o.length)>=2)return{sizes:c.sizes,unit:c.unit||"cm",chartType:c.chartType||"body",source:"html",confidence:.9}}catch(r){}return null}const ut=/size[\s_-]?chart|sizing|measurement|fit[\s_-]?guide/i;function pt(s=document){return Array.from(s.images).filter(t=>{var a,r;if(!t.complete||t.naturalWidth<100)return!1;const e=t.alt||"",i=t.src||"",n=t.title||"",o=((r=(a=t.closest("figure, div, section"))==null?void 0:a.textContent)==null?void 0:r.slice(0,200))||"";return ut.test(e+i+n+o)})}function yt(s){return new Promise((t,e)=>{if(document.querySelector(`script[src="${s}"]`)){t();return}const i=document.createElement("script");i.src=s,i.onload=t,i.onerror=()=>e(new Error(`Failed to load ${s}`)),document.head.appendChild(i)})}async function ft(){return window.Tesseract||await yt("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"),window.Tesseract}function mt(s){const t=s.split(`
`).map(r=>r.trim()).filter(Boolean);let e=-1,i=[];for(let r=0;r<t.length;r++){const l=t[r].toLowerCase();if(/size|bust|chest/.test(l)&&/waist|hip/.test(l)){e=r,i=t[r].split(/\s{2,}|\t/).map(c=>F(c.trim())).filter(Boolean);break}}if(e<0||!i.includes("label"))return null;const n=k(t.slice(0,e+1).join(" ")),o=L(t.slice(0,e+3).join(" ")),a=[];for(let r=e+1;r<t.length;r++){const l=t[r].split(/\s{2,}|\t/);if(l.length<2)continue;const c={};l.forEach((g,u)=>{const d=i[u];if(d)if(d==="label")B(g.trim())&&(c.label=E(g.trim()));else{const m=S(g.trim());m&&(c[d]=m)}}),c.label&&(c.chest||c.waist||c.hip)&&a.push(C(c,n))}return a.length>=2?{sizes:a,unit:"cm",chartType:o,source:"ocr",confidence:.6}:null}async function bt(s=document){const t=pt(s);if(!t.length)return null;let e;try{e=await ft()}catch(i){return null}for(const i of t.slice(0,3))try{const{data:{text:n}}=await e.recognize(i.src,"eng",{logger:()=>{}}),o=mt(n);if(o)return o}catch(n){}return null}async function vt(s=document){try{return dt(s)||gt(s)||ht(s)||await bt(s)||null}catch(t){return console.warn("[GetYourSize] Page scan error:",t),null}}(async function(){try{const t=document.currentScript,e=window.GetYourSizeConfig||{},i=e.gender||(t==null?void 0:t.dataset.gender)||"women",n=e.garmentType||(t==null?void 0:t.dataset.category)||"tops",o=e.sizeChart?Promise.resolve(e.sizeChart):vt(),a=new at;a.onResult(r=>{document.dispatchEvent(new CustomEvent("getyoursize:result",{detail:r}))}),nt(async()=>{const r=await o.catch(()=>null);a.setSizeChart(r),a.open()})}catch(t){console.warn("[GetYourSize] Failed to initialise:",t)}})();const wt="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.21.0/dist/tf.min.js",xt="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js",O=.25,U=[5,6,11,12,15,16],_t=[5,6,11,12];let M=null,I=null;function G(s){return new Promise((t,e)=>{if(document.querySelector(`script[src="${s}"]`)){t();return}const i=document.createElement("script");i.src=s,i.async=!0,i.onload=t,i.onerror=()=>e(new Error(`Failed to load ${s}`)),document.head.appendChild(i)})}async function St(s){return M||I||(I=(async()=>(s==null||s("Downloading AI model (one-time, ~5 MB)…"),await G(wt),await G(xt),s==null||s("Initialising GPU backend…"),await window.tf.ready(),s==null||s("Loading pose-detection model…"),M=await window.poseDetection.createDetector(window.poseDetection.SupportedModels.MoveNet,{modelType:window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,enableSmoothing:!1,minPoseScore:.2}),M))(),I)}function zt(s,t=U){return s!=null&&s.keypoints?t.every(e=>{var n;const i=s.keypoints[e];return i&&((n=i.score)!=null?n:1)>=O}):!1}function N(s,t=!1){if(!(s!=null&&s.keypoints))return"No person detected. Make sure you are fully visible.";const i=(t?_t:U).filter(a=>{var l;const r=s.keypoints[a];return!r||((l=r.score)!=null?l:1)<O});if(i.length===0)return null;const n={5:"left shoulder",6:"right shoulder",11:"left hip",12:"right hip",15:"left ankle",16:"right ankle"};return`Body partially cut off (${i.map(a=>n[a]||`keypoint ${a}`).join(", ")} not visible). Please step back and retake.`}async function Et(s,{isSide:t=!1,onProgress:e}={}){const i=await St(e);e==null||e("Detecting body pose…");const n=await i.estimatePoses(s,{flipHorizontal:!1});if(!(n!=null&&n.length))throw new Error("No person detected. Please retake the photo with your full body visible.");const o=n[0],a=N(o,t);if(a)throw new Error(a);return o}const kt=Object.freeze(Object.defineProperty({__proto__:null,detectPose:Et,isPoseUsable:zt,poseRejectionReason:N},Symbol.toStringTag,{value:"Module"})),b={leftShoulder:5,rightShoulder:6,leftHip:11,rightHip:12,leftKnee:13,rightKnee:14,leftAnkle:15,rightAnkle:16};function v(s,t){var i;const e=s.keypoints[t];return{x:e.x,y:e.y,score:(i=e.score)!=null?i:1}}function A(s,t){return Math.sqrt((s.x-t.x)**2+(s.y-t.y)**2)}function X(s,t){const e=s/2,i=t/2,[n,o]=e>=i?[e,i]:[i,e],a=((n-o)/(n+o))**2;return Math.PI*(n+o)*(1+3*a/(10+Math.sqrt(4-3*a)))}function Y(s,t){const e=v(s,b.leftShoulder),i=v(s,b.rightShoulder),n=v(s,b.leftAnkle),o=v(s,b.rightAnkle),a=v(s,b.leftKnee),r=v(s,b.rightKnee),l=(e.y+i.y)/2;let c;if(n.score>.25&&o.score>.25){const d=(n.y+o.y)/2;c=Math.abs(d-l)}else{const d=(a.y+r.y)/2;c=Math.abs(d-l)/.56*.86}return c/(t*.86)}function Lt(s,t){const e=Y(s,t),i=v(s,b.leftShoulder),n=v(s,b.rightShoulder),o=v(s,b.leftHip),a=v(s,b.rightHip),r=A(i,n),l=A(o,a),c=r/e*.85,g=l/e*.9,u=c*.78;return{chestDepthCm:c,waistDepthCm:u,hipDepthCm:g}}function Ct(s,t){const e=[5,6,11,12,15,16].map(r=>{var l,c;return(c=(l=s.keypoints[r])==null?void 0:l.score)!=null?c:0}),i=e.reduce((r,l)=>r+l,0)/e.length;if(!t)return i>.7?"medium":"low";const n=[5,6,11,12].map(r=>{var l,c;return(c=(l=t.keypoints[r])==null?void 0:l.score)!=null?c:0}),o=n.reduce((r,l)=>r+l,0)/n.length,a=i*.6+o*.4;return a>.75?"high":a>.55?"medium":"low"}function Mt(s,t,e){const i=Y(s,e),n=v(s,b.leftShoulder),o=v(s,b.rightShoulder),a=v(s,b.leftHip),r=v(s,b.rightHip),l=A(n,o)/i,c=A(a,r)/i,g=(l*.52+c*.48)*.96,u=(n.y+o.y)/2,d=(a.y+r.y)/2,m=Math.abs(d-u)/i;let h,p,_;if(t){const z=Lt(t,e);h=z.chestDepthCm,p=z.waistDepthCm,_=z.hipDepthCm}else h=l*.58,p=g*.72,_=c*.62;const y=l*.97,x=X(y,h),f=X(g,p),P=X(c,_);return{chest:Math.round(x),waist:Math.round(f),hip:Math.round(P),shoulder:Math.round(l),torsoLength:Math.round(m),confidence:Ct(s,t)}}const It=Object.freeze(Object.defineProperty({__proto__:null,toMeasurements:Mt},Symbol.toStringTag,{value:"Module"})),W=[{size:"XS",chest:[72,78],waist:[56,62],hip:[78,84]},{size:"S",chest:[78,84],waist:[62,68],hip:[84,90]},{size:"M",chest:[84,90],waist:[68,74],hip:[90,96]},{size:"L",chest:[90,96],waist:[74,80],hip:[96,102]},{size:"XL",chest:[96,102],waist:[80,86],hip:[102,108]},{size:"XXL",chest:[102,109],waist:[86,93],hip:[108,115]}],At=[{size:"XS",chest:[78,84],waist:[62,68],hip:[80,86]},{size:"S",chest:[84,90],waist:[68,74],hip:[86,92]},{size:"M",chest:[90,96],waist:[74,80],hip:[92,98]},{size:"L",chest:[96,102],waist:[80,86],hip:[98,104]},{size:"XL",chest:[102,108],waist:[86,92],hip:[104,110]},{size:"XXL",chest:[108,115],waist:[92,99],hip:[110,117]}],K={tops:{chest:6,waist:4,hip:4},kurta:{chest:8,waist:6,hip:6},bottoms:{chest:0,waist:3,hip:4},dress:{chest:6,waist:4,hip:6}};function w(s){return(s[0]+s[1])/2}function q(s,t,e={chest:.45,waist:.35,hip:.2}){return e.chest*Math.abs(s.chest-w(t.chest))+e.waist*Math.abs(s.waist-w(t.waist))+e.hip*Math.abs(s.hip-w(t.hip))}function Tt(s,t,e){return t.reduce((i,n)=>{const o=q(s,n,e);return o<i.score?{entry:n,score:o}:i},{entry:null,score:1/0}).entry}function R(s,t){return s>=t[0]&&s<=t[1]}function Bt(s,t){const e=[],i=s.chest-w(t.chest),n=s.waist-w(t.waist),o=s.hip-w(t.hip);if(Math.abs(i)>2.5&&e.push(i>0?"snug at the chest":"roomy at the chest"),Math.abs(n)>2.5&&e.push(n>0?"fitted at the waist":"loose at the waist"),Math.abs(o)>2.5&&e.push(o>0?"snug at the hips":"comfortable at the hips"),e.length===0)return"Great fit across chest, waist and hips.";const a=e.slice(0,2).join(" and ");return a.charAt(0).toUpperCase()+a.slice(1)+"."}function Xt(s,t){const e=(Math.abs(s.chest-w(t.chest))+Math.abs(s.waist-w(t.waist))+Math.abs(s.hip-w(t.hip)))/3;return e<2?"high":e<5?"medium":"low"}function qt(s,t,e){return t.filter(i=>i.size!==e&&(R(s.chest,i.chest)||R(s.waist,i.waist)||R(s.hip,i.hip))).map(i=>i.size).slice(0,2)}function Q(s,t="women",e=null,i="tops",n="body"){const o=e||(t==="men"?At:W);let a=s;if(n==="garment"){const h=K[i]||K.tops;a={chest:s.chest+h.chest,waist:s.waist+h.waist,hip:s.hip+h.hip}}const r=i==="bottoms"?{chest:.15,waist:.45,hip:.4}:{chest:.5,waist:.3,hip:.2},l=Tt(a,o,r),c=qt(a,o,l.size),g=[...o].sort((h,p)=>w(h.chest)-w(p.chest)),u=g.findIndex(h=>h.size===l.size),d=g[u+1];return{size:d&&q(a,d,r)-q(a,l,r)<1.5?d.size:l.size,note:Bt(a,l),confidence:Xt(a,l),alternatives:c,measurements:{chest:Math.round(a.chest),waist:Math.round(a.waist),hip:Math.round(a.hip)},chartSource:e?"page":"default"}}function Rt({heightCm:s,weightKg:t,usualSize:e}){const i=s,n=t;if(!n||n<30){const u=W,d=u.find(m=>m.size===e)||u[2];return{size:d.size,note:"Based on your usual size. Try our photo analysis for a more precise fit.",confidence:"low",alternatives:[],measurements:{chest:Math.round(w(d.chest)),waist:Math.round(w(d.waist)),hip:Math.round(w(d.hip))},chartSource:"default"}}const o=n/(i/100)**2,a=.38*i+(o-20)*1.1,r=.27*i+(o-20)*1.4,l=.42*i+(o-20)*.9,g=Q({chest:a,waist:r,hip:l},"women",null,"tops","body");return{...g,note:g.note+" (Estimated from height and weight — retake with photos for best accuracy.)",confidence:g.confidence==="high"?"medium":"low"}}const J=Object.freeze(Object.defineProperty({__proto__:null,quizRecommend:Rt,recommend:Q},Symbol.toStringTag,{value:"Module"})),j="gys_profile";function jt(s){try{localStorage.setItem(j,JSON.stringify({measurements:s,savedAt:Date.now()}))}catch(t){}}function Pt(){try{const s=localStorage.getItem(j);return s?JSON.parse(s):null}catch(s){return null}}function Ht(){try{localStorage.removeItem(j)}catch(s){}}const Dt=Object.freeze(Object.defineProperty({__proto__:null,deleteProfile:Ht,loadProfile:Pt,saveProfile:jt},Symbol.toStringTag,{value:"Module"}))})();
//# sourceMappingURL=getyoursize.js.map
