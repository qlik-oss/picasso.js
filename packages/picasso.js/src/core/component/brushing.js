import extend from 'extend';
import { isTouchEvent } from '../utils/event-type';

/**
 * Flatten the array of nodes by removing any containers as they do not support styling, thus unable to brush them.
 * @param {array} nodes
 * @ignore
 */
export function reduceToLeafNodes(nodes = []) {
  return nodes.reduce((ary, node) => {
    if (Array.isArray(node.children)) {
      ary.push(...reduceToLeafNodes(node.children));
      return ary;
    }
    ary.push(node);
    return ary;
  }, []);
}

export function styler(obj, { context, data, style, filter, mode }) {
  const brusher = obj.chart.brush(context);
  const dataProps = data;
  const active = style.active || {};
  const inactive = style.inactive || {};
  const styleProps = [];
  Object.keys(active).forEach((key) => {
    styleProps.push(key);
  });

  Object.keys(inactive).forEach((key) => {
    if (styleProps.indexOf(key) === -1) {
      styleProps.push(key);
    }
  });

  const activeNodes = [];
  let globalActivation = false; // track when we need to loop through all nodes, not just the active ones

  const getNodes = () => {
    let nodes = reduceToLeafNodes(obj.nodes);
    if (typeof filter === 'function') {
      nodes = nodes.filter(filter);
    }
    return nodes;
  };

  const update = () => {
    // TODO - render nodes only once, i.e. don't render for each brush, update nodes for all brushes and then render
    const nodes = getNodes();
    const len = nodes.length;
    let nodeData;
    let globalChanged = false;
    const evaluatedDataProps = typeof dataProps === 'function' ? dataProps({ brush: brusher }) : dataProps;
    const lazyStyleUpdate =
      typeof obj.config.lazyStyleUpdate === 'function' ? obj.config.lazyStyleUpdate(obj) : obj.config.lazyStyleUpdate;

    if (!lazyStyleUpdate) {
      for (let i = 0; i < len; i++) {
        // TODO - update only added and removed nodes
        nodeData = nodes[i].data;
        if (!nodeData) {
          continue;
        }

        if (!nodes[i].__style) {
          nodes[i].__style = {};
          styleProps.forEach((s) => {
            nodes[i].__style[s] = nodes[i][s]; // store original value
          });
        }

        const isActive = brusher.containsMappedData(nodeData, evaluatedDataProps, mode);
        const activeIdx = activeNodes.indexOf(nodes[i]);
        let changed = false;
        if (isActive && activeIdx === -1) {
          // activated
          activeNodes.push(nodes[i]);
          changed = true;
        } else if (!isActive && activeIdx !== -1) {
          // was active
          activeNodes.splice(activeIdx, 1);
          changed = true;
        }
        if (changed || globalActivation) {
          const original = extend({}, nodes[i], nodes[i].__style);
          styleProps.forEach((s) => {
            if (isActive && s in active) {
              nodes[i][s] = typeof active[s] === 'function' ? active[s].call(null, original) : active[s];
            } else if (!isActive && s in inactive) {
              nodes[i][s] = typeof inactive[s] === 'function' ? inactive[s].call(null, original) : inactive[s];
            } else {
              nodes[i][s] = nodes[i].__style[s];
            }
          });
          globalChanged = true;
        }
      }
    } else {
      for (let i = 0; i < len; i++) {
        // TODO - update only added and removed nodes
        nodeData = nodes[i].data;
        if (!nodeData) {
          continue;
        }

        if (!nodes[i].__style) {
          nodes[i].__style = {};
          styleProps.forEach((s) => {
            nodes[i].__style[s] = nodes[i][s]; // store original value
          });
        }

        const isActive = brusher.containsMappedData(nodeData, evaluatedDataProps, mode);
        const activeIdx = activeNodes.indexOf(nodes[i]);
        let changed = false;
        if (isActive && activeIdx === -1) {
          // activated
          activeNodes.push(nodes[i]);
          changed = true;
        } else if (!isActive && activeIdx !== -1) {
          // was active
          activeNodes.splice(activeIdx, 1);
          changed = true;
        }
        nodes[i].needToUpdate = changed || globalActivation;
        nodes[i].isActive = isActive;
      }

      for (let i = 0; i < len; i++) {
        // TODO - update only added and removed nodes
        nodeData = nodes[i].data;
        if (!nodeData) {
          continue;
        }

        if (nodes[i].needToUpdate) {
          const original = extend({}, nodes[i], nodes[i].__style);
          const isActive = nodes[i].isActive;
          styleProps.forEach((s) => {
            if (isActive && s in active) {
              nodes[i][s] = typeof active[s] === 'function' ? active[s].call(null, original, activeNodes) : active[s];
            } else if (!isActive && s in inactive) {
              nodes[i][s] =
                typeof inactive[s] === 'function' ? inactive[s].call(null, original, activeNodes) : inactive[s];
            } else {
              nodes[i][s] = nodes[i].__style[s];
            }
          });
          globalChanged = true;
        }
        delete nodes[i].needToUpdate;
        delete nodes[i].isActive;
      }
    }

    globalActivation = false;
    return globalChanged;
  };

  const onStart = (opts = { suppressRender: false }) => {
    const { suppressRender } = opts;
    const nodes = getNodes();
    const len = nodes.length;
    for (let i = 0; i < len; i++) {
      if (!nodes[i].data) {
        continue;
      }

      nodes[i].__style = nodes[i].__style || {};
      styleProps.forEach((s) => {
        nodes[i].__style[s] = nodes[i][s]; // store original value
        if (s in inactive) {
          nodes[i][s] = typeof inactive[s] === 'function' ? inactive[s].call(null, nodes[i]) : inactive[s];
        }
      });
    }
    globalActivation = true;
    activeNodes.length = 0;
    if (!suppressRender) {
      obj.renderer.render(obj.nodes);
    }
  };

  const onEnd = (opts = { suppressRender: false }) => {
    const { suppressRender } = opts;
    const nodes = getNodes();
    const len = nodes.length;

    for (let i = 0; i < len; i++) {
      if (nodes[i].__style) {
        Object.keys(nodes[i].__style).forEach((s) => {
          nodes[i][s] = nodes[i].__style[s];
        });
        nodes[i].__style = undefined;
      }
    }
    activeNodes.length = 0;
    if (!suppressRender) {
      obj.renderer.render(obj.nodes);
    }
  };
  const onUpdate = () => {
    const changed = update();
    if (changed) {
      const renderedNodes = typeof obj.config.sortNodes === 'function' ? obj.config.sortNodes(obj) : obj.nodes;
      if (typeof obj.config.customRender === 'function') {
        obj.config.customRender({ render: obj.renderer.render, nodes: renderedNodes });
      } else {
        obj.renderer.render(renderedNodes);
      }
    }
  };

  const externalUpdate = () => {
    activeNodes.length = 0;
    globalActivation = true;
    update();
  };

  brusher.on('start', onStart);
  brusher.on('end', onEnd);
  brusher.on('update', onUpdate);

  function cleanUp() {
    brusher.removeListener('start', onStart);
    brusher.removeListener('end', onEnd);
    brusher.removeListener('update', onUpdate);
  }

  return {
    isActive() {
      return brusher.isActive();
    },
    update: externalUpdate,
    cleanUp,
  };
}

