/**
 * A list of supported attributes in lower camelCase notation mapped to corresponding kebab-case notation.
 * The kebab-case notations are a sub-set of SVG attributes (https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute).
 * @ignore
 */
const mappedAttributes = {
  fill: 'fill',
  stroke: 'stroke',
  opacity: 'opacity',
  strokeWidth: 'stroke-width',
  strokeLinejoin: 'stroke-linejoin',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  baseline: 'dominant-baseline', // Special case where we have defined our own attribute name
  dominantBaseline: 'dominant-baseline',
  anchor: 'text-anchor', // Special case where we have defined our own attribute name
  textAnchor: 'text-anchor',
  maxWidth: 'maxWidth',
  transform: 'transform',
  strokeDasharray: 'stroke-dasharray',
  id: 'id',
};

/**
 * Takes a target object and assign each supported attribute from a source object to that target.
 * Each supported attributes is converted to a mapped kebab-case notation.
 * @ignore
 *
 * @param {object} target - Target object on which to assign mapped attribute values
 * @param {object} source - Source object
 */
function assignMappedAttribute(target, source) {
  Object.keys(mappedAttributes).forEach(key => {
    const sourceValue = source[key];
    if (typeof sourceValue !== 'undefined') {
      const mappedKey = mappedAttributes[key];
      target[mappedKey] = sourceValue;
    }
  });
}

export { mappedAttributes, assignMappedAttribute };
