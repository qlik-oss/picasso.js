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

type Registry = ReturnType<typeof registry>;

interface Registries {
  component?: Registry;
  data?: Registry;
  formatter?: Registry;
  interaction?: Registry;
  renderer?: Registry;
  scale?: Registry;
  symbol?: Registry;
  logger?: ReturnType<typeof loggerFn>;
}

/**
 * Configuration for picasso.js instance
 */
export interface PicassoConfig {
  /** Renderer configuration */
  renderer?: {
    /** Priority order for renderer selection */
    prio?: string[];
  };
  /** Logger configuration */
  logger?: {
    /** Log level: 0=off, 1=error, 2=warn, 3=info, 4=debug */
    level?: 0 | 1 | 2 | 3 | 4;
  };
  /** Style configuration object */
  style?: object;
  /** Color palette definitions */
  palettes?: object[];
}

/**
 * Callback function to register a plugin
 */
interface Plugin {
  (registries: Registries, options: object): void;
}

interface ChartDefinition {}
interface Chart {}

function usePlugin(plugin: Plugin, options = {}, api: object) {
  plugin(api, options);
}

function pic(config: PicassoConfig = {}, registries: Registries = {}) {
  const logger = loggerFn(config.logger);

  const regis: Required<Registries> = {
    component: registry(registries.component, 'component', logger),
    data: registry(registries.data, 'data', logger),
    formatter: registry(registries.formatter, 'formatter', logger),
    interaction: registry(registries.interaction, 'interaction', logger),
    renderer: renderer(registries.renderer),
    scale: registry(registries.scale, 'scale', logger),
    symbol: registry(registries.symbol, 'symbol', logger),
    logger,
  };

  if (config.renderer && config.renderer.prio) {
    regis.renderer.default(config.renderer.prio[0]);
  }

  /**
   * picasso.js entry point
   * @example
   * import picasso from 'picasso.js';
   *
   * const configuredPicasso = picasso({ renderer: { prio: ['canvas'] } }) // All components will render using the canvas renderer
   */
  function picassojs(cfg: PicassoConfig = {}) {
    let cc = {
      palettes: (config.palettes || []).concat(cfg.palettes || []),
      style: { ...config.style, ...cfg.style },
      logger: cfg.logger || config.logger,
      renderer: cfg.renderer || config.renderer,
    };
    return pic(cc, regis);
  }

  /**
   * Plugin registry
   */
  picassojs.use = (plugin: Plugin, options = {}) => usePlugin(plugin, options, regis);

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
  picassojs.chart = (definition: ChartDefinition): Chart =>
    chart(definition, { registries: regis, logger, style: config.style, palettes: config.palettes });

  picassojs.config = () => config;

  picassojs.component = regis.component;

  picassojs.data = regis.data;

  picassojs.formatter = regis.formatter;

  picassojs.interaction = regis.interaction;

  picassojs.scale = regis.scale;

  /**
   * Renderer registry
   * @example
   * const svgFactory = picassojs.renderer('svg');
   * const svgRenderer = svgFactory();
   */
  picassojs.renderer = regis.renderer;

  /**
   * picasso.js version
   */
  picassojs.version = about.version;

  return picassojs;
}

const p = pic(
  { renderer: { prio: ['svg', 'canvas'] }, logger: { level: 0 }, style, palettes },
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
