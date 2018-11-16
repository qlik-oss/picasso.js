import extend from 'extend';

function getDockTransform(offset = 0) {
  return {
    left: `translate(-100%,-50%) translateX(${-offset}px)`,
    right: `translate(${offset}px, -50%)`,
    top: `translate(-50%, -100%) translateY(${-offset}px)`,
    bottom: `translate(-50%, ${offset}px)`
  };
}

function getDockOffset(width, height, offset = 0) {
  return {
    left: { x: -width - offset, y: -height / 2 },
    right: { x: offset, y: -height / 2 },
    top: { x: -width / 2, y: -height - offset },
    bottom: { x: -width / 2, y: offset }
  };
}

function getComputedArrowStyle(offset) {
  return {
    left: {
      left: '100%',
      top: `calc(50% - ${offset}px)`,
      borderWidth: `${offset}px`
    },
    right: {
      left: `${-offset * 2}px`,
      top: `calc(50% - ${offset}px)`,
      borderWidth: `${offset}px`
    },
    top: {
      left: `calc(50% - ${offset}px)`,
      top: '100%',
      borderWidth: `${offset}px`
    },
    bottom: {
      left: `calc(50% - ${offset}px)`,
      top: `${-offset * 2}px`,
      borderWidth: `${offset}px`
    }
  };
}

function isInsideArea(area, vx, vy, width, height, offset) {
  const rect = {
    x: vx + offset.x,
    y: vy + offset.y,
    width,
    height
  };

  if (rect.x < 0 || rect.y < 0) {
    return false;
  }
  if (rect.x + rect.width > area.width || rect.y + rect.height > area.height) {
    return false;
  }
  return true;
}

/**
 * @param {vx} vx X-coordinate realative to the area
 * @param {vy} vy Y-coordinate realative to the area
 */
export function calcOffset({
  area, vx, vy, width, height, offset
}) {
  const rect = {
    x: vx + offset.x,
    y: vy + offset.y,
    width,
    height
  };

  let offsetX = rect.x < 0 ? -rect.x : 0;
  let offsetY = rect.y < 0 ? -rect.y : 0;

  offsetX += rect.x + rect.width > area.width
    ? -((rect.x + rect.width) - area.width) : 0;
  offsetY += rect.y + rect.height > area.height
    ? -((rect.y + rect.height) - area.height) : 0;

  return {
    x: offsetX,
    y: offsetY
  };
}

function alignToBounds({
  resources,
  nodes,
  pointer,
  width: elmWidth,
  height: elmHeight,
  options
}) {
  const { targetBounds } = pointer;
  const {
    x,
    y,
    width,
    height
  } = resources.getNodeBoundsRelativeToTarget(nodes[0]);

  const docks = {
    left: { x, y: y + (height / 2) },
    right: { x: x + width, y: y + (height / 2) },
    top: { x: x + (width / 2), y },
    bottom: { x: x + (width / 2), y: y + height }
  };

  // Check if explicit dock
  const dockTransforms = getDockTransform(options.offset);
  const transform = dockTransforms[options.dock];
  if (transform) {
    return {
      computedTooltipStyle: {
        left: `${docks[options.dock].x}px`,
        top: `${docks[options.dock].y}px`,
        transform
      },
      computedArrowStyle: getComputedArrowStyle(options.offset)[options.dock],
      dock: options.dock
    };
  }

  const area = {
    width: options.area === 'target' ? targetBounds.width : window.innerWidth,
    height: options.area === 'target' ? targetBounds.height : window.innerHeight
  };
  const dockOffsets = getDockOffset(elmWidth, elmHeight, options.offset);
  const dockOrder = ['top', 'left', 'right', 'bottom'];

  for (let i = 0; i < dockOrder.length; i += 1) {
    const dock = dockOrder[i];
    const vx = options.area === 'target' ? docks[dock].x : targetBounds.left + docks[dock].x;
    const vy = options.area === 'target' ? docks[dock].y : targetBounds.top + docks[dock].y;
    if (isInsideArea(area, vx, vy, elmWidth, elmHeight, dockOffsets[dock])) {
      return {
        computedTooltipStyle: {
          left: `${docks[dock].x}px`,
          top: `${docks[dock].y}px`,
          transform: dockTransforms[dock]
        },
        computedArrowStyle: getComputedArrowStyle(options.offset)[dock],
        dock
      };
    }
  }

  return {
    computedTooltipStyle: {
      left: `${docks.top.x}px`,
      top: `${docks.top.y}px`,
      transform: dockTransforms.top
    },
    computedArrowStyle: getComputedArrowStyle(options.offset).top,
    dock: 'top'
  };
}

