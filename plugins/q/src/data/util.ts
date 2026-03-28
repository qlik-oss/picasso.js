function flattenTree(children: any[], steps: number, arrIndexAtTargetDepth: number): any[] {
  let arr: any[] = [];
  if (!children || !children.length) {
    return arr;
  }
  if (steps <= 0) {
    const nodes = arrIndexAtTargetDepth >= 0 ? [children[arrIndexAtTargetDepth]] : children;
    arr = [...arr, ...nodes];
  } else {
    for (let i = 0; i < children.length; i++) {
      if (children[i].children && children[i].children.length) {
        arr = [...arr, ...flattenTree(children[i].children, steps - 1, arrIndexAtTargetDepth)];
      }
    }
  }
  return arr;
}

export function treeAccessor(sourceDepth: number, targetDepth: number, arrIndexAtTargetDepth: number): ((node: any) => any) | false {
  if (sourceDepth === targetDepth) {
    return (d: any) => d;
  }
  if (sourceDepth > targetDepth) {
    // traverse upwards
    const steps = Math.max(0, Math.min(100, sourceDepth - targetDepth));
    return (node: any) => {
      let n = node;
      for (let i = 0; i < steps; ++i) {
        n = n.parent;
      }
      return n;
    };
  }
  if (targetDepth > sourceDepth) {
    // flatten descendants
    const steps = Math.max(0, Math.min(100, targetDepth - sourceDepth));
    return (node: any) => flattenTree(node.children, steps - 1, arrIndexAtTargetDepth);
  }
  return false;
}

export function findField(query: any, { cache }: { cache: any }): any {
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
