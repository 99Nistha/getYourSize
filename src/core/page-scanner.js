/**
 * Page scanner — finds a size chart on the current product page.
 *
 * Strategies (in order, first confident result wins):
 *   1. HTML <table> elements with measurement headers
 *   2. <dl> elements and inline text patterns
 *   3. JSON-LD structured data
 *   4. OCR on likely size-chart images  (Tesseract.js, loaded lazily)
 *
 * Output:
 *   { sizes, unit: 'cm', chartType: 'body'|'garment', source, confidence }
 *   or null if nothing credible found.
 *
 * All exported helpers are pure functions so they can be tested in Node.js
 * without a DOM.
 */

// ── Field name normalisation ───────────────────────────────────────────────

const FIELD_ALIASES = {
  size: 'label', sizes: 'label',
  bust: 'chest', chest: 'chest', 'bust/chest': 'chest', 'chest/bust': 'chest',
  waist: 'waist',
  hip: 'hip', hips: 'hip', 'hip/seat': 'hip', seat: 'hip',
  shoulder: 'shoulder', shoulders: 'shoulder',
  length: 'length', 'garment length': 'length', 'dress length': 'length',
  'full length': 'length', 'total length': 'length',
};

/** Maps a raw header string to a canonical field name, or null if unknown. */
export function normalizeFieldName(raw) {
  const key = raw
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, '')   // strip "(inches)", "(cm)", etc.
    .replace(/\s*:.*$/g, '')          // strip trailing " : body"
    .replace(/\bto[\s-]fit[\s-]?/g, '') // strip "to fit" / "to-fit" prefix
    .replace(/\s*\/\s*/g, '/')        // normalise " / " → "/"
    .replace(/[^\w\s/]/g, ' ')        // other punctuation → space
    .replace(/\s+/g, ' ')
    .trim();

  return FIELD_ALIASES[key] || null;
}

// ── Size label recognition ─────────────────────────────────────────────────

const SIZE_SET = new Set([
  'XS','S','M','L','XL','XXL','2XL','3XL','XXXL','XXXXL','4XL',
  'XSMALL','SMALL','MEDIUM','LARGE','XLARGE','XXLARGE',
  'X-SMALL','X-LARGE','XX-LARGE',
]);

/** Returns true if text looks like an apparel size label. */
export function isSizeLabel(text) {
  if (!text) return false;
  const t = text.trim().toUpperCase().replace(/[\s-]/g, '');
  if (SIZE_SET.has(t)) return true;
  // Numeric apparel sizes (Indian/EU): 28–60 even numbers
  if (/^\d{2}$/.test(t)) {
    const n = parseInt(t, 10);
    return n >= 28 && n <= 60;
  }
  return false;
}

/** Normalises a raw size label like "x-large" → "XL". */
export function normaliseSizeLabel(raw) {
  const MAP = {
    'XSMALL': 'XS', 'X-SMALL': 'XS',
    'SMALL': 'S',
    'MEDIUM': 'M',
    'LARGE': 'L',
    'XLARGE': 'XL', 'X-LARGE': 'XL',
    'XXLARGE': 'XXL', 'XX-LARGE': 'XXL', '2XL': 'XXL',
    '3XL': 'XXXL',
  };
  const t = raw.trim().toUpperCase().replace(/[\s-]/g, '');
  return MAP[t] || raw.trim().toUpperCase();
}

// ── Measurement parsing ────────────────────────────────────────────────────

/**
 * Parses a measurement string into a [min, max] range in the original unit.
 * Examples:
 *   "84 – 88"  → [84, 88]
 *   "33-34"    → [33, 34]
 *   "86"       → [84, 88]   (±2 for single values)
 *   "33.5"     → [31.5, 35.5]
 */
export function parseRange(str) {
  if (!str && str !== 0) return null;
  const s = String(str).replace(/,/g, '.').trim();

  // Range with separator: dash, en-dash, em-dash, slash, "to"
  const rangeRe = /(\d+(?:\.\d+)?)\s*[-–—\/]|to\s*(\d+(?:\.\d+)?)/gi;
  const m = s.match(/(\d+(?:\.\d+)?)\s*[-–—\/to]+\s*(\d+(?:\.\d+)?)/);
  if (m) {
    const lo = parseFloat(m[1]);
    const hi = parseFloat(m[2]);
    return lo <= hi ? [lo, hi] : [hi, lo];
  }

  // Single value
  const single = s.match(/(\d+(?:\.\d+)?)/);
  if (single) {
    const v = parseFloat(single[1]);
    return [Math.max(0, v - 2), v + 2];
  }

  return null;
}

