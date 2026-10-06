/**
 * Capture modal — lives entirely inside a Shadow DOM so the host
 * page's CSS can never break it.
 *
 * Step flow:
 *   welcome → height → front-photo → side-photo → processing → result
 *   welcome → quiz (fallback path)
 */
import { CSS } from './styles.js';

const PHOTO_STEPS = 4; // welcome, height, front, side

export class Modal {
  constructor() {
    this._host   = null;   // the DOM element whose shadow we own
    this._shadow = null;
    this._step   = null;   // current step id
    this._data   = {       // accumulated across the flow
      heightCm:    null,
      frontPhoto:  null,   // ImageData – cleared after analysis
      sidePhoto:   null,
      measurements: null,
      result:      null,
    };
    this._sizeChart    = null;  // injected before open()
    this._onResult     = null;  // callback(result)
    this._streams      = [];    // active MediaStream refs to stop on close
  }

  /** @param {object} sizeChart  normalised chart from page-scanner */
  setSizeChart(sizeChart) { this._sizeChart = sizeChart; }

  /** @param {function} cb  called with the final recommendation object */
  onResult(cb) { this._onResult = cb; }

  open() {
    if (!this._shadow) this._build();
    this._host.style.display = '';
    this._goTo('welcome');
  }

  close() {
    this._stopStreams();
    if (this._host) this._host.style.display = 'none';
  }

  // ── Private ────────────────────────────────────────────────────────────

  _build() {
    this._host = document.createElement('div');
    this._host.id = 'gys-host';
    document.body.appendChild(this._host);

    this._shadow = this._host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = CSS;
    this._shadow.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'gys-overlay';
    overlay.innerHTML = this._html();
    this._shadow.appendChild(overlay);

    this._wire();
  }

  _html() {
    return `
      <div id="gys-modal" role="dialog" aria-modal="true" aria-label="Get Your Size">

        <!-- Header -->
        <div class="gys-header">
          <span class="gys-logo">✦ GetYourSize</span>
          <button class="gys-close" aria-label="Close">✕</button>
        </div>

        <!-- Progress dots (only for main photo flow) -->
        <div class="gys-dots" id="gys-dots">
          ${[1,2,3,4].map(i => `<div class="gys-dot" data-n="${i}"></div>`).join('')}
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
    `;
  }

  // ── Wiring ──────────────────────────────────────────────────────────────

