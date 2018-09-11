import 'path2d-polyfill';
import extend from 'extend';
import about from './about';

import {
  chart,
  renderer
} from './core';


import {
  components,
  scales,
  renderers
} from './api';

import componentRegistry from './core/component';
import dataRegistry from './core/data';
import formatterRegistry from './core/formatter';
import interactionRegistry from './core/interaction';
import scaleRegistry from './core/chart/scales';

import loggerFn from './core/utils/logger';
import registry from './core/utils/registry';

import { style, palettes } from './core/theme/light';

function usePlugin(plugin, options = {}, api) {
  plugin(api, options);
}

function pic(config = {}, registries = {}) {
  const logger = loggerFn(config.logger);

  /**
   * @lends picassojs
   */
  const regis = {
    // -- registries --
    /**
     * Component registry
     * @type {registry}
     */
    component: registry(registries.component),
    /**
     * Data registry
     * @type {registry}
     */
    data: registry(registries.data),
    /**
     * Formatter registry
     * @type {registry}
     */
    formatter: registry(registries.formatter),
    /**
     * Interaction registry
     * @type {registry}
     */
    interaction: registry(registries.interaction),
    /**
     * Renderer registry
     * @type {registry}
     */
    renderer: renderer(registries.renderer),
    /**
     * Scale registry
     * @type {registry}
     */
    scale: registry(registries.scale),
    /**
     * Symbol registry
     * @type {registry}
     * @private
     */
    symbol: registry(registries.symbol),
    // -- misc --
    /**
     * log some some stuff
     * @type {logger}
     * @private
     */
    logger
  };

  if (config.renderer && config.renderer.prio) {
    regis.renderer.default(config.renderer.prio[0]);
  }

  /**
   * picasso.js entry point
   * @experimental
   * @entry
   * @alias picassojs
   * @param {object} cfg
   * @param {object} cfg.renderer
   * @param {Array<string>} cfg.renderer.prio
   * @param {object} cfg.logger
   * @param {number} cfg.logger.level
   * @param {object} cfg.style
   * @param {Array<object>} cfg.palettes
   * @returns {picassojs}
   */
  function picassojs(cfg = {}) {
    let cc = {
      palettes: config.palettes.concat(cfg.palettes || []),
      style: extend({}, config.style, cfg.style),
      logger: cfg.logger || config.logger,
      renderer: cfg.renderer || config.renderer
    };
    return pic(cc, regis);
  }

  /**
   * @callback picassojs~plugin
   * @param {picassojs~registries} registries
   * @param {object} options
   */

  /**
   * @param {picassojs~plugin} plugin
   * @param {object} [options]
   */
  picassojs.use = (plugin, options = {}) => usePlugin(plugin, options, regis);

  /**
   * @param {chart-definition} definition
   * @returns {chart}
   */
  picassojs.chart = definition => chart(definition, {
    registries: regis,
    logger,
    style: config.style,
    palettes: config.palettes
  });
  picassojs.config = () => config;

  Object.keys(regis).forEach((key) => {
    picassojs[key] = regis[key];
  });

  /**
   * picasso.js version
   * @type {string}
   */
  picassojs.version = about.version;

  return picassojs;
}

const p = pic({
  renderer: {
    prio: ['svg', 'canvas']
  },
  logger: {
    level: 0
  },
  style,
  palettes
}, {
  component: componentRegistry,
  data: dataRegistry,
  formatter: formatterRegistry,
  interaction: interactionRegistry,
  renderer: renderer(),
  scale: scaleRegistry
});

components.forEach(p.use);
renderers.forEach(p.use);
scales.forEach(p.use);

export { p as default };
