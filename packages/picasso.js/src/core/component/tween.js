import extend from 'extend';
import { interpolateObject } from 'd3-interpolate';
import { easeCubic, easeElasticOut } from 'd3-ease';

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

function tween({ old, current }, { renderer }, config) {
  let ticker;
  // let staticNodes = [];
  let toBeUpdated = [];
  let entered = { nodes: [], ips: [] };
  let exited = { nodes: [], ips: [] };
  let updated = { nodes: [], ips: [] };
  let stages = [];
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
          entered.ips.push(
            interpolateObject(
              {
                r: 0.001,
                opacity: 0,
              },
              node
            )
          );
        }
      });
      Object.keys(ids).forEach((key) => {
        if (ids[key]) {
          exited.nodes.push(ids[key]);
          exited.ips.push(interpolateObject(ids[key], extend({}, ids[key], { r: 0.0001, opacity: 0 })));
        }
      });
      if (exited.ips.length) {
        stages.push({
          easing: easeCubic,
          duration: 200,
          tweens: exited.ips,
          nodes: [...toBeUpdated],
        });
      }
      if (updated.ips.length) {
        stages.push({
          easing: easeCubic,
          duration: 400,
          tweens: updated.ips,
          nodes: [],
        });
      }
      if (entered.ips.length) {
        stages.push({
          easing: easeElasticOut,
          duration: 1200,
          tweens: entered.ips,
          nodes: [...updated.nodes],
        });
      }
      // console.log(stages);
      if (stages.length) {
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
          tweener.stop();
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
  };

  return tweener;
}

export { tween as default };
