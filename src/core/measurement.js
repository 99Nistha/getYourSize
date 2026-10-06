/**
 * Measurement calculator.
 *
 * Converts MoveNet pose keypoints + known height into body measurements (cm).
 *
 * Strategy
 * ─────────
 * Front photo:
 *   • Scale (cm/px) from body-pixel-height (shoulder→ankle) / entered height × 0.86
 *     (shoulder-to-ankle is ~86 % of standing height)
 *   • Shoulder width  = dist(left_shoulder, right_shoulder)
 *   • Hip width       = dist(left_hip, right_hip)
 *   • Waist width     ≈ weighted blend of shoulder + hip widths at the 42 % mark
 *
 * Side photo (optional, refines circumference estimates):
 *   • Same scale from ankle→shoulder
 *   • "Width" between same-side shoulder keypoints = lateral body thickness at chest
 *   • Depth ratios for waist and hip derived from that
 *
 * Circumference from width + depth:
 *   Ramanujan ellipse approximation:
 *     C ≈ π × (3(a+b) − √((3a+b)(a+3b)))
 *   where a = half-width, b = half-depth.
 *
 * These ratios are calibrated for average Indian body proportions and
 * WILL need recalibration once pilot data is available (Phase 1).
 */

// ── Keypoint index map ────────────────────────────────────────────────────

const KP = {
  nose: 0,
  leftShoulder: 5, rightShoulder: 6,
  leftHip: 11,     rightHip: 12,
  leftKnee: 13,    rightKnee: 14,
  leftAnkle: 15,   rightAnkle: 16,
};

// ── Geometry helpers ──────────────────────────────────────────────────────

