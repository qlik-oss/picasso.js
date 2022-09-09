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
     * @type {registry}
     */
    component: registry(registries.component, 'component', logger),
    /**
     * Data registry
     * @type {registry}
     */
    data: registry(registries.data, 'data', logger),
    /**
     * Formatter registry
     * @type {registry}
     */
    formatter: registry(registries.formatter, 'formatter', logger),
    /**
     * Interaction registry
     * @type {registry}
     */
    interaction: registry(registries.interaction, 'interaction', logger),
    /**
     * Renderer registry
     * @type {registry}
     * @example
     * const svgFactory = picassojs.renderer('svg');
     * const svgRenderer = svgFactory();
     */
    renderer: renderer(registries.renderer, 'renderer', logger),
    /**
     * Scale registry
     * @type {registry}
     */
    scale: registry(registries.scale, 'scale', logger),
    /**
     * Symbol registry
     * @type {registry}
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
   * @param {object=} cfg
   * @param {object=} cfg.renderer
   * @param {Array<string>} cfg.renderer.prio
   * @param {object=} cfg.logger
   * @param {0|1|2|3|4} cfg.logger.level
   * @param {object=} cfg.style
   * @param {Array<object>=} cfg.palettes
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
   * @typedef {object} Registries
   * @property {registry} component Component registry
   * @property {registry} data Data registry
   * @property {registry} formatter Formatter registry
   * @property {registry} interaction Interaction registry
   * @property {registry} renderer Renderer registry
   * @property {registry} scale Scale registry
   */

  /**
   * Callback function to register a plugin
   * @callback plugin
   * @param {Registries} registries
   * @param {object} options
   */

  /**
   * Plugin registry
   * @param {plugin} plugin
   * @param {object} [options]
   */
  picassojs.use = (plugin, options = {}) => usePlugin(plugin, options, regis);

  /**
   * @param {ChartDefinition} definition
   * @returns {Chart}
   * @example
   * picasso.chart({
    element: document.querySelector('#container'), // This is the element to render the chart in
    data: [
      {
        type: 'matrix',
        data: [
          ['Month', 'Sales', 'Margin'],
          ['Jan', 1106, 7],
          ['Feb', 5444, 53],
          ['Mar', 147, 64],
          ['Apr', 7499, 47],
          ['May', 430, 62],
          ['June', 9735, 13],
          ['July', 5832, 13],
          ['Aug', 7435, 15],
          ['Sep', 3467, 35],
          ['Oct', 3554, 78],
          ['Nov', 5633, 23],
          ['Dec', 6354, 63],
        ],
      },
    ],
    settings: {
      scales: {
        x: { data: { field: 'Margin' } },
        y: { data: { field: 'Sales' } },
      },
      components: [
        {
          // specify how to render the chart
          type: 'axis',
          scale: 'y',
          layout: {
            dock: 'left',
          },
        },
        {
          type: 'axis',
          scale: 'x',
          layout: {
            dock: 'bottom',
          },
        },
        {
          type: 'point',
          data: {
            extract: {
              field: 'Month',
              props: {
                x: { field: 'Margin' },
                y: { field: 'Sales' },
              },
            },
          },
          settings: {
            x: { scale: 'x' },
            y: { scale: 'y' },
            size: function () {
              return Math.random();
            },
          },
        },
      ],
    },
  });
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

export default p;