export function brushDataPoints({ dataPoints, action, chart, trigger }) {
  if (!trigger) {
    return;
  }

  const dataProps = trigger.data || [''];

  let rangeBrush = {
    items: [],
    actionFn: 'toggleRanges',
  };
  let valueBrush = {
    items: [],
    actionFn: 'toggleValues',
  };

  if (['add', 'remove', 'set', 'toggle'].indexOf(action) !== -1) {
    rangeBrush.actionFn = `${action}Ranges`;
    valueBrush.actionFn = `${action}Values`;
  }

  for (let i = 0; i < dataPoints.length; i++) {
    const dataPoint = dataPoints[i];
    if (!dataPoint) {
      continue;
    }
    dataProps.forEach((p) => {
      let d = dataPoint && !p ? dataPoint : dataPoint[p];
      if (d) {
        let it = { key: d.source.field };
        if (typeof d.source.key !== 'undefined') {
          it.key = `${d.source.key}/${d.source.field}`;
        }
        if (Array.isArray(d.value)) {
          it.range = { min: d.value[0], max: d.value[1] };
          rangeBrush.items.push(it);
        } else {
          it.value = d.value;
          valueBrush.items.push(it);
        }
      }
    });
  }

  trigger.contexts.forEach((c) => {
    if (rangeBrush.items.length) {
      chart.brush(c)[rangeBrush.actionFn](rangeBrush.items);
    } else {
      chart.brush(c)[valueBrush.actionFn](valueBrush.items); // call action even if there are items to potentially clear what is currently in the brush
    }
  });
}

export function brushFromSceneNodes({ nodes, action, chart, trigger }) {
  const dataPoints = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    let nodeData = node.data;
    if (nodeData !== null) {
      dataPoints.push(nodeData);
    }
  }

  brushDataPoints({
    dataPoints,
    action,
    chart,
    trigger,
  });
}

export function resolveEvent({ collisions, t, config, action }) {
  let brushCollisions = [];
  let resolved = false;

  if (collisions.length > 0) {
    brushCollisions = collisions;
    resolved = true;

    if (t.propagation === 'stop') {
      brushCollisions = [collisions[collisions.length - 1]];
    }
  }

  const nodes = brushCollisions.map((c) => c.node);
  brushFromSceneNodes({
    nodes,
    action,
    chart: config.chart,
    data: config.data,
    trigger: t,
  });

  return resolved;
}

function touchSingleContactPoint(e, rect) {
  if (e.changedTouches.length !== 1) {
    return null;
  }

  return {
    x: e.changedTouches[0].clientX - rect.left,
    y: e.changedTouches[0].clientY - rect.top,
  };
}

function singleContactPoint(e, rect) {
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function resolveCollisions(e, t, renderer) {
  const rect = renderer.element().getBoundingClientRect();
  let p = isTouchEvent(e) ? touchSingleContactPoint(e, rect) : singleContactPoint(e, rect);

  if (p === null || p.x < 0 || p.y < 0 || p.x > rect.width || p.y > rect.height) {
    // TODO include radius in this check?
    return [];
  }

  if (t.touchRadius > 0 && isTouchEvent(e)) {
    p = {
      cx: p.x,
      cy: p.y,
      r: t.touchRadius, // TODO Use touch event radius/width value (Need to handle dpi scaling as well)
    };
  } else if (t.mouseRadius > 0 && !isTouchEvent(e)) {
    p = {
      cx: p.x,
      cy: p.y,
      r: t.mouseRadius,
    };
  }

  return renderer.itemsAt(p);
}

function resolveAction(action, e, def) {
  if (action) {
    if (typeof action === 'function') {
      return action(e);
    }
    return action;
  }
  return def;
}

export function resolveTapEvent({ e, t, config }) {
  const collisions = resolveCollisions(e, t, config.renderer);

  return resolveEvent({
    collisions,
    t,
    config,
    action: resolveAction(t.action, e, 'toggle'),
  });
}

export function resolveOverEvent({ e, t, config }) {
  const collisions = resolveCollisions(e, t, config.renderer);

  return resolveEvent({
    collisions,
    t,
    config,
    action: resolveAction(t.action, e, 'set'),
  });
}
