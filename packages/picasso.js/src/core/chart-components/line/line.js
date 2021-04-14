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
  curveNatural,
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
  natural: curveNatural,
};

/**
 * Callback function for layer sort
 * @callback ComponentLine~LayerSort
 * @param {object} a
 * @param {string} a.id
 * @param {Array<DatumExtract>} a.data
 * @param {object} b
 * @param {string} b.id
 * @param {Array<DatumExtract>} b.data
 */

/**
 * Component settings
 * @typedef {object}
 * @alias ComponentLine.settings
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
    layerId: 0,
    /**
     * @type {DatumBoolean=} */
    defined: true,
  },
  /**
   * @type {boolean=} */
  connect: false,
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
     * @type {ComponentLine~LayerSort=} */
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
      show: true,
      /**
       * @type {boolean=} */
      showMinor0: true,
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
      show: true,
    },
  },
};

function createDisplayLayer(points, { generator, item, data }, fill = '') {
  const path = generator(points);
  const d = {
    type: 'path',
    d: path,
    opacity: item.opacity,
    stroke: item.stroke,
    strokeWidth: item.strokeWidth,
    strokeLinejoin: item.strokeLinejoin,
    fill: fill || item.fill,
    data,
  };

  if (item.strokeDasharray) {
    d.strokeDasharray = item.strokeDasharray;
  }

  return d;
}

function createDisplayLayers(layers, { width, height, missingMinor0, stngs }) {
  const nodes = [];
  const layerStngs = stngs.layers || {};
  layers.forEach((layer) => {
    const { lineObj, layerObj, areaObj, points } = layer;

    const areaGenerator = area();
    const defined = stngs.coordinates ? stngs.coordinates.defined : null;
    let lineGenerator;
    let secondaryLineGenerator;
    let minor = { size: height, p: 'y' };
    let major = { size: width, p: 'x' };
    if (stngs.orientation === 'vertical') {
      const temp = extend(true, {}, major);
      major = extend(true, {}, minor);
      minor = extend(true, {}, temp);
    }

    areaGenerator[major.p]((d) => d.major * major.size) // eslint-disable-line no-unexpected-multiline
      [`${minor.p}1`]((d) => d.minor * minor.size) // eslint-disable-line no-unexpected-multiline
      [`${minor.p}0`]((d) => d.minor0 * minor.size) // eslint-disable-line no-unexpected-multiline
      .curve(CURVES[layerObj.curve === 'monotone' ? `monotone${major.p}` : layerObj.curve]);
    if (defined) {
      areaGenerator.defined((d) => !d.dummy && typeof d.minor === 'number' && !isNaN(d.minor) && d.defined);
    } else {
      areaGenerator.defined((d) => !d.dummy && typeof d.minor === 'number' && !isNaN(d.minor));
    }

    const filteredPoints = stngs.connect ? points.filter(areaGenerator.defined()) : points;
    lineGenerator = areaGenerator[`line${minor.p.toUpperCase()}1`]();
    secondaryLineGenerator = areaGenerator[`line${minor.p.toUpperCase()}0`]();

    // area layer
    if (layerStngs.area && areaObj.show !== false) {
      nodes.push(
        createDisplayLayer(filteredPoints, {
          data: layer.consumableData,
          item: areaObj,
          generator: areaGenerator,
        })
      );
    }

    // main line layer
    if (lineObj && lineObj.show !== false) {
      nodes.push(
        createDisplayLayer(
          filteredPoints,
          {
            data: layer.consumableData,
            item: lineObj,
            generator: lineGenerator,
          },
          'none'
        )
      );

      // secondary line layer, used only when rendering area
      if (!missingMinor0 && layerStngs.area && areaObj.show !== false && lineObj.showMinor0 !== false) {
        nodes.push(
          createDisplayLayer(
            filteredPoints,
            {
              data: layer.consumableData,
              item: lineObj,
              generator: secondaryLineGenerator,
            },
            'none'
          )
        );
      }
    }
  });

  return nodes;
}

