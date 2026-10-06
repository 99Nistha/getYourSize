/**
 * Size matcher.
 * Two entry points:
 *   recommend()      — uses body measurements from photos
 *   quizRecommend()  — fallback when user skips photos
 */

// Standard Indian women's size chart (body measurements, cm)
const WOMEN = [
  { size: 'XS',  chest: [72, 78],   waist: [56, 62],  hip: [78, 84]   },
  { size: 'S',   chest: [78, 84],   waist: [62, 68],  hip: [84, 90]   },
  { size: 'M',   chest: [84, 90],   waist: [68, 74],  hip: [90, 96]   },
  { size: 'L',   chest: [90, 96],   waist: [74, 80],  hip: [96, 102]  },
  { size: 'XL',  chest: [96, 102],  waist: [80, 86],  hip: [102, 108] },
  { size: 'XXL', chest: [102, 109], waist: [86, 93],  hip: [108, 115] },
];

// Standard Indian men's size chart (body measurements, cm)
const MEN = [
  { size: 'XS',  chest: [78, 84],   waist: [62, 68],  hip: [80, 86]   },
  { size: 'S',   chest: [84, 90],   waist: [68, 74],  hip: [86, 92]   },
  { size: 'M',   chest: [90, 96],   waist: [74, 80],  hip: [92, 98]   },
  { size: 'L',   chest: [96, 102],  waist: [80, 86],  hip: [98, 104]  },
  { size: 'XL',  chest: [102, 108], waist: [86, 92],  hip: [104, 110] },
  { size: 'XXL', chest: [108, 115], waist: [92, 99],  hip: [110, 117] },
];

// Ease allowances (cm) added to body measurements before comparing garment charts
const EASE = {
  tops:    { chest: 6,  waist: 4,  hip: 4  },
  kurta:   { chest: 8,  waist: 6,  hip: 6  },
  bottoms: { chest: 0,  waist: 3,  hip: 4  },
  dress:   { chest: 6,  waist: 4,  hip: 6  },
};

// ── helpers ──────────────────────────────────────────────────────────────

function midpoint(range) { return (range[0] + range[1]) / 2; }

/**
 * Score = weighted euclidean distance to each size's centre.
 * Chest is most important for tops; hip + waist for bottoms.
 */
function score(m, entry, weights = { chest: 0.45, waist: 0.35, hip: 0.2 }) {
  return (
    weights.chest * Math.abs(m.chest - midpoint(entry.chest)) +
    weights.waist * Math.abs(m.waist - midpoint(entry.waist)) +
    weights.hip   * Math.abs(m.hip   - midpoint(entry.hip))
  );
}

function bestMatch(m, chart, weights) {
  return chart.reduce((best, entry) => {
    const s = score(m, entry, weights);
    return s < best.score ? { entry, score: s } : best;
  }, { entry: null, score: Infinity }).entry;
}

function inRange(val, range) { return val >= range[0] && val <= range[1]; }

function fitNote(m, match) {
  const parts = [];
  const chestD = m.chest - midpoint(match.chest);
  const waistD = m.waist - midpoint(match.waist);
  const hipD   = m.hip   - midpoint(match.hip);

  if (Math.abs(chestD) > 2.5) parts.push(chestD > 0 ? 'snug at the chest' : 'roomy at the chest');
  if (Math.abs(waistD) > 2.5) parts.push(waistD > 0 ? 'fitted at the waist' : 'loose at the waist');
  if (Math.abs(hipD)   > 2.5) parts.push(hipD   > 0 ? 'snug at the hips'   : 'comfortable at the hips');

  if (parts.length === 0) return 'Great fit across chest, waist and hips.';
  const note = parts.slice(0, 2).join(' and ');
  return note.charAt(0).toUpperCase() + note.slice(1) + '.';
}

function confidenceLevel(m, match) {
  const avg =
    (Math.abs(m.chest - midpoint(match.chest)) +
     Math.abs(m.waist - midpoint(match.waist)) +
     Math.abs(m.hip   - midpoint(match.hip))) / 3;
  if (avg < 2)  return 'high';
  if (avg < 5)  return 'medium';
  return 'low';
}

