/**
 * Currently some browsers, IE11 and Edge confirmed, doesn't support the dominant-baseline svg-attribute and
 * the browser that does, have different implementations. Thus giving an unpredictable result when rendering'
 * text and predicting it's position (ex. in collision detection).
 *
 * To supplement and the aid in aligning/positioning text with various items, this function can be used
 * to follow a common heuristic across supported renderers.
 * @ignore
 * @param {object} textNode
 * @param {string|number} [textNode['font-size']=0] - String in px format or number
 * @param {string} [textNode['dominant-baseline']] - If baseline is omitted dominant-baseline is used
 * @param {string} [textNode.baseline]
 * @returns {number} Delta-y required to adjust for baseline
 */
export default function baselineHeuristic(textNode) {
  const baseline = textNode.baseline || textNode['dominant-baseline'];
  let dy = 0;

  const fontSize = parseInt(textNode.fontSize || textNode['font-size'], 10) || 0;

  switch (baseline) {
    case 'hanging':
      dy = fontSize * 0.75;
      break;
    case 'text-before-edge':
      dy = fontSize * 0.85;
      break;
    case 'middle':
      dy = fontSize * 0.25;
      break;
    case 'central':
      dy = fontSize * 0.35;
      break;
    case 'mathemetical':
      dy = fontSize / 2;
      break;
    case 'text-after-edge':
    case 'ideographic':
      dy = -fontSize * 0.2;
      break;
    default:
      dy = 0;
      break;
  }

  return dy;
}