function alignToPoint({
  options,
  pointer,
  width,
  height,
  dockOrder,
  x,
  y
}) {
  const {
    targetBounds
  } = pointer;

  // Check if explicit dock
  const dockTransforms = getDockTransform(options.offset);
  const transform = dockTransforms[options.dock];
  if (transform) {
    return {
      computedTooltipStyle: {
        left: `${x}px`,
        top: `${y}px`,
        transform
      },
      computedArrowStyle: getComputedArrowStyle(options.offset)[options.dock],
      dock: options.dock
    };
  }

  const area = {
    width: options.area === 'target' ? targetBounds.width : window.innerWidth,
    height: options.area === 'target' ? targetBounds.height : window.innerHeight
  };
  const dockOffsets = getDockOffset(width, height, options.offset);

  const results = [];
  const edgeMargin = 20;
  const vx = options.area === 'target' ? x : targetBounds.left + x;
  const vy = options.area === 'target' ? y : targetBounds.top + y;

  for (let i = 0; i < dockOrder.length; i += 1) {
    const dock = dockOrder[i];

    const offset = calcOffset({
      area, vx, vy, width, height, offset: dockOffsets[dock]
    });

    const computedTooltipStyle = {
      left: `${x}px`,
      top: `${y}px`,
      transform: dockTransforms[dock]
    };
    const computedArrowStyle = getComputedArrowStyle(options.offset)[dock];

    if (offset.x !== 0) {
      computedTooltipStyle.width = `${width - edgeMargin - Math.abs(offset.x)}px`;

      if (dock === 'top' || dock === 'bottom') {
        computedTooltipStyle.left = `${x + offset.x}px`;

        computedArrowStyle.left = `calc(50% ${offset.x > 0 ? '-' : '+'} ${Math.abs(offset.x)}px)`;
      }
    }

    const result = {
      computedTooltipStyle,
      computedArrowStyle,
      dock,
      rect: {
        width,
        height
      }
    };

    if (offset.x === 0 && offset.y === 0) {
      return result;
    }

    result.offset = offset;

    results.push(result);
  }

  results.sort((a, b) => Math.abs(a.offset.x) - Math.abs(b.offset.x));

  return results[0];
}

function alignToPointer({
  options,
  pointer,
  width,
  height
}) {
  const {
    x,
    y
  } = pointer;

  return alignToPoint({
    x,
    y,
    pointer,
    width,
    height,
    options,
    dockOrder: ['top', 'left', 'right', 'bottom']
  });
}

function alignToSlice({
  options,
  pointer,
  width,
  height,
  nodes,
  resources
}) {
  const node = nodes[0];
  const { dx, dy } = pointer;
  const componentBounds = resources.getComponentBoundsFromNode(node);

  // cx and cy relative to targetBounds
  const center = {
    x: dx + componentBounds.x + (componentBounds.width / 2),
    y: dy + componentBounds.y + (componentBounds.height / 2)
  };

  const {
    start,
    end,
    outerRadius
  } = node.desc.slice;

  // Node origin is at 12 o clock, clockwise, but Math uses 3 a clock, so it's transformed to origin at 3 a clock
  const middle = ((start + end) / 2) - (Math.PI / 2);
  const PI2 = Math.PI * 2;
  const radians = ((middle % PI2) + PI2) % PI2;
  let dockOrder = ['top', 'left', 'right', 'bottom'];

  if (options.dock === 'auto') {
    if (radians <= Math.PI / 4 || radians >= (Math.PI * 7) / 4) {
      dockOrder = ['right', 'top', 'bottom', 'left'];
    } else if (radians <= (Math.PI * 3) / 4) {
      dockOrder = ['bottom', 'left', 'right', 'top'];
    } else if (radians <= (Math.PI * 5) / 4) {
      dockOrder = ['left', 'top', 'bottom', 'right'];
    } else {
      dockOrder = ['top', 'left', 'right', 'bottom'];
    }
  }

  return alignToPoint({
    x: center.x + (outerRadius * componentBounds.scaleRatio.x * Math.cos(radians)),
    y: center.y + (outerRadius * componentBounds.scaleRatio.y * Math.sin(radians)),
    pointer,
    width,
    height,
    options,
    dockOrder
  });
}