function alternatives(m, chart, bestSize) {
  return chart
    .filter(e => e.size !== bestSize &&
      (inRange(m.chest, e.chest) || inRange(m.waist, e.waist) || inRange(m.hip, e.hip)))
    .map(e => e.size)
    .slice(0, 2);
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Recommend a size from body measurements (photo path).
 *
 * @param {{ chest, waist, hip }} measurements  in cm
 * @param {'women'|'men'} gender
 * @param {Array|null} customChart  brand's normalised sizes array
 * @param {'tops'|'kurta'|'bottoms'|'dress'} garmentType
 * @param {'body'|'garment'} chartType  whether the chart is body or garment measurements
 */
export function recommend(
  measurements,
  gender      = 'women',
  customChart = null,
  garmentType = 'tops',
  chartType   = 'body'
) {
  const chart = customChart || (gender === 'men' ? MEN : WOMEN);

  // If chart is garment measurements, add ease to body measurements before comparing
  let m = measurements;
  if (chartType === 'garment') {
    const ease = EASE[garmentType] || EASE.tops;
    m = {
      chest: measurements.chest + ease.chest,
      waist: measurements.waist + ease.waist,
      hip:   measurements.hip   + ease.hip,
    };
  }

  // Weight chest higher for tops/kurtas, waist+hip higher for bottoms
  const weights = (garmentType === 'bottoms')
    ? { chest: 0.15, waist: 0.45, hip: 0.40 }
    : { chest: 0.50, waist: 0.30, hip: 0.20 };

  const match = bestMatch(m, chart, weights);
  const alts  = alternatives(m, chart, match.size);

  // Between sizes: pick the larger one
  const sorted = [...chart].sort((a, b) => midpoint(a.chest) - midpoint(b.chest));
  const idx    = sorted.findIndex(e => e.size === match.size);
  const nextUp = sorted[idx + 1];
  const finalSize = (nextUp && score(m, nextUp, weights) - score(m, match, weights) < 1.5)
    ? nextUp.size   // within 1.5 cm avg — recommend larger
    : match.size;

  return {
    size:         finalSize,
    note:         fitNote(m, match),
    confidence:   confidenceLevel(m, match),
    alternatives: alts,
    measurements: { chest: Math.round(m.chest), waist: Math.round(m.waist), hip: Math.round(m.hip) },
    chartSource:  customChart ? 'page' : 'default',
  };
}

/**
 * Estimate a size from quiz answers (no photo path).
 * Uses BMI + height correlation as a rough proxy for body measurements.
 */
export function quizRecommend({ heightCm, weightKg, usualSize }) {
  const h = heightCm;
  const w = weightKg;

  // If no weight, fall back to usual size directly
  if (!w || w < 30) {
    const chart = WOMEN;
    const match = chart.find(e => e.size === usualSize) || chart[2]; // default M
    return {
      size:         match.size,
      note:         'Based on your usual size. Try our photo analysis for a more precise fit.',
      confidence:   'low',
      alternatives: [],
      measurements: {
        chest: Math.round(midpoint(match.chest)),
        waist: Math.round(midpoint(match.waist)),
        hip:   Math.round(midpoint(match.hip)),
      },
      chartSource: 'default',
    };
  }

  // Rough body measurement estimates from height + weight
  // (empirical correlations for an average Indian body)
  const bmi    = w / ((h / 100) ** 2);
  const chest  = 0.38 * h + (bmi - 20) * 1.1;
  const waist  = 0.27 * h + (bmi - 20) * 1.4;
  const hip    = 0.42 * h + (bmi - 20) * 0.9;

  const measurements = { chest, waist, hip };
  const result = recommend(measurements, 'women', null, 'tops', 'body');

  return {
    ...result,
    note: result.note + ' (Estimated from height and weight — retake with photos for best accuracy.)',
    confidence: result.confidence === 'high' ? 'medium' : 'low',
  };
}
