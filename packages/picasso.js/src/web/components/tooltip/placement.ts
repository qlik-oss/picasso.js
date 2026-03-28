import extend from 'extend';
import type { SceneNode } from '../../../core/scene-graph/scene-node';

/** Result of a placement computation */
interface PlacementResult {
  computedTooltipStyle: Record<string, string>;
  computedArrowStyle: Record<string, string>;
  dock: string;
  rect: { width: number; height: number };
  offset?: { x: number; y: number };
}

/** Resources available to placement strategies */
interface PlacementResources {
  formatter: unknown;
  scale: unknown;
  component: unknown;
  getComponentBoundsFromNode: (node: SceneNode) => { x: number; y: number; width: number; height: number };
  getNodeBoundsRelativeToTarget: (node: SceneNode) => { x: number; y: number; width: number; height: number };
}

/** Context object passed to placement strategy functions */
interface PlacementContext {
  resources: PlacementResources;
  nodes: SceneNode[];
  pointer: { x?: number; y?: number; cx?: number; cy?: number; dx?: number; dy?: number };
  width: number;
  height: number;
  options?: {
    type: string;
    offset: number;
    dock: string;
    area: string;
  };
}

function getDockTransform(offset: number = 0): Record<string, string> {
  return {
    left: `translate(-100%,-50%) translateX(${-offset}px)`,
    right: `translate(${offset}px, -50%)`,
    top: `translate(-50%, -100%) translateY(${-offset}px)`,
    bottom: `translate(-50%, ${offset}px)`,
    inside: `translate(-50%, -50%)`,
  };
}

function getDockOffset(width: number, height: number, offset: number = 0): Record<string, Point> {
  return {
    left: { x: -width - offset, y: -height / 2 },
    right: { x: offset, y: -height / 2 },
    top: { x: -width / 2, y: -height - offset },
    bottom: { x: -width / 2, y: offset },
    inside: { x: -width / 2, y: -height / 2 },
  };
}

function getTooltipLeft({ options, docks, dockOffsets, targetBounds, area, width, height }: Record<string, any>): number {
  const dock = 'top';
  const vx = options.area === 'target' ? docks[dock].x : targetBounds.left + docks[dock].x;
  const vy = options.area === 'target' ? docks[dock].y : targetBounds.top + docks[dock].y;
  const offset = dockOffsets[dock];
  const rect = {
    x: vx + offset.x,
    y: vy + offset.y,
    width,
    height,
  };

  let left = docks.top.x;
  if (rect.x < 0 && rect.x + rect.width > area.width) {
    return left;
  }
  if (rect.x < 0) {
    left -= rect.x;
  } else if (rect.x + rect.width > area.width) {
    left -= rect.x + rect.width - area.width;
  }
  return left;
}

interface Point {
  x: number;
  y: number;
}

function getComputedArrowStyle(offset: number, borderWidth?: number): Record<string, Record<string, string>> {
  const sign = offset > 0 ? '-' : '+';
  offset = Math.abs(offset);
  if (borderWidth === undefined) {
    borderWidth = offset;
  }
  return {
    left: {
      left: '100%',
      top: `calc(50% ${sign} ${offset}px)`,
      borderWidth: `${borderWidth}px`,
    },
    right: {
      left: `${-offset * 2}px`,
      top: `calc(50% ${sign} ${offset}px)`,
      borderWidth: `${borderWidth}px`,
    },
    top: {
      left: `calc(50% ${sign} ${offset}px)`,
      top: '100%',
      borderWidth: `${borderWidth}px`,
    },
    bottom: {
      left: `calc(50% ${sign} ${offset}px)`,
      top: `${-offset * 2}px`,
      borderWidth: `${borderWidth}px`,
    },
    inside: {
      left: '0px',
      top: '0px',
      borderWidth: '0px',
    },
  };
}