function getComponentBoundsFromNode(node, pointer, chart) {
  const comp = node.key ? chart.component(node.key)
    : chart.componentsFromPoint({ x: pointer.clientX, y: pointer.clientY })[0];

  if (!comp) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      scaleRatio: {
        x: 1,
        y: 1
      }
    };
  }

  const componentSize = comp.rect;
  return {
    x: componentSize.margin.left + (componentSize.x * componentSize.scaleRatio.x),
    y: componentSize.margin.top + (componentSize.y * componentSize.scaleRatio.y),
    width: componentSize.width * componentSize.scaleRatio.x,
    height: componentSize.height * componentSize.scaleRatio.y,
    scaleRatio: componentSize.scaleRatio
  };
}

function getNodeBoundsRelativeToTarget(node, pointer, chart) {
  const componentBounds = getComponentBoundsFromNode(node, pointer, chart);
  const bounds = node.bounds;

  return {
    x: componentBounds.x + pointer.dx + bounds.x,
    y: componentBounds.y + pointer.dy + bounds.y,
    width: bounds.width,
    height: bounds.height
  };
}

const STRATEGIES = {
  bounds: alignToBounds,
  pointer: alignToPointer,
  slice: alignToSlice
};

export default function placement({ width, height }, {
  chart,
  state,
  props
}) {
  const propCtx = {
    resources: {
      formatter: chart.formatter,
      scale: chart.scale,
      component: chart.component,
      getComponentBoundsFromNode: node => getComponentBoundsFromNode(node, state.pointer, chart),
      getNodeBoundsRelativeToTarget: node => getNodeBoundsRelativeToTarget(node, state.pointer, chart)
    },
    nodes: state.activeNodes,
    pointer: state.pointer,
    width,
    height
  };
  const type = typeof props.placement;

  if (type === 'object' && typeof props.placement.fn === 'function') {
    // Custom placement strategy function
    return props.placement.fn(propCtx);
  }

  let opts = {
    type: 'pointer',
    offset: 8,
    dock: 'auto',
    area: 'viewport'
  };
  if (type === 'function') {
    // Custom placement function
    opts = extend(opts, props.placement(propCtx));
  }

  if (type === 'object' && STRATEGIES[props.placement.type]) {
    // Predefined placement function with options
    opts = extend(opts, props.placement);
  } else if (type === 'string' && STRATEGIES[props.placement]) {
    // Predefined placement function without options
    opts = extend(opts, { type: props.placement });
  }

  propCtx.options = opts;
  const plcm = STRATEGIES[opts.type](propCtx);

  let {
    x: minX,
    y: minY,
    width: maxX,
    height: maxY
  } = propCtx.resources.getComponentBoundsFromNode(propCtx.nodes[0]);
  minX += propCtx.pointer.dx;
  maxX += minX;
  minY += propCtx.pointer.dy;
  maxY += minY;

  // Clamp tooltip position
  plcm.computedTooltipStyle.left = `${Math.min(Math.max(0, minX, parseFloat(plcm.computedTooltipStyle.left)), maxX)}px`;
  plcm.computedTooltipStyle.top = `${Math.min(Math.max(0, minY, parseFloat(plcm.computedTooltipStyle.top)), maxY)}px`;

  return plcm;
}
