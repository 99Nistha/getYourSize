/**
 * Tests for page-scanner pure utility functions.
 * Covers: parseRange, detectUnit, detectChartType,
 *         normalizeFieldName, isSizeLabel, parseHTMLTables, parseDLAndText.
 */

import { test, assert } from './test-utils.js';
import {
  parseRange,
  detectUnit,
  detectChartType,
  normalizeFieldName,
  isSizeLabel,
  normaliseSizeLabel,
  parseHTMLTables,
  parseDLAndText,
} from '../src/core/page-scanner.js';

// ── parseRange ────────────────────────────────────────────────────────────

test('parseRange: en-dash range', () => {
  const r = parseRange('84 – 88');
  assert.deepStrictEqual(r, [84, 88]);
});

test('parseRange: hyphen range', () => {
  const r = parseRange('33-34');
  assert.deepStrictEqual(r, [33, 34]);
});

test('parseRange: em-dash range', () => {
  const r = parseRange('90—96');
  assert.deepStrictEqual(r, [90, 96]);
});

test('parseRange: single value → ±2 range', () => {
  const r = parseRange('86');
  assert.deepStrictEqual(r, [84, 88]);
});

test('parseRange: decimal range', () => {
  const r = parseRange('33.5 – 35.5');
  assert.deepStrictEqual(r, [33.5, 35.5]);
});

test('parseRange: null for empty string', () => {
  assert.strictEqual(parseRange(''), null);
});

test('parseRange: handles "to" separator', () => {
  const r = parseRange('84 to 88');
  assert.deepStrictEqual(r, [84, 88]);
});

// ── detectUnit ────────────────────────────────────────────────────────────

test('detectUnit: explicit cm', () => {
  assert.strictEqual(detectUnit('Chest 84–88 cm, Waist 68–72 cm'), 'cm');
});

test('detectUnit: explicit inches keyword', () => {
  assert.strictEqual(detectUnit('All measurements in inches'), 'in');
});

test('detectUnit: inch abbreviation " in"', () => {
  assert.strictEqual(detectUnit('Chest 33 in, Waist 27 in'), 'in');
});

test('detectUnit: infer from small values → inches', () => {
  assert.strictEqual(detectUnit('33 34 35 27 28 37 38'), 'in');
});

test('detectUnit: infer from large values → cm', () => {
  assert.strictEqual(detectUnit('84 86 88 68 70 72 90 92 94'), 'cm');
});

test('detectUnit: defaults to cm when ambiguous', () => {
  assert.strictEqual(detectUnit(''), 'cm');
});

// ── detectChartType ───────────────────────────────────────────────────────

test('detectChartType: "to fit" → body', () => {
  assert.strictEqual(detectChartType('To fit chest measurement'), 'body');
});

test('detectChartType: "body" keyword → body', () => {
  assert.strictEqual(detectChartType('Body measurements in cm'), 'body');
});

test('detectChartType: "garment" keyword → garment', () => {
  assert.strictEqual(detectChartType('Garment measurements'), 'garment');
});

test('detectChartType: "finished" keyword → garment', () => {
  assert.strictEqual(detectChartType('Finished length 42 inches'), 'garment');
});

test('detectChartType: defaults to body', () => {
  assert.strictEqual(detectChartType('S M L XL'), 'body');
});

// ── normalizeFieldName ────────────────────────────────────────────────────

test('normalizeFieldName: "Bust / Chest" → chest', () => {
  assert.strictEqual(normalizeFieldName('Bust / Chest'), 'chest');
});

test('normalizeFieldName: "TO FIT CHEST (in)" → chest', () => {
  assert.strictEqual(normalizeFieldName('TO FIT CHEST (in)'), 'chest');
});

test('normalizeFieldName: "Hips" → hip', () => {
  assert.strictEqual(normalizeFieldName('Hips'), 'hip');
});

test('normalizeFieldName: "Size" → label', () => {
  assert.strictEqual(normalizeFieldName('Size'), 'label');
});

test('normalizeFieldName: unknown field → null', () => {
  assert.strictEqual(normalizeFieldName('SKU'), null);
});