function isInsideArea(area: any, vx: number, vy: number, width: number, height: number, offset: Point): boolean {
  const rect = {
    x: vx + offset.x,
    y: vy + offset.y,
    width,
    height,
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
 * @private
 * @param {vx} vx X-coordinate realative to the area
 * @param {vy} vy Y-coordinate realative to the area
 */
export function calcOffset({ area, vx, vy, width, height, offset }: Record<string, any>): Point {
  const rect = {
    x: vx + offset.x,
    y: vy + offset.y,
    width,
    height,
  };

  let offsetX = rect.x < 0 ? -rect.x : 0;
  let offsetY = rect.y < 0 ? -rect.y : 0;

  offsetX += rect.x + rect.width > area.width ? -(rect.x + rect.width - area.width) : 0;
  offsetY += rect.y + rect.height > area.height ? -(rect.y + rect.height - area.height) : 0;

  return {
    x: offsetX,
    y: offsetY,
  };
}

function alignToBounds({ resources, nodes, pointer, width: elmWidth, height: elmHeight, options }: PlacementContext): PlacementResult {
  const { targetBounds } = pointer as any;
  const { x, y, width, height } = resources.getNodeBoundsRelativeToTarget(nodes[0]);

  const docks = {
    left: { x, y: y + height / 2 },
    right: { x: x + width, y: y + height / 2 },
    top: { x: x + width / 2, y },
    bottom: { x: x + width / 2, y: y + height },
    inside: { x: x + width / 2, y: y + height / 2 },
  };

  // Check if explicit dock
  const dockTransforms = getDockTransform((options as any)!.offset);
  const transform = dockTransforms[(options as any)!.dock as any];
  if (transform) {
    return {
      computedTooltipStyle: {
        left: `${(docks as Record<string, any>)[(options as any)!.dock].x}px`,
        top: `${(docks as Record<string, any>)[(options as any)!.dock].y}px`,
        transform,
      },
      computedArrowStyle: (getComputedArrowStyle((options as any)!.offset) as Record<string, any>)[(options as any)!.dock],
      dock: (options as any)!.dock,
      rect: { width: elmWidth, height: elmHeight },
    };
  }

  const area = {
    width: (options as any)!.area === 'target' ? targetBounds.width : window.innerWidth,
    height: (options as any)!.area === 'target' ? targetBounds.height : window.innerHeight,
  };
  const dockOffsets = getDockOffset(elmWidth, elmHeight, (options as any)!.offset);
  const dockOrder = ['top', 'left', 'right', 'bottom', 'inside'];

  for (let i = 0; i < dockOrder.length; i += 1) {
    const dock = dockOrder[i] as any;
    const vx = (options as any)!.area === 'target' ? (docks as Record<string, any>)[dock].x : targetBounds.left + (docks as Record<string, any>)[dock].x;
    const vy = (options as any)!.area === 'target' ? (docks as Record<string, any>)[dock].y : targetBounds.top + (docks as Record<string, any>)[dock].y;
    if (isInsideArea(area, vx, vy, elmWidth, elmHeight, (dockOffsets as Record<string, any>)[dock])) {
      return {
        computedTooltipStyle: {
          left: `${(docks as Record<string, any>)[dock].x}px`,
          top: `${(docks as Record<string, any>)[dock].y}px`,
          transform: (dockTransforms as Record<string, any>)[dock],
        },
        computedArrowStyle: (getComputedArrowStyle((options as any)!.offset) as Record<string, any>)[dock],
        dock,
        rect: { width: elmWidth, height: elmHeight },
      };
    }
  }
  const left = getTooltipLeft({ options: (options as any)!, docks, dockOffsets, targetBounds, area, width: elmWidth, height: elmHeight });
  return {
    computedTooltipStyle: {
      left: `${left}px`,
      top: `${docks.top.y}px`,
      transform: dockTransforms.top,
    },
    computedArrowStyle: getComputedArrowStyle((options as any)!.offset + left - docks.top.x, (options as any)!.offset).top,
    dock: 'top',
    rect: { width: elmWidth, height: elmHeight },
  };
}

function alignToPoint({ options, pointer, width, height, dockOrder, x, y }: Record<string, any>): PlacementResult {
  const { targetBounds } = pointer;

  // Check if explicit dock
  const dockTransforms = getDockTransform(options.offset);
  const transform = dockTransforms[options.dock];
  if (transform) {
    return {
      computedTooltipStyle: {
        left: `${x}px`,
        top: `${y}px`,
        transform,
      },
      computedArrowStyle: getComputedArrowStyle(options.offset)[options.dock],
      dock: options.dock,
      rect: { width, height },
    };
  }

  const area = {
    width: options.area === 'target' ? targetBounds.width : window.innerWidth,
    height: options.area === 'target' ? targetBounds.height : window.innerHeight,
  };
  const dockOffsets = getDockOffset(width, height, options.offset);

  const results: PlacementResult[] = [];
  const edgeMargin = 20;
  const vx = options.area === 'target' ? x : targetBounds.left + x;
  const vy = options.area === 'target' ? y : targetBounds.top + y;

  for (let i = 0; i < dockOrder.length; i += 1) {
    const dock = dockOrder[i] as any;

    const offset: { x: number; y: number } = calcOffset({
      area,
      vx,
      vy,
      width,
      height,
      offset: dockOffsets[dock as any],
    });

    const computedTooltipStyle: Record<string, string> = {
      left: `${x}px`,
      top: `${y}px`,
      transform: dockTransforms[dock as any],
    };
    const computedArrowStyle: Record<string, string> = getComputedArrowStyle(options.offset)[dock as any];

    if (offset.x !== 0) {
      computedTooltipStyle.width = `${width - edgeMargin - Math.abs(offset.x)}px`;

      if (dock === 'top' || dock === 'bottom') {
        computedTooltipStyle.left = `${x + offset.x}px`;

        computedArrowStyle.left = `calc(50% ${offset.x > 0 ? '-' : '+'} ${Math.abs(offset.x)}px)`;
      }
    }

    const result: PlacementResult = {
      computedTooltipStyle,
      computedArrowStyle,
      dock,
      rect: {
        width,
        height,
      },
    };

    if (offset.x === 0 && offset.y === 0) {
      return result;
    }

    result.offset = offset;

    results.push(result);
  }

  results.sort((a, b) => Math.abs(a.offset!.x) - Math.abs(b.offset!.x));

  return results[0];
}

function alignToPointer({ options, pointer, width, height }: Record<string, any>): PlacementResult {
  const { x, y } = pointer;

  return alignToPoint({
    x,
    y,
    pointer,
    width,
    height,
    options,
    dockOrder: ['top', 'left', 'right', 'bottom'],
  });
}

function alignToSlice({ options, pointer, width, height, nodes, resources }: PlacementContext): PlacementResult {
  const node = nodes[0];
  const { dx = 0, dy = 0 } = pointer;
  const componentBounds = resources.getComponentBoundsFromNode(node);

  // cx and cy relative to targetBounds
  const center = {
    x: dx + componentBounds.x + componentBounds.width / 2,
    y: dy + componentBounds.y + componentBounds.height / 2,
  };

  const { start, end, outerRadius } = (node.desc as any)?.slice || { start: 0, end: 0, outerRadius: 0 };

  // Node origin is at 12 o clock, clockwise, but Math uses 3 a clock, so it's transformed to origin at 3 a clock
  const middle = (start + end) / 2 - Math.PI / 2;
  const PI2 = Math.PI * 2;
  const radians = ((middle % PI2) + PI2) % PI2;
  let dockOrder = ['top', 'left', 'right', 'bottom'];

  if ((options as any)!.dock === 'auto') {
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
    x: center.x + outerRadius * ((componentBounds as any).scaleRatio?.x || 1) * Math.cos(radians),
    y: center.y + outerRadius * ((componentBounds as any).scaleRatio?.y || 1) * Math.sin(radians),
    pointer,
    width,
    height,
    options,
    dockOrder,
  });
}

function getComponentBoundsFromNode(node: SceneNode, pointer: any, chart: any): { x: number; y: number; width: number; height: number; scaleRatio: { x: number; y: number } } {
  const comp = node.key
    ? chart.component(node.key)
    : chart.componentsFromPoint({ x: pointer.clientX, y: pointer.clientY })[0];

  if (!comp) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      scaleRatio: {
        x: 1,
        y: 1,
      },
    };
  }

  const componentSize = comp.rect;
  return extend({ scaleRatio: componentSize.scaleRatio }, componentSize.computedInner);
}

