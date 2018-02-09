/**
 * Short-hand for max(min())
 *
 * @param {number} min Minimum allowed value
 * @param {number} max Maximum allowed value
 * @param {number} value The actual value to cap
 * @ignore
 */
export function cap(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Resolve a diff, i.e. resolveDiff(0.2, 0.6, 1, 100) = 20
 *
 * @param {object} params parameters
 * @param {number} params.start Normalized start value
 * @param {number} params.end Normalized end value
 * @param {number} params.minPx The minimum number of pixels
 * @param {number} params.maxPx Maximum number of pixels, i.e. the width or height
 * @ignore
 */
export function resolveDiff({ start, end, minPx = 0.1, maxPx = 1 }) {
  const high = Math.max(start, end);
  const low = Math.min(start, end);
  const highModified = cap(-0.1, 1.2, high);
  const lowModified = cap(-0.1, 1.2, low);

  const wantedDiff = (highModified * maxPx) - (lowModified * maxPx);
  const actualDiff = Math.max(minPx, wantedDiff);
  const startModifier = (actualDiff - wantedDiff) / 2;
  const actualLow = (lowModified * maxPx) - startModifier;

  return {
    actualDiff,
    startModifier,
    actualLow
  };
}
