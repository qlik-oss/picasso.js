function diff(from, to) {
  const added = [];
  let items;
  const removed = [];
  const updatedNew = [];
  const updatedOld = [];
  let fromIds;
  let toIds;
  const idMapper = a => a.id;
  const nodeMapper = (node, i) => {
    let id;
    if (typeof node === 'object') {
      if ('id' in node) {
        id = node.id;
      } else {
        id = i;
      }
    } else {
      id = node;
    }
    return {
      content: node,
      id: `${id}__${node.type || ''}`,
    };
  };

  if (!from.isTree) {
    from = from.map(nodeMapper);
  }

  to = to.map(nodeMapper);

  fromIds = from.map(idMapper);
  toIds = to.map(idMapper);
  // TODO - handle duplicate values

  // added = to.filter( v => fromIds.indexOf( v.id ) < 0 );
  // updatedNew = to.filter( v => fromIds.indexOf( v.id ) >= 0 );
  // removed = from.filter( v => toIds.indexOf( v.id ) < 0 );
  // updatedOld = from.filter( v => toIds.indexOf( v.id ) >= 0 );

  for (let i = 0, len = to.length; i < len; i++) {
    const idx = fromIds.indexOf(to[i].id);
    if (idx === -1) {
      added.push(to[i]);
    } else {
      updatedNew.push(to[i]);
    }
  }

  for (let i = 0, len = from.length; i < len; i++) {
    const idx = toIds.indexOf(from[i].id);
    if (idx === -1) {
      removed.push(from[i]);
    } else {
      updatedOld.push(from[i]);
    }
  }

  for (let i = 0, len = added.length; i < len; i++) {
    if (added[i].content.children) {
      added[i].diff = diff([], added[i].content.children);
      added[i].children = added[i].diff.updatedNew.concat(added[i].diff.added);
      added[i].children.isTree = true;
    }
  }

  for (let i = 0, len = updatedNew.length; i < len; i++) {
    updatedNew[i].diff = diff(updatedOld[i].children || [], updatedNew[i].content.children || []);
    updatedNew[i].object = updatedOld[i].object;
    updatedNew[i].children = updatedNew[i].diff.items;
  }

  items = updatedNew.concat(added);

  added.isTree = true;
  removed.isTree = true;
  updatedNew.isTree = true;
  updatedOld.isTree = true;
  items.isTree = true;

  return {
    added,
    updatedNew,
    updatedOld,
    removed,
    items,
  };
}

function createNodes(nodes, parent, create) {
  for (let i = 0, len = nodes.length; i < len; i++) {
    nodes[i].object = create(nodes[i].content.type, parent);
  }
}

function destroyNodes(nodes, destroy) {
  for (let i = 0, len = nodes.length; i < len; i++) {
    if (nodes[i].object !== null && typeof nodes[i].object !== 'undefined') {
      destroy(nodes[i].object);
      nodes[i].object = null;
    }
  }
}

function updateNodes(nodes, creator, maintainer, destroyer) {
  let item;
  for (let i = 0, len = nodes.length; i < len; i++) {
    item = nodes[i];
    if (item.object !== null && typeof item.object !== 'undefined') {
      maintainer(item.object, item.content);
      if (item.diff) {
        createNodes(item.diff.added, item.object, creator);
        destroyNodes(item.diff.removed, destroyer);
        updateNodes(item.diff.items, creator, maintainer, destroyer);
      }
    }
  }
}

function createTree(oldItems, newItems, root, creator, maintainer, destroyer) {
  const d = diff(oldItems, newItems);

  createNodes(d.added, root, creator);
  destroyNodes(d.removed, destroyer);
  updateNodes(d.items, creator, maintainer, destroyer);

  return d.items;
}

export { diff, createTree, destroyNodes, createNodes, updateNodes };