test('normalizeFieldName: "Garment Length" → length', () => {
  assert.strictEqual(normalizeFieldName('Garment Length'), 'length');
});

// ── isSizeLabel ───────────────────────────────────────────────────────────

test('isSizeLabel: M', () => assert.ok(isSizeLabel('M')));
test('isSizeLabel: XL', () => assert.ok(isSizeLabel('XL')));
test('isSizeLabel: XXL', () => assert.ok(isSizeLabel('XXL')));
test('isSizeLabel: numeric 38', () => assert.ok(isSizeLabel('38')));
test('isSizeLabel: rejects "Color"', () => assert.ok(!isSizeLabel('Color')));
test('isSizeLabel: rejects empty', () => assert.ok(!isSizeLabel('')));
test('isSizeLabel: case-insensitive "medium"', () => assert.ok(isSizeLabel('medium')));

// ── normaliseSizeLabel ────────────────────────────────────────────────────

test('normaliseSizeLabel: "x-large" → XL', () => {
  assert.strictEqual(normaliseSizeLabel('x-large'), 'XL');
});
test('normaliseSizeLabel: "small" → S', () => {
  assert.strictEqual(normaliseSizeLabel('small'), 'S');
});
test('normaliseSizeLabel: "M" → M', () => {
  assert.strictEqual(normaliseSizeLabel('M'), 'M');
});

// ── parseHTMLTables (DOM-based — requires globalThis.document) ────────────
// These tests run only if we have a DOM (browser or jsdom).
// In plain Node they are skipped.

if (typeof document !== 'undefined') {
  test('parseHTMLTables: parses cm table correctly', () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <table>
        <thead><tr><th>Size</th><th>Bust/Chest</th><th>Waist</th><th>Hip</th></tr></thead>
        <tbody>
          <tr><td>S</td><td>78–84</td><td>62–68</td><td>84–90</td></tr>
          <tr><td>M</td><td>84–90</td><td>68–74</td><td>90–96</td></tr>
          <tr><td>L</td><td>90–96</td><td>74–80</td><td>96–102</td></tr>
        </tbody>
      </table>
    `;
    document.body.appendChild(div);
    const result = parseHTMLTables(document);
    document.body.removeChild(div);
    assert.ok(result, 'Should find chart');
    assert.strictEqual(result.unit, 'cm');
    assert.ok(result.sizes.length >= 3);
    assert.ok(result.sizes.find(s => s.label === 'M'));
  });

  test('parseHTMLTables: converts inches to cm', () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <p>All measurements in inches</p>
      <table>
        <thead><tr><th>Size</th><th>Chest</th><th>Waist</th></tr></thead>
        <tbody>
          <tr><td>S</td><td>33–34</td><td>27–28</td></tr>
          <tr><td>M</td><td>35–36</td><td>29–30</td></tr>
          <tr><td>L</td><td>37–38</td><td>31–32</td></tr>
        </tbody>
      </table>
    `;
    document.body.appendChild(div);
    const result = parseHTMLTables(document);
    document.body.removeChild(div);
    assert.ok(result);
    assert.strictEqual(result.unit, 'cm');
    const m = result.sizes.find(s => s.label === 'M');
    // 35 inches × 2.54 ≈ 88.9 cm → should be in [86, 92] range
    assert.ok(m.chest[0] > 80 && m.chest[1] < 100, `M chest range unexpected: ${m.chest}`);
  });

  test('parseDLAndText: parses definition list with Bust/Waist/Hips', () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <dl>
        <dt>S</dt><dd>Bust 33–34 · Waist 27–28 · Hips 35–36</dd>
        <dt>M</dt><dd>Bust 35–36 · Waist 29–30 · Hips 37–38</dd>
        <dt>L</dt><dd>Bust 37–38 · Waist 31–32 · Hips 39–40</dd>
      </dl>
    `;
    document.body.appendChild(div);
    const result = parseDLAndText(document);
    document.body.removeChild(div);
    assert.ok(result, 'Should find chart from DL');
    assert.ok(result.sizes.length >= 3);
  });
} else {
  console.log('  (DOM tests skipped — run in browser to test parseHTMLTables/parseDLAndText)');
}
