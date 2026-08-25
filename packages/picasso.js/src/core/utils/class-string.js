/**
 * Concatenate object keys into a space separated string. Use for transforming a 'class name map' into a class string
 * @private
 * @param  {Object} classMap Object with class names as keys and true or false values depending on if they should be in the returned class string or not
 * @return {String} Space separated string with class names
 */
export default function classString(classMap) {
  return Object.keys(classMap)
    .filter((className) => classMap[className])
    .join(' ');
}