function getNodeBoundsRelativeToTarget(node: SceneNode, pointer: any, chart: any): { x: number; y: number; width: number; height: number } {
  const componentBounds = getComponentBoundsFromNode(node, pointer, chart);
  const bounds = node.bounds;

  return {
    x: componentBounds.x + (pointer.dx ?? 0) + bounds.x,
    y: componentBounds.y + (pointer.dy ?? 0) + bounds.y,
    width: bounds.width,
    height: bounds.height,
  };
}

const STRATEGIES: Record<string, Function> = {
  bounds: alignToBounds,
  pointer: alignToPointer,
  slice: alignToSlice,
};

export default function placement({ width, height }: { width: number; height: number }, { chart, state, props }: any): PlacementResult {
  const propCtx: PlacementContext = {
    resources: {
      formatter: chart.formatter,
      scale: chart.scale,
      component: chart.component,
      getComponentBoundsFromNode: (node) => getComponentBoundsFromNode(node, state.pointer, chart),
      getNodeBoundsRelativeToTarget: (node) => getNodeBoundsRelativeToTarget(node, state.pointer, chart),
    },
    nodes: state.activeNodes,
    pointer: state.pointer,
    width,
    height,
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
    area: 'viewport',
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

  let { x: minX, y: minY, width: maxX, height: maxY } = propCtx.resources.getComponentBoundsFromNode(propCtx.nodes[0]);
  minX += propCtx.pointer.dx ?? 0;
  maxX += minX;
  minY += propCtx.pointer.dy ?? 0;
  maxY += minY;

  // Clamp tooltip position
  plcm.computedTooltipStyle.left = `${Math.min(Math.max(0, minX, parseFloat(plcm.computedTooltipStyle.left)), maxX)}px`;
  plcm.computedTooltipStyle.top = `${Math.min(Math.max(0, minY, parseFloat(plcm.computedTooltipStyle.top)), maxY)}px`;

  return plcm;
}