// ── Unit detection ─────────────────────────────────────────────────────────

/**
 * Infers the measurement unit from surrounding text.
 * Returns 'in' | 'cm'.
 */
export function detectUnit(text = '') {
  const t = text.toLowerCase();

  // Explicit cm
  if (/\bcm\b|\bcentim/.test(t)) return 'cm';

  // Explicit inches
  if (/\binch(es)?\b|\"\s|\bin\b|\bfeet\b|\bft\b/.test(t)) return 'in';

  // Infer from typical value magnitudes
  const nums = [...t.matchAll(/\b(\d{2})\b/g)].map(m => parseInt(m[1], 10));
  const relevant = nums.filter(n => n > 24 && n < 70);
  if (relevant.length >= 3) {
    const avg = relevant.reduce((a, b) => a + b, 0) / relevant.length;
    return avg < 52 ? 'in' : 'cm';
  }

  return 'cm'; // safe default
}

// ── Chart type detection ───────────────────────────────────────────────────

/**
 * Decides whether the chart shows body ('body') or garment ('garment') measurements.
 */
export function detectChartType(text = '') {
  const t = text.toLowerCase();
  if (/\bto[ -]fit\b|\bbody\b|\bbody size\b|\bwear\b/.test(t)) return 'body';
  if (/\bgarment\b|\bfinished\b|\bactual\b|\bclothing\b/.test(t)) return 'garment';
  return 'body'; // most Indian brand charts are body measurements
}

// ── Unit conversion ────────────────────────────────────────────────────────

function inToCm(range) {
  return range.map(v => Math.round(v * 2.54 * 2) / 2); // round to 0.5 cm
}

function normaliseRanges(entry, unit) {
  if (unit !== 'in') return entry;
  const out = { label: entry.label };
  for (const [k, v] of Object.entries(entry)) {
    if (k === 'label') continue;
    out[k] = Array.isArray(v) ? inToCm(v) : v;
  }
  return out;
}

// ── Strategy 1: HTML tables ────────────────────────────────────────────────

export function parseHTMLTables(doc = document) {
  const tables = Array.from(doc.querySelectorAll('table'));

  for (const table of tables) {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length < 3) continue; // need header + at least 2 sizes

    // Find the header row (prefer <thead>, fall back to first <tr>)
    let headerCells = null;
    let dataStartIdx = 0;

    const theadRow = table.querySelector('thead tr');
    if (theadRow) {
      const cells = Array.from(theadRow.querySelectorAll('th, td'));
      const joined = cells.map(c => c.textContent).join(' ').toLowerCase();
      if (/size|bust|chest|waist|hip/.test(joined)) {
        headerCells = cells;
        dataStartIdx = 0; // tbody rows are separate
      }
    }

    if (!headerCells) {
      const cells = Array.from(rows[0].querySelectorAll('th, td'));
      const joined = cells.map(c => c.textContent).join(' ').toLowerCase();
      if (/size|bust|chest|waist|hip/.test(joined)) {
        headerCells = cells;
        dataStartIdx = 1;
      }
    }

    if (!headerCells) continue;

    // Map column index → canonical field
    const colMap = {};
    headerCells.forEach((cell, i) => {
      const field = normalizeFieldName(cell.textContent.trim());
      if (field) colMap[i] = field;
    });

    const hasLabel = Object.values(colMap).includes('label');
    const hasMeas  = Object.values(colMap).some(f => ['chest','waist','hip'].includes(f));
    if (!hasLabel || !hasMeas) continue;

    // Infer unit + chart type from table + nearby text
    const context = (
      table.caption?.textContent || '' +
      table.closest('[class*=size],[class*=chart],[class*=sizing]')?.textContent || '' +
      table.textContent
    );
    const unit      = detectUnit(context);
    const chartType = detectChartType(context);

    // Parse data rows
    const dataRows = theadRow
      ? Array.from(table.querySelectorAll('tbody tr'))
      : rows.slice(dataStartIdx);

    const sizes = [];
    for (const row of dataRows) {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length < 2) continue;

      const raw = {};
      cells.forEach((cell, i) => {
        const field = colMap[i];
        if (!field) return;
        const text = cell.textContent.trim();
        if (field === 'label') {
          if (isSizeLabel(text)) raw.label = normaliseSizeLabel(text);
        } else {
          const range = parseRange(text);
          if (range) raw[field] = range;
        }
      });

      if (raw.label && (raw.chest || raw.waist || raw.hip)) {
        sizes.push(normaliseRanges(raw, unit));
      }
    }

    if (sizes.length >= 2) {
      return {
        sizes,
        unit: 'cm',
        chartType,
        source: 'html',
        confidence: Math.min(0.5 + sizes.length * 0.1, 0.97),
      };
    }
  }

  return null;
}

