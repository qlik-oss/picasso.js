/**
 * Resolves the value at the given JSON path
 * @private
 * @param  {String} path [description]
 * @param  {Object} obj  [description]
 * @return {Object}      [description]
 *
 * @example
 * let path = "/path/to/paradise";
 * let obj = {
 *   path: {
 *     to: { paradise: "heaven"},
 *     from: {...}
 *   }
 * };
 * resolve( path, obj ); // "heaven"
 */
function resolve(path, obj) {
  let arr = path.replace(/^\//, '').split(/\//),
    container = obj;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] in container) {
      container = container[arr[i]];
    } else if (Array.isArray(container)) {
      if (arr[i] && arr[i].indexOf('...') !== -1) {
        const minMax = arr[i].split('...');
        container = container.filter((v, i2) => i2 >= +minMax[0] && i2 <= +minMax[1]);
      } else if (arr[i]) {
        const allowedIndexes = arr[i].split(',');
        container = container.filter((v, i2) => allowedIndexes.indexOf(`${i2}`) !== -1);
      }
      return container.map((v) => resolve(arr.slice(i + 1).join('/'), v));
    }
  }

  return container;
}

export { resolve as default };