function resolve({ data, stngs, rect, resolver, style, domain }) {
  const { width, height } = rect;
  const coordinates = resolver.resolve({
    data,
    defaults: SETTINGS.coordinates,
    settings: stngs.coordinates || {},
    scaled: {
      major: stngs.orientation === 'vertical' ? height : width,
      minor: stngs.orientation === 'vertical' ? width : height,
    },
  });

  // there are two cases when a line should be interrupted:
  // 1. When the minor value is undefined (this case is easily handled by the lineGenerator.defined).
  // 2. When a line is moving over a domain that may not coincide with the domain on the major scale.
  // For the second case, dummy points need to be injected in order to create values which will cause gaps as they fulfill the first case.
  // These dummy points need to be injected only when: the domain is discrete, connect !== false and multiple layers are defined
  const injectDummy =
    !stngs.connect &&
    domain.length > 2 &&
    (typeof stngs.coordinates.layerId === 'function' || typeof stngs.coordinates.layerId === 'object');

  // collect points into layers
  const layerIds = {};
  let numLines = 0;
  for (let i = 0; i < coordinates.items.length; i++) {
    let p = coordinates.items[i];
    let lid = p.layerId;
    if (injectDummy) {
      // inject dummy if the previous point on the major domain is not the same as the prev point on the line's domain.
      // this works only if a datum's value property is the same primitive as in the domain.
      const lastItem = layerIds[lid] ? layerIds[lid].items[layerIds[lid].items.length - 1] : null;
      const lastOrderIdx = lastItem
        ? domain.indexOf(lastItem.data.major ? lastItem.data.major.value : lastItem.data.value)
        : null;
      if (lastItem && domain.indexOf(p.data.major ? p.data.major.value : p.data.value) - 1 !== lastOrderIdx) {
        layerIds[lid].items.push({ dummy: true });
      }
    }
    layerIds[lid] = layerIds[lid] || {
      order: numLines++,
      id: lid,
      items: [],
      dataItems: [],
      consumableData: {},
    };
    layerIds[lid].dataItems.push(p.data);
    layerIds[lid].items.push(p);
  }

  const metaLayers = Object.keys(layerIds).map((lid) => {
    layerIds[lid].consumableData = {
      points: layerIds[lid].dataItems,
      ...layerIds[lid].dataItems[0],
    };
    return layerIds[lid];
  });

  const layersData = {
    items: metaLayers.map((layer) => layer.consumableData),
  };
  const layerStngs = stngs.layers || {};

  const layersResolved = resolver.resolve({
    data: layersData,
    defaults: {
      curve: SETTINGS.layers.curve,
      show: SETTINGS.layers.show,
    },
    settings: {
      curve: layerStngs.curve,
      show: layerStngs.show,
    },
  });

  const linesResolved = resolver.resolve({
    data: layersData,
    defaults: extend({}, SETTINGS.layers.line, style.line),
    settings: layerStngs.line,
  });

  const areasResolved = resolver.resolve({
    data: layersData,
    defaults: extend({}, SETTINGS.layers.area, style.area),
    settings: layerStngs.area,
  });

  return {
    coordinates,
    metaLayers,
    layers: layersResolved,
    lines: linesResolved,
    areas: areasResolved,
  };
}

function calculateVisibleLayers(opts) {
  const { metaLayers, coordinates, layers, lines, areas } = resolve(opts);

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
      if (!point.dummy) {
        if (isNaN(point.major)) {
          continue;
        }
        if (opts.missingMinor0) {
          point.minor0 = coordinates.settings.minor.scale
            ? coordinates.settings.minor.scale(pData.minor0 ? pData.minor0.value : 0)
            : 0;
        }
        if (!isNaN(point.minor)) {
          values.push(point.minor);
        }
        layerObj.data.push(point.data);
      }
      points.push(point);
    }

    const median = values.sort((a, b) => a - b)[Math.floor((values.length - 1) / 2)];

    visibleLayers.push({
      layerObj,
      lineObj: lines.items[ix],
      areaObj: areas.items[ix],
      median,
      points,
      consumableData: layer.consumableData,
    });
  });

  return visibleLayers;
}

const lineMarkerComponent = {
  require: ['chart', 'resolver'],
  defaultSettings: {
    style: {
      area: '$shape',
      line: '$shape-outline',
    },
  },
  created() {},
  render({ data }) {
    // console.log("DATA", data);
    const { width, height } = this.rect;
    this.stngs = this.settings.settings || {};
    const missingMinor0 = !this.stngs.coordinates || typeof this.stngs.coordinates.minor0 === 'undefined';

    const visibleLayers = calculateVisibleLayers({
      data,
      stngs: this.stngs,
      rect: this.rect,
      resolver: this.resolver,
      style: this.style,
      missingMinor0,
      domain:
        this.stngs.coordinates && this.stngs.coordinates.major && this.stngs.coordinates.major.scale
          ? this.chart.scale(this.stngs.coordinates.major.scale).domain()
          : [],
    });

    if (this.stngs.layers && this.stngs.layers.sort) {
      const sortable = visibleLayers
        .map((v) => ({
          id: v.layerObj.id,
          data: v.layerObj.data,
        }))
        .sort(this.stngs.layers.sort)
        .map((s) => s.id);
      visibleLayers.sort((a, b) => sortable.indexOf(a.layerObj.id) - sortable.indexOf(b.layerObj.id));
    } else {
      visibleLayers.sort((a, b) => a.median - b.median);
    }

    // generate visuals
    return createDisplayLayers(visibleLayers, {
      width,
      height,
      missingMinor0,
      stngs: this.stngs,
    });
  },
};

export default lineMarkerComponent;
