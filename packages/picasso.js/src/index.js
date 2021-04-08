import 'path2d-polyfill';
import extend from 'extend';
import about from './about';

import { chart, renderer } from './core';

import { components, scales, renderers } from './api';

import componentRegistry from './core/component';
import dataRegistry from './core/data';
import formatterRegistry from './core/formatter';
import interactionRegistry from './core/interaction';
import scaleRegistry from './core/chart/scales';
import { symbolRegistry } from './core/symbols';

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
     * @type {Registry}
     */
    component: registry(registries.component, 'component', logger),
    /**
     * Data registry
     * @type {Registry}
     */
    data: registry(registries.data, 'data', logger),
    /**
     * Formatter registry
     * @type {Registry}
     */
    formatter: registry(registries.formatter, 'formatter', logger),
    /**
     * Interaction registry
     * @type {Registry}
     */
    interaction: registry(registries.interaction, 'interaction', logger),
    /**
     * Renderer registry
     * @type {Registry}
     * @example
     * const svgFactory = picassojs.renderer('svg');
     * const svgRenderer = svgFactory();
     */
    renderer: renderer(registries.renderer, 'renderer', logger),
    /**
     * Scale registry
     * @type {Registry}
     */
    scale: registry(registries.scale, 'scale', logger),
    /**
     * Symbol registry
     * @type {Registry}
     * @private
     */
    symbol: registry(registries.symbol, 'symbol', logger),
    // -- misc --
    /**
     * log some some stuff
     * @type {logger}
     * @private
     */
    logger,
  };

  if (config.renderer && config.renderer.prio) {
    regis.renderer.default(config.renderer.prio[0]);
  }

  /**
   * picasso.js entry point
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
   * @example
   * import picasso from 'picasso.js';
   *
   * const configuredPicasso = picasso({ renderer: { prio: ['canvas'] } }) // All components will render using the canvas renderer
   */
  function picassojs(cfg = {}) {
    let cc = {
      palettes: config.palettes.concat(cfg.palettes || []),
      style: extend({}, config.style, cfg.style),
      logger: cfg.logger || config.logger,
      renderer: cfg.renderer || config.renderer,
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
   * @param {ChartDefinition} definition
   * @returns {Chart}
   */
  picassojs.chart = (definition) =>
    chart(definition, {
      registries: regis,
      logger,
      style: config.style,
      palettes: config.palettes,
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

const p = pic(
  {
    renderer: {
      prio: ['svg', 'canvas'],
    },
    logger: {
      level: 0,
    },
    style,
    palettes,
  },
  {
    component: componentRegistry,
    data: dataRegistry,
    formatter: formatterRegistry,
    interaction: interactionRegistry,
    renderer: renderer(),
    scale: scaleRegistry,
    symbol: symbolRegistry,
  }
);

components.forEach(p.use);
renderers.forEach(p.use);
scales.forEach(p.use);

export { p as default };
