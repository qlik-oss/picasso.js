function flattenTree(children, steps, prop, arrIndexAtTargetDepth) {
  const arr = [];
  if (!children || !children.length) {
    return arr;
  }
  if (steps <= 0) {
    const nodes = arrIndexAtTargetDepth >= 0 ? [children[arrIndexAtTargetDepth]] : children;
    if (prop) {
      arr.push(...nodes.map(v => v[prop]));
    } else {
      arr.push(...nodes);
    }
  } else {
    for (let i = 0; i < children.length; i++) {
      if (children[i].children && children[i].children.length) {
        arr.push(...flattenTree(children[i].children, steps - 1, prop, arrIndexAtTargetDepth));
      }
    }
  }
  return arr;
}

export function treeAccessor(sourceDepth, targetDepth, prop, arrIndexAtTargetDepth) {
  if (sourceDepth === targetDepth) {
    let fn;
    if (prop) {
      fn = Function('node', `return node.${prop};`); // eslint-disable-line no-new-func
    } else {
      fn = d => d;
    }
    return fn;
  }
  if (sourceDepth > targetDepth) { // traverse upwards
    const steps = Math.max(0, Math.min(100, sourceDepth - targetDepth));
    const path = [...Array(steps)].map(String.prototype.valueOf, 'parent').join('.');
    let fn;
    if (prop) {
      fn = Function('node', `return node.${path}.${prop};`); // eslint-disable-line no-new-func
    } else {
      fn = Function('node', `return node.${path};`); // eslint-disable-line no-new-func
    }
    return fn;
  }
  if (targetDepth > sourceDepth) { // flatten descendants
    const steps = Math.max(0, Math.min(100, targetDepth - sourceDepth));
    const fn = node => flattenTree(node.children, steps - 1, prop, arrIndexAtTargetDepth);
    return fn;
  }
  return false;
}

export function findField(query, { cache }) {
  // if (ATTR_DIM_RX.test(id) && query) { // true if this table is an attribute dimension table
  //   const idx = +/\/(\d+)/.exec(query)[1];
  //   return fields[idx];
  // }

  if (typeof query === 'number') {
    return cache.fields[query];
  }

  const allFields = cache.fields.slice();
  (cache.attributeDimensionFields || []).forEach(fields => allFields.push(...fields));
  (cache.attributeExpressionFields || []).forEach(fields => allFields.push(...fields));
  if (typeof query === 'function') {
    for (let i = 0; i < allFields.length; i++) {
      if (query(allFields[i])) {
        return allFields[i];
      }
    }
    return false;
  } else if (typeof query === 'string') {
    for (let i = 0; i < allFields.length; i++) {
      // console.log(allFields[i].key());
      if (allFields[i].key() === query || allFields[i].title() === query) {
        return allFields[i];
      }
    }
  } else if (query && allFields.indexOf(query) !== -1) { // assume 'query' is a field instance
    return query;
  }

  throw Error(`Field not found: ${query}`);
}
