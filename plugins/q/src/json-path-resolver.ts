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
export default function resolve(path, obj) {
  if (path.charAt(0) === '/') {
    path = path.substring(1);
  }
  const arr = path.split('/');
  let subpath;
  let container = obj;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === '*' && Array.isArray(container)) {
      const carr = [];
      subpath = arr.slice(i + 1).join('/');
      for (let c = 0; c < container.length; c++) {
        let v = resolve(subpath, container[c]);
        // v.forEach(_ => _._parent = container[c]);
        if (Array.isArray(v)) {
          carr.push(...v);
        } else {
          carr.push(v);
        }
      }
      return carr;
      // return container.map(v => resolve(arr.slice(i + 1).join('/'), v));
    }
    if (!arr[i] && Array.isArray(container)) {
      const carr = new Array(container.length);
      subpath = arr.slice(i + 1).join('/');
      for (let c = 0; c < container.length; c++) {
        carr[c] = resolve(subpath, container[c]);
      }
      return carr;
      // return container.map(v => resolve(arr.slice(i + 1).join('/'), v));
    }
    if (arr[i] in container) {
      container = container[arr[i]];
    }
  }

  return container;
}
