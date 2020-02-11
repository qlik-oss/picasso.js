/* eslint import/prefer-default-export: 0 */

/**
 * Hash an object
 * Modified version of Java's HashCode function
 * Source: {@link http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/}
 * @ignore
 *
 * @param  {Object} item Item to hash
 * @return {String}      Unique hash id
 */
export function hashObject(item) {
  let hash = 0;
  let i;
  let chr;
  let len;

  item = JSON.stringify(item);

  if (item.length === 0) {
    return hash;
  }

  for (i = 0, len = item.length; i < len; i++) {
    chr = item.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash &= hash; // Convert to 32bit integer
  }

  return hash;
}