function kp(pose, idx) {
  const k = pose.keypoints[idx];
  return { x: k.x, y: k.y, score: k.score ?? 1 };
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Ramanujan ellipse circumference approximation.
 * @param {number} width  full width  (diameter, not radius)
 * @param {number} depth  full depth  (diameter, not radius)
 */
function ellipseCircumference(width, depth) {
  const a = width / 2;
  const b = depth / 2;
  // Clamp so a is always ≥ b (Ramanujan assumes a ≥ b)
  const [maj, min] = a >= b ? [a, b] : [b, a];
  const h = ((maj - min) / (maj + min)) ** 2;
  return Math.PI * (maj + min) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

// ── Scale calculation ─────────────────────────────────────────────────────

/**
 * Returns pixels-per-centimetre for the photo.
 *
 * Uses shoulder→ankle as the reference distance, which equals ~86 % of
 * standing height.  Falls back to shoulder→knee (×1.5) if ankles are
 * invisible.
 */
function calcScale(pose, heightCm) {
  const ls = kp(pose, KP.leftShoulder);
  const rs = kp(pose, KP.rightShoulder);
  const la = kp(pose, KP.leftAnkle);
  const ra = kp(pose, KP.rightAnkle);
  const lk = kp(pose, KP.leftKnee);
  const rk = kp(pose, KP.rightKnee);

  const avgShoulderY = (ls.y + rs.y) / 2;

  let bodyHeightPx;
  const ankleVisible = la.score > 0.25 && ra.score > 0.25;
  if (ankleVisible) {
    const avgAnkleY = (la.y + ra.y) / 2;
    bodyHeightPx = Math.abs(avgAnkleY - avgShoulderY);
  } else {
    // Fall back: use knees, shoulder-to-knee ≈ 56 % of height
    const avgKneeY = (lk.y + rk.y) / 2;
    bodyHeightPx = Math.abs(avgKneeY - avgShoulderY) / 0.56 * 0.86;
  }

  // px / cm   →   later: measurement_cm = measurement_px / pxPerCm
  const pxPerCm = bodyHeightPx / (heightCm * 0.86);
  return pxPerCm;
}

// ── Depth estimation from side photo ─────────────────────────────────────

/**
 * From the side photo, extract front-to-back body depths at chest,
 * waist and hip level (all in cm).
 *
 * In a side photo, MoveNet sees the person turned 90°.  The "shoulder
 * width" (dist between left + right shoulder keypoints) now represents
 * the lateral body thickness, i.e. the depth we need.
 *
 * Typical depth ratios for an average Indian adult:
 *   chest depth / chest width  ≈ 0.62
 *   waist depth / chest depth  ≈ 0.78
 *   hip   depth / chest depth  ≈ 0.95
 */
function extractDepths(sidePose, heightCm) {
  const pxPerCm = calcScale(sidePose, heightCm);

  const ls = kp(sidePose, KP.leftShoulder);
  const rs = kp(sidePose, KP.rightShoulder);
  const lh = kp(sidePose, KP.leftHip);
  const rh = kp(sidePose, KP.rightHip);

  // Shoulder keypoints in a side view spread laterally (one in front, one behind).
  const shoulderSpanPx = dist(ls, rs);
  const hipSpanPx      = dist(lh, rh);

  // The torso depth at shoulder level (chest area)
  const chestDepthCm = (shoulderSpanPx / pxPerCm) * 0.85; // ~85 % of span
  const hipDepthCm   = (hipSpanPx     / pxPerCm) * 0.90;
  const waistDepthCm = chestDepthCm * 0.78;

  return { chestDepthCm, waistDepthCm, hipDepthCm };
}

// ── Confidence score ──────────────────────────────────────────────────────

function calcConfidence(frontPose, sidePose) {
  const keyScores = [5, 6, 11, 12, 15, 16].map(i => frontPose.keypoints[i]?.score ?? 0);
  const avgFront  = keyScores.reduce((a, b) => a + b, 0) / keyScores.length;

  if (!sidePose) return avgFront > 0.7 ? 'medium' : 'low';

  const sideScores = [5, 6, 11, 12].map(i => sidePose.keypoints[i]?.score ?? 0);
  const avgSide    = sideScores.reduce((a, b) => a + b, 0) / sideScores.length;
  const combined   = (avgFront * 0.6 + avgSide * 0.4);

  if (combined > 0.75) return 'high';
  if (combined > 0.55) return 'medium';
  return 'low';
}

// ── Main export ───────────────────────────────────────────────────────────

/**
 * Convert front + side poses into body measurements.
 *
 * @param {object}      frontPose  MoveNet pose from front photo
 * @param {object|null} sidePose   MoveNet pose from side photo (null = not available)
 * @param {number}      heightCm   User-entered height in centimetres
 * @returns {{ chest, waist, hip, shoulder, torsoLength, confidence }}
 */
export function toMeasurements(frontPose, sidePose, heightCm) {
  // ── Front-view widths ──────────────────────────────────────────────────

  const pxPerCm = calcScale(frontPose, heightCm);

  const fls = kp(frontPose, KP.leftShoulder);
  const frs = kp(frontPose, KP.rightShoulder);
  const flh = kp(frontPose, KP.leftHip);
  const frh = kp(frontPose, KP.rightHip);

  const shoulderWidthCm = dist(fls, frs) / pxPerCm;
  const hipWidthCm      = dist(flh, frh) / pxPerCm;

  // Waist width: weighted midpoint between shoulder and hip widths.
  // The waist sits ~42 % of the way up from hip to shoulder.
  // Width tends to be slightly narrower than a simple linear interpolation.
  const waistWidthCm = (shoulderWidthCm * 0.52 + hipWidthCm * 0.48) * 0.96;

  // Torso length (shoulder to hip)
  const avgShoulderY = (fls.y + frs.y) / 2;
  const avgHipY      = (flh.y + frh.y) / 2;
  const torsoLengthCm = Math.abs(avgHipY - avgShoulderY) / pxPerCm;

  // ── Depths (front-only defaults vs side-photo values) ────────────────

  let chestDepthCm, waistDepthCm, hipDepthCm;

  if (sidePose) {
    const d = extractDepths(sidePose, heightCm);
    chestDepthCm = d.chestDepthCm;
    waistDepthCm = d.waistDepthCm;
    hipDepthCm   = d.hipDepthCm;
  } else {
    // Without a side photo, use empirical depth ratios.
    // Calibrated for average Indian adult body shape.
    chestDepthCm = shoulderWidthCm * 0.58;
    waistDepthCm = waistWidthCm    * 0.72;
    hipDepthCm   = hipWidthCm      * 0.62;
  }

  // ── Chest width at breast level (slightly narrower than shoulders) ────

  const chestWidthCm = shoulderWidthCm * 0.97;

  // ── Circumferences via Ramanujan ellipse formula ──────────────────────

  const chest = ellipseCircumference(chestWidthCm, chestDepthCm);
  const waist = ellipseCircumference(waistWidthCm, waistDepthCm);
  const hip   = ellipseCircumference(hipWidthCm,   hipDepthCm);

  return {
    chest:       Math.round(chest),
    waist:       Math.round(waist),
    hip:         Math.round(hip),
    shoulder:    Math.round(shoulderWidthCm),
    torsoLength: Math.round(torsoLengthCm),
    confidence:  calcConfidence(frontPose, sidePose),
  };
}
