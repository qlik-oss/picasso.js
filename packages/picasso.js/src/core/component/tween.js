import extend from 'extend';
import { easeCubic, easeCubicIn, easeCubicOut } from 'd3-ease';
import interpolateObject from './interpolate-object';

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

export function findCommonPointsFromTwoLines(oldLine, currentLine) {
  const oldPoints = oldLine.points.filter((point) => !point.dummy);
  const currentPoints = currentLine.points.filter((point) => !point.dummy);
  const currentPointsValues = currentPoints.map((point) => point.data.major.value);
  const commonPointsValues = oldPoints
    .filter((point) => currentPointsValues.includes(point.data.major.value))
    .map((point) => point.data.major.value);
  const oldCommonPoints = oldPoints.filter((point) => commonPointsValues.includes(point.data.major.value));
  const currentCommonPoints = currentPoints.filter((point) => commonPointsValues.includes(point.data.major.value));
  return { old: oldCommonPoints, current: currentCommonPoints };
}

export default function tween({ old, current }, { renderer, formatter }, config, chartStorage) {
  let ticker;
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
          if (node.type === 'path' && node.points && node.points.length > 0 && node.data.source.key !== 'trend') {
            const common = findCommonPointsFromTwoLines(ids[id], node);
            updated.ips.push(
              interpolateObject(
                extend({}, ids[id], { points: common.old }),
                extend({}, node, { points: common.current })
              )
            );
            toBeUpdated.push(extend({}, ids[id], { commonPoints: common.old }));
          } else {
            updated.ips.push(interpolateObject(ids[id], node));
            toBeUpdated.push(ids[id]);
          }
          updated.nodes.push(node);
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
        const { isInit, shouldBeRemoved } = chartStorage.getValue('animations.updatingStageMeta');
        if (isInit === false) {
          chartStorage.setValue('animations.updatingStageMeta.shouldBeRemoved', nUpdatingNodes === 0);
          chartStorage.setValue('animations.updatingStageMeta.isInit', true);
        } else {
          chartStorage.setValue(
            'animations.updatingStageMeta.shouldBeRemoved',
            shouldBeRemoved && nUpdatingNodes === 0
          );
        }
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
      const { adjustTweenedNodes } = config;
      if (adjustTweenedNodes) {
        adjustTweenedNodes(tweenedNodes);
      }
      currentNodes.push(...tweenedNodes);
      currentNodes.push(...currentStage.nodes);
      renderer.render(currentNodes);
      if (t >= 1) {
        stages.shift();
        const { isInit, shouldBeRemoved } = chartStorage.getValue('animations.updatingStageMeta');
        if (!stages.length) {
          if (isInit === true) {
            chartStorage.setValue('animations.updatingStageMeta.isInit', false);
          }
          tweener.stop();
        } else if (stages[0].name === 'updating' && shouldBeRemoved) {
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
