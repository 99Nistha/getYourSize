/**
 * Pose detector — wraps TensorFlow.js + MoveNet SinglePose Lightning.
 *
 * Both TF.js and the pose-detection package are loaded lazily from CDN
 * the first time detectPose() is called.  Subsequent calls reuse the
 * cached detector.
 *
 * MoveNet SinglePose Lightning keypoint indices:
 *   0  nose          1  left eye       2  right eye
 *   3  left ear      4  right ear
 *   5  left shoulder 6  right shoulder
 *   7  left elbow    8  right elbow
 *   9  left wrist   10  right wrist
 *  11  left hip     12  right hip
 *  13  left knee    14  right knee
 *  15  left ankle   16  right ankle
 */

const TFJS_CDN =
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.21.0/dist/tf.min.js';
const POSE_CDN =
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js';

// Minimum keypoint confidence we'll trust
const MIN_KP_SCORE = 0.25;

// Required keypoints for a usable pose (both must be present)
const REQUIRED_FRONT = [5, 6, 11, 12, 15, 16]; // shoulders, hips, ankles
const REQUIRED_SIDE  = [5, 6, 11, 12];          // shoulders + hips enough for side

let _detector = null;
let _loadPromise = null;

// ── CDN loader ────────────────────────────────────────────────────────────

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s   = document.createElement('script');
    s.src     = src;
    s.async   = true;
    s.onload  = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function loadModels(onProgress) {
  if (_detector) return _detector;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    onProgress?.('Downloading AI model (one-time, ~5 MB)…');
    await loadScript(TFJS_CDN);
    await loadScript(POSE_CDN);

    onProgress?.('Initialising GPU backend…');
    await window.tf.ready();

    onProgress?.('Loading pose-detection model…');
    _detector = await window.poseDetection.createDetector(
      window.poseDetection.SupportedModels.MoveNet,
      {
        modelType:        window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing:  false,
        minPoseScore:     0.2,
      }
    );

    return _detector;
  })();

  return _loadPromise;
}

// ── Validation ────────────────────────────────────────────────────────────

/**
 * Returns true when enough high-confidence keypoints are visible.
 * @param {object} pose
 * @param {number[]} requiredIds  keypoint indices that must be present
 */
export function isPoseUsable(pose, requiredIds = REQUIRED_FRONT) {
  if (!pose?.keypoints) return false;
  return requiredIds.every(i => {
    const kp = pose.keypoints[i];
    return kp && (kp.score ?? 1) >= MIN_KP_SCORE;
  });
}

/**
 * Returns a human-readable reason why the pose is unusable, or null.
 */
export function poseRejectionReason(pose, isSide = false) {
  if (!pose?.keypoints) return 'No person detected. Make sure you are fully visible.';

  const required = isSide ? REQUIRED_SIDE : REQUIRED_FRONT;
  const missing  = required.filter(i => {
    const kp = pose.keypoints[i];
    return !kp || (kp.score ?? 1) < MIN_KP_SCORE;
  });

  if (missing.length === 0) return null;

  const NAMES = {
    5: 'left shoulder', 6: 'right shoulder',
    11: 'left hip',    12: 'right hip',
    15: 'left ankle',  16: 'right ankle',
  };
  const missingNames = missing.map(i => NAMES[i] || `keypoint ${i}`).join(', ');
  return `Body partially cut off (${missingNames} not visible). Please step back and retake.`;
}

// ── Main export ───────────────────────────────────────────────────────────

/**
 * Run MoveNet on a canvas element and return the detected pose.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ isSide?: boolean, onProgress?: function }} opts
 * @returns {Promise<object>}  MoveNet pose object
 * @throws  if no usable pose is found
 */
export async function detectPose(canvas, { isSide = false, onProgress } = {}) {
  const detector = await loadModels(onProgress);

  onProgress?.('Detecting body pose…');
  const poses = await detector.estimatePoses(canvas, {
    flipHorizontal: false,
  });

  if (!poses?.length) {
    throw new Error('No person detected. Please retake the photo with your full body visible.');
  }

  const pose   = poses[0];
  const reason = poseRejectionReason(pose, isSide);

  if (reason) throw new Error(reason);

  return pose;
}
