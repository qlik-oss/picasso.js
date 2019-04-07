import extend from 'extend';
import {
  area,
  curveLinear,
  curveStep,
  curveStepAfter,
  curveStepBefore,
  curveBasis,
  curveCardinal,
  curveCatmullRom,
  curveMonotoneX,
  curveMonotoneY,
  curveNatural
} from 'd3-shape';

const CURVES = {
  step: curveStep,
  stepAfter: curveStepAfter,
  stepBefore: curveStepBefore,
  linear: curveLinear,
  basis: curveBasis,
  cardinal: curveCardinal.tension(0),
  catmullRom: curveCatmullRom,
  monotonex: curveMonotoneX,
  monotoney: curveMonotoneY,
  natural: curveNatural
};

/**
 * @callback component--line~layerSort
 * @param {object} a
 * @param {string} a.id
 * @param {Array<datum-extract>} a.data
 * @param {object} b
 * @param {string} b.id
 * @param {Array<datum-extract>} b.data
 */

/**
 * @typedef {object}
 * @alias component--line-settings
 */
const SETTINGS = {
  /**
   * @typedef {object}
   */
  coordinates: {
    /**
     * @type {number} */
    minor: 0.5,
    /**
     * @type {number} */
    major: 0.5,
    /**
     * @type {number=} */
    layerId: 0
  },
  /**
   * @type {string=} */
  orientation: 'horizontal',
  /**
   * @typedef {object} */
  layers: {
    /**
     * @type {string=} */
    curve: 'linear',
    /**
     * @type {boolean=} */
    show: true,
    /**
     * @type {component--line~layerSort=} */
    sort: undefined,
    /**
     * @typedef {object} */
    line: {
      /**
       * @type {string=} */
      stroke: '#ccc',
      /**
       * @type {number=} */
      strokeWidth: 1,
      /**
       * @type {string=} */
      strokeLinejoin: 'miter',
      /**
       * @type {string=} */
      strokeDasharray: undefined,
      /**
       * @type {number=} */
      opacity: 1,
      /**
       * @type {boolean=} */
      show: true
    },
    /**
     * @typedef {object} */
    area: {
      /**
       * @type {string=} */
      fill: '#ccc',
      /**
       * @type {number=} */
      opacity: 0.8,
      /**
       * @type {boolean=} */
      show: true
    }
  }
};

function createDisplayLayer(points, {
  generator,
  item,
  data
}, fill = '') {
  const path = generator(points);
  const d = {
    type: 'path',
    d: path,
    opacity: item.opacity,
    stroke: item.stroke,
    strokeWidth: item.strokeWidth,
    strokeLinejoin: item.strokeLinejoin,
    fill: fill || item.fill,
    data
  };

  if (item.strokeDasharray) {
    d.strokeDasharray = item.strokeDasharray;
  }

  return d;
}

function createDisplayLayers(layers, {
  width,
  height,
  missingMinor0,
  stngs
}) {
  const nodes = [];
  const layerStngs = stngs.layers || {};
  layers.forEach((layer) => {
    const {
      lineObj, layerObj, areaObj, points
    } = layer;

    const areaGenerator = area();
    let lineGenerator;
    let secondaryLineGenerator;
    let minor = { size: height, p: 'y' };
    let major = { size: width, p: 'x' };
    if (stngs.orientation === 'vertical') {
      const temp = extend(true, {}, major);
      major = extend(true, {}, minor);
      minor = extend(true, {}, temp);
    }

    areaGenerator
      [major.p](d => d.major * major.size) // eslint-disable-line no-unexpected-multiline
      [`${minor.p}1`](d => d.minor * minor.size) // eslint-disable-line no-unexpected-multiline
      [`${minor.p}0`](d => d.minor0 * minor.size) // eslint-disable-line no-unexpected-multiline
      .defined(d => typeof d.minor === 'number' && !isNaN(d.minor))
      .curve(CURVES[layerObj.curve === 'monotone' ? `monotone${major.p}` : layerObj.curve]);
    lineGenerator = areaGenerator[`line${minor.p.toUpperCase()}1`]();
    secondaryLineGenerator = areaGenerator[`line${minor.p.toUpperCase()}0`]();

    // area layer
    if (layerStngs.area && areaObj.show !== false) {
      nodes.push(createDisplayLayer(points, {
        data: layer.firstPoint,
        item: areaObj,
        generator: areaGenerator
      }));
    }

    // main line layer
    if (lineObj && lineObj.show !== false) {
      nodes.push(createDisplayLayer(points, {
        data: layer.firstPoint,
        item: lineObj,
        generator: lineGenerator
      }, 'none'));

      // secondary line layer, used only when rendering area
      if (!missingMinor0 && layerStngs.area && areaObj.show !== false) {
        nodes.push(createDisplayLayer(points, {
          data: layer.firstPoint,
          item: lineObj,
          generator: secondaryLineGenerator
        }, 'none'));
      }
    }
  });

  return nodes;
}

