/**
 * Gets the value at 'path' of 'object'.
 *
 * @param {object} object Object to get value from.
 * @param {string} path Dot notation path of the property to get value from.
 * @param {*} [fallback=undefined] Fallback value to return if no value was found.
 *
 * @returns {*} The value if found, otherwise fallback value if specified, otherwise undefined.
 *
 * @example
 *
 * getValue({ person: { name: 'John Doe' } }, 'person.name');
 * // => 'John Doe'
 *
 * getValue({ person: { name: undefined } }, 'person.name', 'John Doe');
 * // => 'John Doe'
 */
export default function getValue(object, path, fallback) {
  if (object === undefined || path === undefined) {
    return fallback;
  }

  const steps = path.split('.');

  let scoped = object;

  for (let i = 0; i < steps.length; ++i) {
    const step = steps[i];

    if (scoped[step] === undefined) {
      return fallback;
    }

    scoped = scoped[step];
  }

  return scoped;
}