// ── Strategy 2: <dl> elements and inline text ──────────────────────────────

export function parseDLAndText(doc = document) {
  // 2a. <dl> elements
  for (const dl of doc.querySelectorAll('dl')) {
    const dts = Array.from(dl.querySelectorAll('dt'));
    const dds = Array.from(dl.querySelectorAll('dd'));
    if (dts.length < 2) continue;

    const context = dl.closest('section, div, article')?.textContent || dl.textContent;
    const unit      = detectUnit(context);
    const chartType = detectChartType(context);
    const sizes     = [];

    dts.forEach((dt, i) => {
      const label = dt.textContent.trim();
      if (!isSizeLabel(label)) return;

      const dd = dds[i];
      if (!dd) return;

      const text = dd.textContent;
      const entry = { label: normaliseSizeLabel(label) };

      // Patterns: "Bust 35–36", "Chest: 84-88", "Waist 29-30", "Hips 37–38"
      const bust  = text.match(/(?:bust|chest)\s*[:\s]+([0-9.]+\s*[-–—\/to]+\s*[0-9.]+|[0-9.]+)/i);
      const waist = text.match(/(?:waist)\s*[:\s]+([0-9.]+\s*[-–—\/to]+\s*[0-9.]+|[0-9.]+)/i);
      const hip   = text.match(/(?:hip|hips|seat)\s*[:\s]+([0-9.]+\s*[-–—\/to]+\s*[0-9.]+|[0-9.]+)/i);

      if (bust)  entry.chest = parseRange(bust[1]);
      if (waist) entry.waist = parseRange(waist[1]);
      if (hip)   entry.hip   = parseRange(hip[1]);

      if (entry.chest || entry.waist || entry.hip) {
        sizes.push(normaliseRanges(entry, unit));
      }
    });

    if (sizes.length >= 2) {
      return { sizes, unit: 'cm', chartType, source: 'html', confidence: 0.75 };
    }
  }

  // 2b. Inline text patterns: "M: Chest 84–88, Waist 68–72"
  // Walk text nodes inside likely size-guide containers
  const containers = Array.from(
    doc.querySelectorAll('[class*=size],[class*=chart],[class*=sizing],[class*=guide]')
  );

  for (const container of containers) {
    const text = container.textContent;

    // Quick smell test
    if (!/\b(xs|s|m|l|xl|xxl)\b/i.test(text)) continue;
    if (!/\b(bust|chest|waist|hip)/i.test(text)) continue;

    const unit      = detectUnit(text);
    const chartType = detectChartType(text);
    const sizes     = [];

    // Chunk by size label
    const chunks = text.split(/\b(xs|s|m|l|xl|xxl|2xl|xxxl)\b/i);
    for (let i = 1; i < chunks.length; i += 2) {
      const label   = normaliseSizeLabel(chunks[i]);
      const segment = chunks[i + 1] || '';

      const entry  = { label };
      const bust   = segment.match(/(?:bust|chest)\s*[:\s]+([0-9.]+\s*[-–—\/to]+\s*[0-9.]+|[0-9.]+)/i);
      const waist  = segment.match(/(?:waist)\s*[:\s]+([0-9.]+\s*[-–—\/to]+\s*[0-9.]+|[0-9.]+)/i);
      const hip    = segment.match(/(?:hip|hips)\s*[:\s]+([0-9.]+\s*[-–—\/to]+\s*[0-9.]+|[0-9.]+)/i);

      if (bust)  entry.chest = parseRange(bust[1]);
      if (waist) entry.waist = parseRange(waist[1]);
      if (hip)   entry.hip   = parseRange(hip[1]);

      if (entry.chest || entry.waist || entry.hip) {
        sizes.push(normaliseRanges(entry, unit));
      }
    }

    if (sizes.length >= 2) {
      return { sizes, unit: 'cm', chartType, source: 'html', confidence: 0.65 };
    }
  }

  return null;
}