function resolve({
  data,
  stngs,
  rect,
  resolver,
  style
}) {
  const { width, height } = rect;
  const coordinates = resolver.resolve({
    data,
    defaults: SETTINGS.coordinates,
    settings: stngs.coordinates || {},
    scaled: {
      major: stngs.orientation === 'vertical' ? height : width,
      minor: stngs.orientation === 'vertical' ? width : height
    }
  });

  // collect points into layers
  const layerIds = {};
  let numLines = 0;
  for (let i = 0; i < coordinates.items.length; i++) {
    let p = coordinates.items[i];
    let lid = p.layerId;
    layerIds[lid] = layerIds[lid] || {
      order: numLines++, id: lid, items: [], firstPoint: p.data
    };
    layerIds[lid].items.push(p);
  }

  const metaLayers = Object.keys(layerIds).map(lid => layerIds[lid]);
  const layersData = { items: metaLayers.map(layer => layer.firstPoint) };
  const layerStngs = stngs.layers || {};

  const layersResolved = resolver.resolve({
    data: layersData,
    defaults: {
      curve: SETTINGS.layers.curve,
      show: SETTINGS.layers.show
    },
    settings: {
      curve: layerStngs.curve,
      show: layerStngs.show
    }
  });

  const linesResolved = resolver.resolve({
    data: layersData,
    defaults: extend({}, SETTINGS.layers.line, style.line),
    settings: layerStngs.line
  });

  const areasResolved = resolver.resolve({
    data: layersData,
    defaults: extend({}, SETTINGS.layers.area, style.area),
    settings: layerStngs.area
  });

  return {
    coordinates,
    metaLayers,
    layers: layersResolved,
    lines: linesResolved,
    areas: areasResolved
  };
}

function calculateVisibleLayers(opts) {
  const {
    metaLayers,
    coordinates,
    layers,
    lines,
    areas
  } = resolve(opts);

  const visibleLayers = [];
  metaLayers.forEach((layer, ix) => {
    const layerObj = layers.items[ix];
    if (layerObj.show === false) {
      return;
    }

    // layerObj.points = [];
    layerObj.datum = layerObj.data;
    layerObj.data = [];
    layerObj.id = layer.id;

    const values = [];
    const points = [];
    let point;
    let pData;
    for (let i = 0; i < layer.items.length; i++) {
      point = layer.items[i];
      pData = point.data;
      if (isNaN(point.major)) {
        continue;
      }
      if (opts.missingMinor0) {
        point.minor0 = coordinates.settings.minor.scale ? coordinates.settings.minor.scale(pData.minor0 ? pData.minor0.value : 0) : 0;
      }
      if (!isNaN(point.minor)) {
        values.push(point.minor);
      }
      points.push(point);
      layerObj.data.push(point.data);
    }

    const median = values.sort((a, b) => a - b)[Math.floor((values.length - 1) / 2)];

    visibleLayers.push({
      layerObj,
      lineObj: lines.items[ix],
      areaObj: areas.items[ix],
      median,
      points,
      firstPoint: layer.firstPoint
    });
  });

  return visibleLayers;
}

const lineMarkerComponent = {
  require: ['chart', 'resolver'],
  defaultSettings: {
    style: {
      area: '$shape',
      line: '$shape-outline'
    }
  },
  created() {
  },
  render({ data }) {
    const { width, height } = this.rect;
    this.stngs = this.userSettings.settings || {};
    const missingMinor0 = !this.stngs.coordinates || typeof this.stngs.coordinates.minor0 === 'undefined';

    const visibleLayers = calculateVisibleLayers({
      data,
      stngs: this.stngs,
      rect: this.rect,
      resolver: this.resolver,
      style: this.style,
      missingMinor0
    });

    if (this.stngs.layers && this.stngs.layers.sort) {
      const sortable = visibleLayers.map(v => ({
        id: v.layerObj.id,
        data: v.layerObj.data
      }));
      sortable.sort(this.stngs.layers.sort).map(s => s.id);
      visibleLayers.sort((a, b) => sortable.indexOf(b.layerObj.id) - sortable.indexOf(a.layerObj.id));
    } else {
      visibleLayers.sort((a, b) => a.median - b.median);
    }

    // generate visuals
    return createDisplayLayers(visibleLayers, {
      width,
      height,
      missingMinor0,
      stngs: this.stngs
    });
  }
};

export default lineMarkerComponent;
