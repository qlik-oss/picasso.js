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

function isInsideViewport(viewport, clientX, clientY, width, height, offset) {
  const rect = {
    x: clientX + offset.x,
    y: clientY + offset.y,
    width,
    height
  };

  if (rect.x < 0 || rect.y < 0) {
    return false;
  } else if (rect.x + rect.width > viewport.width || rect.y + rect.height > viewport.height) {
    return false;
  }
  return true;
}

/**
 * @param {vx} vx X-coordinate realative to the viewport
 * @param {vy} vy Y-coordinate realative to the viewport
 */
export function calcOffset({
  viewport, vx, vy, width, height, offset
}) {
  const rect = {
    x: vx + offset.x,
    y: vy + offset.y,
    width,
    height
  };

  let offsetX = rect.x < 0 ? -rect.x : 0;
  let offsetY = rect.y < 0 ? -rect.y : 0;

  offsetX += rect.x + rect.width > viewport.width ?
    -((rect.x + rect.width) - viewport.width) : 0;
  offsetY += rect.y + rect.height > viewport.height ?
    -((rect.y + rect.height) - viewport.height) : 0;

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
  const {
    x,
    y,
    width,
    height
  } = nodes[0].bounds;
  const { dx, dy, targetBounds } = pointer;
  const componentBounds = resources.component(nodes[0].key).rect;

  // Calc the physical component coordinates
  const px = componentBounds.margin.left + (componentBounds.x * componentBounds.scaleRatio.x);
  const py = componentBounds.margin.top + (componentBounds.y * componentBounds.scaleRatio.y);

  // x and y relative to targetBounds
  const rx = dx + px + x;
  const ry = dy + py + y;

  const docks = {
    left: {
      x: rx,
      y: ry + (height / 2)
    },
    right: {
      x: rx + width,
      y: ry + (height / 2)
    },
    top: {
      x: rx + (width / 2),
      y: ry
    },
    bottom: {
      x: rx + (width / 2),
      y: ry + height
    }
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

  const viewport = {
    width: options.area === 'target' ? targetBounds.width : window.innerWidth,
    height: options.area === 'target' ? targetBounds.height : window.innerHeight
  };
  const dockOffsets = getDockOffset(elmWidth, elmHeight, options.offset);
  const dockOrder = ['top', 'left', 'right', 'bottom'];

  for (let i = 0; i < dockOrder.length; i += 1) {
    const dock = dockOrder[i];
    const vx = options.area === 'target' ? docks[dock].x : targetBounds.left + docks[dock].x;
    const vy = options.area === 'target' ? docks[dock].y : targetBounds.top + docks[dock].y;
    if (isInsideViewport(viewport, vx, vy, elmWidth, elmHeight, dockOffsets[dock])) {
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

  const viewport = {
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
      viewport, vx, vy, width, height, offset: dockOffsets[dock]
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
  const componentBounds = resources.component(node.key).rect;

  // Calc the physical rect
  const px = componentBounds.margin.left + (componentBounds.x * componentBounds.scaleRatio.x);
  const py = componentBounds.margin.top + (componentBounds.y * componentBounds.scaleRatio.y);
  const pWidth = componentBounds.width * componentBounds.scaleRatio.x;
  const pHeight = componentBounds.height * componentBounds.scaleRatio.y;
  // cx and cy relative to targetBounds
  const center = {
    x: dx + px + (pWidth / 2),
    y: dy + py + (pHeight / 2)
  };

  const {
    start,
    end,
    outerRadius
  } = node.desc.slice;

  // origin is at 12 o clock, clockwise, so it is transform to origin at 3 a clock
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
      component: chart.component
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
  return STRATEGIES[opts.type](propCtx);
}
