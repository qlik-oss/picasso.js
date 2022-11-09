import extend from 'extend';
import { interpolateObject } from 'd3-interpolate';
import { easeCubic, easeCubicIn, easeCubicOut } from 'd3-ease';

/* globals window */

function nodeId(node, i) {
  if (node.data) {
    return node.data.value;
  }
  if (node.type === 'text') {
    return node.text;
  }
  return i;
}

let shouldRemoveUpdatingStage = false;

export default function tween({ old, current }, { renderer }, config) {
  let ticker;
  // let staticNodes = [];
  let toBeUpdated = [];
  let entered = { nodes: [], ips: [] };
  let exited = { nodes: [], ips: [] };
  let updated = { nodes: [], ips: [] };
  let stages = [];
  let targetScene = null;
  const trackBy = config.trackBy || nodeId;

  const tweener = {
    start() {
      let ids = {};
      old.forEach((node, i) => {
        let id = trackBy(node, i);
        ids[id] = node;
      });
      current.forEach((node, i) => {
        let id = trackBy(node, i);
        if (ids[id]) {
          updated.ips.push(interpolateObject(ids[id], node));
          updated.nodes.push(node);
          toBeUpdated.push(ids[id]);
          ids[id] = false;
        } else {
          entered.nodes.push(node);
          entered.ips.push(interpolateObject(extend({}, node, { r: 0.001, opacity: 0 }), node));
        }
      });
      Object.keys(ids).forEach((key) => {
        if (ids[key]) {
          exited.nodes.push(ids[key]);
          exited.ips.push(interpolateObject(ids[key], extend({}, ids[key], { r: 0.0001, opacity: 0 })));
        }
      });
      // Obsolete nodes exiting
      stages.push({
        name: 'exiting',
        easing: easeCubicIn,
        duration: 200,
        tweens: exited.ips,
        nodes: [...toBeUpdated],
      });
      // Existing nodes updating
      stages.push({
        name: 'updating',
        easing: easeCubic,
        duration: 400,
        tweens: updated.ips,
        nodes: [],
      });
      // New nodes entering
      stages.push({
        name: 'entering',
        easing: easeCubicOut,
        duration: 200,
        tweens: entered.ips,
        nodes: [...updated.nodes],
      });
      if (config.isMainComponent) {
        const filterFn = config.isMainComponent?.filterFn;
        const nUpdatingNodes = filterFn ? toBeUpdated.filter(filterFn).length : toBeUpdated.length;
        shouldRemoveUpdatingStage = nUpdatingNodes === 0;
      }
      // console.log(stages);
      if (stages.length) {
        targetScene = renderer.getScene(current);
        stages[0].started = Date.now();
        if (typeof window !== 'undefined') {
          ticker = window.requestAnimationFrame(tweener.tick);
        }
      }
    },
    tick() {
      let currentStage = stages[0];
      if (!currentStage) {
        tweener.stop();
      }
      if (!currentStage.started) {
        currentStage.started = Date.now();
      }
      let t = (Date.now() - currentStage.started) / currentStage.duration;
      let currentNodes = [];
      let tweenedNodes = currentStage.tweens.map((ip) => ip(currentStage.easing(Math.min(1, t))));
      currentNodes.push(...tweenedNodes);
      currentNodes.push(...currentStage.nodes);
      // currentNodes.push(...staticNodes);
      // stages.slice(1).forEach(stage => currentNodes.push(...stage.nodes));
      renderer.render(currentNodes);
      if (t >= 1) {
        // staticNodes.push(...currentStage.nodes);
        stages.shift();
        if (!stages.length) {
          if (config.isMainComponent) {
            shouldRemoveUpdatingStage = false;
          }
          tweener.stop();
        } else if (stages[0].name === 'updating' && shouldRemoveUpdatingStage) {
          stages.shift();
        }
      }
      if (ticker) {
        ticker = window.requestAnimationFrame(tweener.tick);
      }
    },
    stop() {
      if (ticker) {
        window.cancelAnimationFrame(ticker);
        ticker = false;
      }
    },
    inProgress() {
      return !!ticker;
    },
    get targetScene() {
      return targetScene;
    },
  };

  return tweener;
}