  _wire() {
    const s = this._shadow;

    // Close
    s.querySelector('.gys-close').addEventListener('click', () => this.close());
    s.querySelector('#gys-overlay').addEventListener('click', e => {
      if (e.target.id === 'gys-overlay') this.close();
    });

    // Welcome → height
    s.querySelector('#gys-start').addEventListener('click', () => this._goTo('height'));
    s.querySelector('#gys-to-quiz').addEventListener('click', () => this._goTo('quiz'));

    // Height: unit toggle
    s.querySelectorAll('.gys-unit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        s.querySelectorAll('.gys-unit-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const unit = btn.dataset.unit;
        s.getElementById('gys-cm-row').style.display   = unit === 'cm'   ? '' : 'none';
        s.getElementById('gys-ftin-row').style.display = unit === 'ftin' ? '' : 'none';
        this._validateHeight();
      });
    });

    // Height: enable Continue when valid
    s.getElementById('gys-h-cm').addEventListener('input', () => this._validateHeight());
    s.getElementById('gys-h-ft').addEventListener('input', () => this._validateHeight());
    s.getElementById('gys-h-in').addEventListener('input', () => this._validateHeight());

    s.getElementById('gys-height-next').addEventListener('click', () => {
      this._saveHeight();
      this._goTo('front');
    });

    // Front photo
    s.getElementById('gys-cap-front').addEventListener('click',  () => this._capture('front'));
    s.getElementById('gys-upl-front').addEventListener('change', e => this._uploadFile(e, 'front'));

    // Side photo
    s.getElementById('gys-cap-side').addEventListener('click',  () => this._capture('side'));
    s.getElementById('gys-upl-side').addEventListener('change', e => this._uploadFile(e, 'side'));

    // Quiz submit
    s.getElementById('gys-quiz-go').addEventListener('click',   () => this._runQuiz());
    s.getElementById('gys-quiz-back').addEventListener('click', () => this._goTo('welcome'));
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  _goTo(step) {
    this._step = step;
    const s = this._shadow;

    // Hide all steps
    s.querySelectorAll('.gys-step').forEach(el => el.classList.remove('visible'));

    // Show target
    const el = s.getElementById(`gys-s-${step}`);
    if (el) el.classList.add('visible');

    // Update dots (only for main photo flow)
    const dotMap = { height: 1, front: 2, side: 3, processing: 4, result: 4 };
    const dots = s.querySelectorAll('.gys-dot');
    const current = dotMap[step];
    s.getElementById('gys-dots').style.display =
      (step === 'welcome' || step === 'quiz') ? 'none' : '';

    dots.forEach((dot, i) => {
      dot.classList.toggle('done',   current != null && i + 1 < current);
      dot.classList.toggle('active', current != null && i + 1 === current);
    });

    // Stop any running camera stream when leaving a photo step
    if (step !== 'front' && step !== 'side') this._stopStreams();

    // Auto-start camera when entering a photo step
    if (step === 'front') this._startCamera('front');
    if (step === 'side')  this._startCamera('side');

    // Show chart status on welcome
    if (step === 'welcome') this._renderChartStatus();
  }

  // ── Chart status pill ───────────────────────────────────────────────────

  _renderChartStatus() {
    const el = this._shadow.getElementById('gys-chart-status');
    if (!el) return;
    const chart = this._sizeChart;
    if (!chart) {
      el.innerHTML = `<div class="gys-chart-pill missing">⚠ No size chart found — using default chart</div>`;
    } else if (chart.source === 'ocr') {
      el.innerHTML = `<div class="gys-chart-pill ocr">🔍 Size chart read from image on this page</div>`;
    } else {
      el.innerHTML = `<div class="gys-chart-pill found">✓ Size chart found on this page</div>`;
    }
  }

  // ── Height helpers ───────────────────────────────────────────────────────

  _validateHeight() {
    const s      = this._shadow;
    const isft   = s.querySelector('.gys-unit-btn.active')?.dataset.unit === 'ftin';
    let valid    = false;

    if (isft) {
      const ft = parseFloat(s.getElementById('gys-h-ft').value);
      const inches = parseFloat(s.getElementById('gys-h-in').value || '0');
      valid = ft >= 3 && ft <= 7 && inches >= 0 && inches <= 11;
    } else {
      const cm = parseFloat(s.getElementById('gys-h-cm').value);
      valid = cm >= 120 && cm <= 220;
    }

    s.getElementById('gys-height-next').disabled = !valid;
  }

  _saveHeight() {
    const s    = this._shadow;
    const isft = s.querySelector('.gys-unit-btn.active')?.dataset.unit === 'ftin';
    if (isft) {
      const ft  = parseFloat(s.getElementById('gys-h-ft').value);
      const ins = parseFloat(s.getElementById('gys-h-in').value || '0');
      this._data.heightCm = Math.round((ft * 12 + ins) * 2.54);
    } else {
      this._data.heightCm = parseFloat(s.getElementById('gys-h-cm').value);
    }
  }

  // ── Camera ───────────────────────────────────────────────────────────────

  async _startCamera(side) {
    const video = this._shadow.getElementById(`gys-vid-${side}`);
    if (!video) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      this._streams.push(stream);
      video.srcObject = stream;
    } catch (err) {
      this._showError(side, 'Camera access denied. Please upload a photo instead.');
      this._shadow.getElementById(`gys-cap-${side}`).style.display = 'none';
    }
  }

  _stopStreams() {
    this._streams.forEach(s => s.getTracks().forEach(t => t.stop()));
    this._streams = [];
  }

  // ── Photo capture ─────────────────────────────────────────────────────────

  _capture(side) {
    const s      = this._shadow;
    const video  = s.getElementById(`gys-vid-${side}`);
    const canvas = s.getElementById(`gys-can-${side}`);

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    // Mirror correction (video is CSS-mirrored)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    this._savePhoto(side, canvas);
  }

  _uploadFile(event, side) {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = this._shadow.getElementById(`gys-can-${side}`);
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      this._savePhoto(side, canvas);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  }

  _savePhoto(side, canvas) {
    // Store as dataURL for preview (ImageData handed to engine later)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    this._data[`${side}Photo`] = { canvas, dataUrl };

    // Show preview, hide live video
    const preview = this._shadow.getElementById(`gys-prev-${side}`);
    const imgEl   = this._shadow.getElementById(`gys-img-${side}`);
    imgEl.src = dataUrl;
    preview.style.display = '';

    // Stop stream, update button
    this._stopStreams();
    const capBtn = this._shadow.getElementById(`gys-cap-${side}`);
    capBtn.textContent = '🔄 Retake';

    // Auto-advance after a short moment
    setTimeout(() => {
      if (side === 'front') {
        this._goTo('side');
      } else {
        this._runAnalysis();
      }
    }, 700);
  }

  _showError(side, msg) {
    const el = this._shadow.getElementById(`gys-err-${side}`);
    if (el) el.innerHTML = `<div class="gys-error">${msg}</div>`;
  }

  // ── Analysis ──────────────────────────────────────────────────────────────

  async _runAnalysis() {
    this._goTo('processing');

    try {
      const { detectPose }     = await import('../core/pose-detector.js');
      const { toMeasurements } = await import('../core/measurement.js');
      const { recommend }      = await import('../core/size-matcher.js');

      const onProgress = msg => this._setProcessingMsg(msg);

      // Detect front pose (model downloads here on first use)
      const frontPose = await detectPose(
        this._data.frontPhoto.canvas,
        { isSide: false, onProgress }
      );

      this._setProcessingMsg('Detecting side pose…');
      const sidePose = await detectPose(
        this._data.sidePhoto.canvas,
        { isSide: true, onProgress: () => {} }
      );

      this._setProcessingMsg('Calculating your measurements…');
      const measurements = toMeasurements(frontPose, sidePose, this._data.heightCm);

      this._setProcessingMsg('Finding your size…');
      const chart  = this._sizeChart;
      const result = recommend(
        measurements,
        'women',
        chart?.sizes   || null,
        'tops',
        chart?.chartType || 'body'
      );

      this._data.measurements = measurements;
      this._data.result       = result;

      // Privacy: discard pixel data immediately after analysis
      this._data.frontPhoto = null;
      this._data.sidePhoto  = null;

      // Save measurements to profile
      import('../core/profile.js').then(({ saveProfile }) =>
        saveProfile(measurements)
      ).catch(() => {});

      this._showResult(result, measurements);
      if (this._onResult) this._onResult(result);

    } catch (err) {
      console.error('[GetYourSize]', err);
      this._showResultError(err.message);
    }
  }

  _setProcessingMsg(msg) {
    const el = this._shadow.getElementById('gys-proc-msg');
    if (el) el.textContent = msg;
  }

  // ── Result rendering ──────────────────────────────────────────────────────

  _showResult(result, measurements) {
    const confClass = result.confidence;
    const html = `
      <h2 class="gys-title" style="margin-bottom:16px">Your recommended size</h2>
      <div class="gys-result-card">
        <div class="gys-result-size">${result.size}</div>
        <div class="gys-result-lbl">Recommended size</div>
        <div class="gys-confidence ${confClass}">
          ${confClass === 'high' ? '✓ High confidence' : confClass === 'medium' ? '~ Medium confidence' : '⚠ Low confidence'}
        </div>
        <div class="gys-result-note">${result.note}</div>
      </div>
      <div class="gys-meas-row">
        <div class="gys-meas-item">
          <div class="gys-meas-val">${measurements.chest} cm</div>
          <div class="gys-meas-lbl">Chest</div>
        </div>
        <div class="gys-meas-item">
          <div class="gys-meas-val">${measurements.waist} cm</div>
          <div class="gys-meas-lbl">Waist</div>
        </div>
        <div class="gys-meas-item">
          <div class="gys-meas-val">${measurements.hip} cm</div>
          <div class="gys-meas-lbl">Hip</div>
        </div>
      </div>
      ${result.alternatives?.length ? `
        <p style="font-size:13px;color:var(--gys-subtle);margin-bottom:8px">
          Also fits: ${result.alternatives.join(', ')}
        </p>` : ''}
      <button class="gys-btn gys-btn-primary" id="gys-retake">Retake photos</button>
      <span class="gys-wrong-link" id="gys-wrong">This looks wrong</span>
    `;
    const content = this._shadow.getElementById('gys-result-content');
    content.innerHTML = html;
    this._goTo('result');

    this._shadow.getElementById('gys-retake')?.addEventListener('click', () => {
      this._data.frontPhoto = null;
      this._data.sidePhoto  = null;
      this._goTo('height');
    });
  }

  _showResultError(message = '') {
    const hint = message || 'Could not analyse your photos.';
    const content = this._shadow.getElementById('gys-result-content');
    content.innerHTML = `
      <h2 class="gys-title" style="margin-bottom:12px">Something went wrong</h2>
      <div class="gys-error">${hint}<br><br>Tips: stand 2 m back, full body in frame, bright even lighting.</div>
      <button class="gys-btn gys-btn-primary" id="gys-err-retry">Retake photos</button>
      <button class="gys-btn gys-btn-secondary" id="gys-err-quiz">Use quiz instead</button>
    `;
    this._goTo('result');
    this._shadow.getElementById('gys-err-retry')?.addEventListener('click', () => this._goTo('height'));
    this._shadow.getElementById('gys-err-quiz')?.addEventListener('click',  () => this._goTo('quiz'));
  }

  // ── Quiz fallback ─────────────────────────────────────────────────────────

  _runQuiz() {
    const s       = this._shadow;
    const height  = parseFloat(s.getElementById('gys-q-height').value);
    const weight  = parseFloat(s.getElementById('gys-q-weight').value  || '0');
    const usual   = s.getElementById('gys-q-usual').value;

    if (!height || height < 120 || height > 220) {
      s.getElementById('gys-s-quiz').querySelector('.gys-sub').insertAdjacentHTML(
        'afterend', '<div class="gys-error">Please enter a valid height (120–220 cm).</div>'
      );
      return;
    }

    import('../core/size-matcher.js').then(({ quizRecommend }) => {
      const result = quizRecommend({ heightCm: height, weightKg: weight, usualSize: usual });
      this._data.result = result;
      this._showResult(result, result.measurements || { chest: '—', waist: '—', hip: '—' });
      if (this._onResult) this._onResult(result);
    });
  }
}
