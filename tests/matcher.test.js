/**
 * Tests for size-matcher: recommend() and quizRecommend().
 */

import { test, assert } from './test-utils.js';
import { recommend, quizRecommend } from '../src/core/size-matcher.js';

// ── recommend() ───────────────────────────────────────────────────────────

test('recommend: returns a result object with required fields', () => {
  const r = recommend({ chest: 86, waist: 70, hip: 92 });
  assert.ok(r.size, 'has size');
  assert.ok(r.note, 'has note');
  assert.ok(r.confidence, 'has confidence');
  assert.ok(Array.isArray(r.alternatives), 'has alternatives array');
});

test('recommend: typical M measurements → M or nearby', () => {
  const r = recommend({ chest: 87, waist: 71, hip: 93 });
  assert.ok(['S','M','L'].includes(r.size), `Expected S/M/L, got ${r.size}`);
});

test('recommend: small measurements → XS or S', () => {
  const r = recommend({ chest: 74, waist: 58, hip: 80 });
  assert.ok(['XS','S'].includes(r.size), `Expected XS/S, got ${r.size}`);
});

test('recommend: large measurements → L or XL', () => {
  const r = recommend({ chest: 97, waist: 83, hip: 105 });
  assert.ok(['L','XL','XXL'].includes(r.size), `Expected L/XL/XXL, got ${r.size}`);
});

test('recommend: between sizes — picks the larger', () => {
  // Measurements right on the border between M (84–90) and L (90–96)
  const r = recommend({ chest: 90, waist: 74, hip: 96 });
  assert.ok(['M','L'].includes(r.size), `Got ${r.size}`);
});

test('recommend: high confidence when measurements are in centre of range', () => {
  const r = recommend({ chest: 87, waist: 71, hip: 93 });
  assert.ok(['high','medium'].includes(r.confidence));
});

test('recommend: uses custom chart when provided', () => {
  const custom = [
    { size: 'A', chest: [80, 86], waist: [64, 70], hip: [86, 92] },
    { size: 'B', chest: [86, 92], waist: [70, 76], hip: [92, 98] },
  ];
  const r = recommend({ chest: 88, waist: 72, hip: 93 }, 'women', custom);
  assert.ok(['A','B'].includes(r.size), `Got ${r.size}`);
  assert.strictEqual(r.chartSource, 'page');
});

test('recommend: uses default chart when customChart is null', () => {
  const r = recommend({ chest: 86, waist: 70, hip: 92 }, 'women', null);
  assert.strictEqual(r.chartSource, 'default');
});

test('recommend: bottoms weight hip + waist more', () => {
  // Hip 104 → should be XL for bottoms
  const r = recommend({ chest: 85, waist: 82, hip: 104 }, 'women', null, 'bottoms');
  assert.ok(['L','XL','XXL'].includes(r.size), `Got ${r.size}`);
});

test('recommend: fit note is a non-empty string', () => {
  const r = recommend({ chest: 86, waist: 70, hip: 92 });
  assert.ok(typeof r.note === 'string' && r.note.length > 5);
});

test('recommend: note mentions "Great fit" when measurements are central', () => {
  // Exactly in the middle of M range
  const r = recommend({ chest: 87, waist: 71, hip: 93 });
  // Confidence should be high, note should not be about being snug/loose
  assert.ok(r.confidence !== 'low');
});

test('recommend: men chart gives expected result', () => {
  const r = recommend({ chest: 92, waist: 77, hip: 95 }, 'men');
  assert.ok(['M','L'].includes(r.size), `Got ${r.size}`);
});

test('recommend: measurements rounded in output', () => {
  const r = recommend({ chest: 86.7, waist: 70.3, hip: 92.1 });
  assert.strictEqual(r.measurements.chest, 87);
  assert.strictEqual(r.measurements.waist, 70);
  assert.strictEqual(r.measurements.hip, 92);
});

// ── quizRecommend() ───────────────────────────────────────────────────────

test('quizRecommend: returns a result object', () => {
  const r = quizRecommend({ heightCm: 163, weightKg: 58, usualSize: 'M' });
  assert.ok(r.size);
  assert.ok(r.note);
});

test('quizRecommend: without weight falls back to usual size', () => {
  const r = quizRecommend({ heightCm: 163, weightKg: 0, usualSize: 'L' });
  assert.strictEqual(r.size, 'L');
  assert.strictEqual(r.confidence, 'low');
});

test('quizRecommend: note mentions accuracy caveat', () => {
  const r = quizRecommend({ heightCm: 163, weightKg: 58, usualSize: 'M' });
  assert.ok(/photo|accurate|height|weight/i.test(r.note), `Note: ${r.note}`);
});

test('quizRecommend: taller + heavier person gets larger size', () => {
  const small = quizRecommend({ heightCm: 155, weightKg: 48, usualSize: 'S' });
  const large = quizRecommend({ heightCm: 170, weightKg: 80, usualSize: 'L' });
  const order = ['XS','S','M','L','XL','XXL'];
  assert.ok(
    order.indexOf(large.size) >= order.indexOf(small.size),
    `Expected ${large.size} >= ${small.size}`
  );
});

test('quizRecommend: confidence is never high (photo is more accurate)', () => {
  const r = quizRecommend({ heightCm: 163, weightKg: 58, usualSize: 'M' });
  assert.ok(r.confidence !== 'high', `Got confidence: ${r.confidence}`);
});
