function flattenTree(children, steps, arrIndexAtTargetDepth) {
  const arr = [];
  if (!children || !children.length) {
    return arr;
  }
  if (steps <= 0) {
    const nodes = arrIndexAtTargetDepth >= 0 ? [children[arrIndexAtTargetDepth]] : children;
    arr.push(...nodes);
  } else {
    for (let i = 0; i < children.length; i++) {
      if (children[i].children && children[i].children.length) {
        arr.push(...flattenTree(children[i].children, steps - 1, arrIndexAtTargetDepth));
      }
    }
  }
  return arr;
}

export function treeAccessor(sourceDepth, targetDepth, arrIndexAtTargetDepth) {
  if (sourceDepth === targetDepth) {
    return d => d;
  }
  if (sourceDepth > targetDepth) {
    // traverse upwards
    const steps = Math.max(0, Math.min(100, sourceDepth - targetDepth));
    const path = [...Array(steps)].map(String.prototype.valueOf, 'parent').join('.');
    return Function('node', `return node.${path};`); // eslint-disable-line no-new-func
  }
  if (targetDepth > sourceDepth) {
    // flatten descendants
    const steps = Math.max(0, Math.min(100, targetDepth - sourceDepth));
    return node => flattenTree(node.children, steps - 1, arrIndexAtTargetDepth);
  }
  return false;
}

export function findField(query, { cache }) {
  if (typeof query === 'number') {
    return cache.fields[query];
  }

  const allFields = cache.allFields;
  if (typeof query === 'function') {
    for (let i = 0; i < allFields.length; i++) {
      if (query(allFields[i])) {
        return allFields[i];
      }
    }
    return false;
  }
  if (typeof query === 'string') {
    for (let i = 0; i < allFields.length; i++) {
      if (allFields[i].key() === query || allFields[i].title() === query) {
        return allFields[i];
      }
    }
  } else if (query && allFields.indexOf(query) !== -1) {
    // assume 'query' is a field instance
    return query;
  }

  throw Error(`Field not found: ${query}`);
}