// ── Strategy 3: JSON-LD ────────────────────────────────────────────────────

export function parseJSONLD(doc = document) {
  const scripts = Array.from(
    doc.querySelectorAll('script[type="application/ld+json"]')
  );

  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      const product = Array.isArray(data) ? data.find(d => d['@type'] === 'Product') : data;
      if (!product) continue;

      // Some brands embed a sizeChart property (non-standard but used)
      const chart = product.sizeChart || product.additionalProperty?.find?.(
        p => /size/i.test(p.name)
      )?.value;

      if (chart?.sizes?.length >= 2) {
        return {
          sizes:      chart.sizes,
          unit:       chart.unit || 'cm',
          chartType:  chart.chartType || 'body',
          source:     'html',
          confidence: 0.9,
        };
      }
    } catch (_) {}
  }

  return null;
}

// ── Strategy 4: OCR on size-chart images ──────────────────────────────────

const SIZE_IMAGE_RE = /size[\s_-]?chart|sizing|measurement|fit[\s_-]?guide/i;

function findSizeChartImages(doc = document) {
  return Array.from(doc.images).filter(img => {
    if (!img.complete || img.naturalWidth < 100) return false;
    const alt     = img.alt  || '';
    const src     = img.src  || '';
    const title   = img.title || '';
    const nearby  = img.closest('figure, div, section')?.textContent?.slice(0, 200) || '';
    return SIZE_IMAGE_RE.test(alt + src + title + nearby);
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src     = src;
    s.onload  = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function loadTesseract() {
  if (window.Tesseract) return window.Tesseract;
  await loadScript(
    'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
  );
  return window.Tesseract;
}

/**
 * Attempt to extract a size chart from OCR text.
 * Looks for lines like: "M  84-88  68-72  90-94"
 */
function parseOCRText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Find header line
  let headerLine  = -1;
  let colFields   = [];

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (/size|bust|chest/.test(l) && /waist|hip/.test(l)) {
      headerLine = i;
      // Tokenise header into fields
      colFields = lines[i]
        .split(/\s{2,}|\t/)
        .map(t => normalizeFieldName(t.trim()))
        .filter(Boolean);
      break;
    }
  }

  if (headerLine < 0 || !colFields.includes('label')) return null;

  const unit      = detectUnit(lines.slice(0, headerLine + 1).join(' '));
  const chartType = detectChartType(lines.slice(0, headerLine + 3).join(' '));
  const sizes     = [];

  for (let i = headerLine + 1; i < lines.length; i++) {
    const tokens = lines[i].split(/\s{2,}|\t/);
    if (tokens.length < 2) continue;

    const entry = {};
    tokens.forEach((tok, j) => {
      const field = colFields[j];
      if (!field) return;
      if (field === 'label') {
        if (isSizeLabel(tok.trim())) entry.label = normaliseSizeLabel(tok.trim());
      } else {
        const range = parseRange(tok.trim());
        if (range) entry[field] = range;
      }
    });

    if (entry.label && (entry.chest || entry.waist || entry.hip)) {
      sizes.push(normaliseRanges(entry, unit));
    }
  }

  return sizes.length >= 2
    ? { sizes, unit: 'cm', chartType, source: 'ocr', confidence: 0.60 }
    : null;
}

async function ocrImages(doc = document) {
  const images = findSizeChartImages(doc);
  if (!images.length) return null;

  let Tesseract;
  try {
    Tesseract = await loadTesseract();
  } catch (_) {
    return null; // Tesseract unavailable (no network, blocked)
  }

  for (const img of images.slice(0, 3)) { // cap at 3 images
    try {
      const { data: { text } } = await Tesseract.recognize(img.src, 'eng', {
        logger: () => {},
      });
      const result = parseOCRText(text);
      if (result) return result;
    } catch (_) {}
  }

  return null;
}

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Scans the current page for a size chart.
 * @param {Document} [doc=document]  Pass a custom document for testing.
 * @returns {Promise<object|null>}
 */
export async function scanPage(doc = document) {
  try {
    // Strategies run in priority order
    const result =
      parseHTMLTables(doc)  ||
      parseDLAndText(doc)   ||
      parseJSONLD(doc)      ||
      await ocrImages(doc);

    return result || null;
  } catch (err) {
    console.warn('[GetYourSize] Page scan error:', err);
    return null;
  }
}
