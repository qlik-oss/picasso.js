import extend from 'extend';
import bandScale, { DEFAULT_SETTINGS } from './band';
import resolveSettings from './settings-resolver';
import type { ScaleSettings, ScaleData, ScaleResources } from './settings-resolver';

const DEFAULT_TICKS_SETTINGS = {
  depth: 0,
};

function keyGen(node: any, valueFn: (ctx: any) => string, ctx: any): string {
  return node
    .ancestors()
    .map((a: any) => valueFn(extend({ datum: a.data }, ctx)))
    .reverse()
    .slice(1) // Delete root node
    .toString();
}

function flattenTree(rootNode: any, settings: any, ctx: any): { values: any[]; labels: any[]; items: Record<string, any>; ticks: any[] } {
  const ticksDepth = settings.ticks.depth;
  const valueFn = settings.value;
  const labelFn = settings.label;
  const values: any[] = [];
  const labels: any[] = [];
  const items: Record<string, any> = {};
  const ticks: any[] = [];
  let expando = 0;
  if (!rootNode) {
    return {
      values,
      labels,
      items,
      ticks,
    };
  }

  rootNode.eachAfter((node: any) => {
    if (node.depth > 0) {
      const key = keyGen(node, valueFn, ctx);
      const leaves = node.leaves() || [node]; // If leaf node returns itself
      const value = valueFn(extend({ datum: node.data }, ctx));
      const label = labelFn(extend({ datum: node.data }, ctx));
      const isBranch = Array.isArray(node.children);

      const item = {
        key,
        count: leaves.length,
        value,
        label,
        leftEdge: keyGen(leaves[0], valueFn, ctx),
        rightEdge: keyGen(leaves[Math.max(leaves.length - 1, 0)], valueFn, ctx),
        node,
        // isTick: ticksDepth === null ? !isBranch : node.depth === ticksDepth
      };

      if (isBranch) {
        values.push(`SPACER_${expando}_SPACER`);
        expando++;
      } else {
        values.push(key);
        labels.push(label);
      }

      if ((ticksDepth <= 0 && !isBranch) || node.depth === ticksDepth) {
        ticks.push(item);
      }

      items[key] = item;
    }
  });

  const spill = rootNode.height - 1;
  if (spill > 0) {
    values.splice(-spill);
  }

  return {
    values,
    labels,
    items,
    ticks,
  };
}

/**
 * @typedef {object} scale-hBand.settings
 * @private
 * @property {number} [padding=0] - Exposes {@link https://github.com/d3/d3-scale#band_padding}
 * @property {boolean} [paddingOuter=0] - Exposes {@link https://github.com/d3/d3-scale#band_paddingOuter}
 * @property {number[]} [paddingInner=0] - Exposes {@link https://github.com/d3/d3-scale#band_paddingInner}
 * @property {object} [align=0.5] - Exposes {@link https://github.com/d3/d3-scale#band_align}
 * @property {boolean} [invert=false] - Invert the output range
 */

/**
 * Hierarchical band scale, that is an augmented band scale, that takes hierarchical data as input
 * @alias scaleHierarchicalBand
 * @private
 * @param { Object } settings
 * @param { fields[] } [fields]
 * @param { dataset } [dataset] - With a root property that is an instance of D3.js Hierarchy
 * @return { h-band }
 */

export default function scaleHierarchicalBand(
  settings: ScaleSettings = {},
  data: ScaleData = {},
  resources: ScaleResources = {}
) {
  const ctx = { data, resources };
  const stgns: Record<string, unknown> = resolveSettings(settings, DEFAULT_SETTINGS, ctx);
  stgns.ticks = resolveSettings((settings as any).ticks, DEFAULT_TICKS_SETTINGS, ctx);
  stgns.value = typeof (settings as any).value === 'function' ? (settings as any).value : (d: any) => d.datum.value;
  stgns.label = typeof (settings as any).label === 'function' ? (settings as any).label : (d: any) => d.datum.value;

  let bandInstance = bandScale(stgns as any);

  const { values, labels, items, ticks } = flattenTree((data as any).root, stgns, ctx);

  /**
   * @alias h-band
   * @private
   * @kind function
   * @param { Object[] } value - Array where each value is a reference to a node, going from depth 1 to n.
   * @return { number }
   */
  const hBand = function fn(val: any) {
    const strVal = String(val);
    const item = items[strVal];
    if (item) {
      return bandInstance(stgns.invert ? item.rightEdge : item.leftEdge);
    }

    return bandInstance(strVal);
  };

  extend(true, hBand, bandInstance);

  /**
   * Wrapped {@link https://github.com/d3/d3-scale#band_bandwidth}
   * @param { Object[] } [val] - Array where each value is a reference to a node, going from depth 1 to n. If omitted, bandwidth for the leaf nodes is return.
   * @return { number }
   */

  hBand.bandwidth = function bandwidth(val: any) {
    const item = items[String(val)];
    const bw = bandInstance.bandwidth();
    if (item && !item.isLeaf) {
      const left = hBand(item.leftEdge);
      const right = hBand(item.rightEdge);
      return Math.abs(left - right) + bw;
    }
    return bw;
  };

  /**
   * Wrapped {@link https://github.com/d3/d3-scale#band_step}
   * @param { Object[] } [val] - Array where each value is a reference to a node, going from depth 1 to n. If omitted, step size for the leaf nodes is return.
   * @return { number }
   */
  hBand.step = function step(val: any) {
    const item = items[String(val)];
    const leafCount = item ? item.count : 1;
    let stepSize = bandInstance.step();
    stepSize *= leafCount;
    return stepSize;
  };

  /**
   * @return { dataset }
   */
  hBand.data = () => data;

  /**
   * Return datum for a given node
   * @param { Object[] } val - Array where each value is a reference to a node, going from depth 1 to n.
   * @return { Object } The datum
   */
  hBand.datum = (val: any) => {
    const item = items[String(val)];
    if (item) {
      return item.node.data;
    }
    return null;
  };

  hBand.copy = () => scaleHierarchicalBand(settings, data, resources);

  /**
   * @return { Object[] } Labels for each leaf node
   */
  hBand.labels = () => labels;

  /**
   * Generate discrete ticks
   * @return { Object[] } Ticks for each leaf node
   */
  hBand.ticks = () =>
    ticks.map((item: any) => {
      const start = hBand(item.key);
      const bandwidth = hBand.bandwidth(item.key);
      return {
        position: start + bandwidth / 2,
        label: item.label,
        data: item.node.data,
        start,
        end: start + bandwidth,
      };
    });

  const orgPxScale = bandInstance.pxScale;
  hBand.pxScale = function pxScale(size: number) {
    bandInstance = orgPxScale(size);
    return hBand;
  };

  (hBand as typeof bandInstance).domain(values);

  return hBand;
}
