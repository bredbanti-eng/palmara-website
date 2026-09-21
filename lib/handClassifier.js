// Hand-landmark indices from MediaPipe's 21-point hand model.
const WRIST = 0;
const INDEX_MCP = 5;
const MIDDLE_MCP = 9;
const MIDDLE_TIP = 12;
const PINKY_MCP = 17;

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Classify a hand into one of the four traditional palmistry elements
 * (Earth / Air / Fire / Water) from MediaPipe hand landmarks, using the
 * palm's length-to-width ratio (square vs. rectangular palm) and the
 * finger-length-to-palm-length ratio (short vs. long fingers) — the two
 * measurements the traditional system is built on.
 *
 * Also derives a deterministic seed from the same geometry, so the same
 * photo (same hand proportions) always maps to the same seed, which lets
 * the backend cache/reuse the same reading for that photo.
 */
export function classifyHand(landmarks) {
  const wrist = landmarks[WRIST];
  const middleMcp = landmarks[MIDDLE_MCP];
  const indexMcp = landmarks[INDEX_MCP];
  const pinkyMcp = landmarks[PINKY_MCP];
  const middleTip = landmarks[MIDDLE_TIP];

  const palmLength = dist(wrist, middleMcp);
  const palmWidth = dist(indexMcp, pinkyMcp);
  const fingerLength = dist(middleMcp, middleTip);

  if (!palmLength || !palmWidth) return null;

  const palmRatio = palmLength / palmWidth; // > ~1.15 => longer than wide
  const fingerRatio = fingerLength / palmLength; // > ~0.8 => long fingers

  const longPalm = palmRatio > 1.15;
  const longFingers = fingerRatio > 0.8;

  let shape;
  if (!longPalm && !longFingers) shape = 'earth';
  else if (!longPalm && longFingers) shape = 'air';
  else if (longPalm && !longFingers) shape = 'fire';
  else shape = 'water';

  // Deterministic seed from the two ratios — stable across repeated
  // uploads of the same photo, since the geometry doesn't change.
  const seed =
    Math.abs(Math.round(palmRatio * 1000) * 31 + Math.round(fingerRatio * 1000)) %
    100000;

  return { shape, seed, palmRatio, fingerRatio };
}

export const HAND_SHAPE_MEANINGS = {
  earth: {
    label: 'Earth',
    palm: 'square',
    fingers: 'short',
    traits: ['grounded', 'practical', 'reliable', 'steady under pressure'],
  },
  air: {
    label: 'Air',
    palm: 'square',
    fingers: 'long',
    traits: ['curious', 'communicative', 'idea-driven', 'socially perceptive'],
  },
  fire: {
    label: 'Fire',
    palm: 'rectangular',
    fingers: 'short',
    traits: ['energetic', 'spontaneous', 'confident', 'action-oriented'],
  },
  water: {
    label: 'Water',
    palm: 'rectangular',
    fingers: 'long',
    traits: ['intuitive', 'emotionally attuned', 'imaginative', 'sensitive to atmosphere'],
  },
};
