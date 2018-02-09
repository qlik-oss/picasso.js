import resolve from '../json-path-resolver';

const LAYOUT_TO_PROP = [
  ['qHyperCube', 'qHyperCubeDef'],
  ['qDimensionInfo', 'qDimensions'],
  ['qMeasureInfo', 'qMeasures'],
  ['qAttrDimInfo', 'qAttributeDimensions'],
  ['qAttrExprInfo', 'qAttributeExpressions']
];


const DIM_RX = /\/qDimensionInfo(?:\/(\d+))?/;
const M_RX = /\/qMeasureInfo\/(\d+)/;
const ATTR_DIM_RX = /\/qAttrDimInfo\/(\d+)(?:\/(\d+))?/;
const ATTR_EXPR_RX = /\/qAttrExprInfo\/(\d+)/;

export function extractFieldFromId(id, layout) {
  let isDimension = false;
  let index = 0;
  let path = id;
  const pathToHC = `${path.substr(0, path.indexOf('qHyperCube') + 10)}`; // 10 = length of 'qHyperCube'

  let shortenPath = true;

  if (DIM_RX.test(id)) {
    index = +DIM_RX.exec(id)[1];
    const attr = id.replace(DIM_RX, '');
    isDimension = true;
    if (ATTR_DIM_RX.test(attr)) {
      index = 0; // default to 0
      const attrDimColIdx = +ATTR_DIM_RX.exec(path)[2];
      if (!isNaN(attrDimColIdx)) { // use column index if specified
        index = attrDimColIdx;
        path = path.replace(/\/\d+$/, '');
      }
      shortenPath = false;
    } else if (ATTR_EXPR_RX.test(attr)) {
      // attrIdx depends on number of measures + number of attr expressions
      // in dimensions before this one
      let attrIdx = 0;
      if (layout) {
        const hc = resolve(pathToHC, layout);

        // offset by number of measures
        attrIdx += hc.qMeasureInfo.length;

        // offset by total number of attr expr in dimensions
        // (assuming attr expr in dimensions are ordered first)
        attrIdx = hc.qDimensionInfo
          .slice(0, index)
          .reduce((v, dim) => v + dim.qAttrExprInfo.length, attrIdx);

        // offset by the actual column value for the attribute expression itself
        attrIdx += +ATTR_EXPR_RX.exec(path)[1];

        index = attrIdx;
        isDimension = false;
      }
    }
  } else if (M_RX.test(id)) {
    index = +M_RX.exec(id)[1];
    isDimension = false;
    const attr = id.replace(M_RX, '');
    if (ATTR_DIM_RX.test(attr)) {
      index = 0; // default to 0
      const attrDimColIdx = +ATTR_DIM_RX.exec(path)[2];
      if (!isNaN(attrDimColIdx)) { // use column index if specified
        index = attrDimColIdx;
        path = path.replace(/\/\d+$/, '');
      }
      shortenPath = false;
      isDimension = true;
    } else if (ATTR_EXPR_RX.test(attr)) {
      // depends on number of measures + number of attr expressions
      // in dimensions and measures before this one
      let attrIdx = 0;
      if (layout) {
        const hc = resolve(pathToHC, layout);

        // offset by number of measures
        attrIdx += hc.qMeasureInfo.length;

        // offset by total number of attr expr in dimensions
        // (assuming attr expr in dimensions are ordered first)
        attrIdx = hc.qDimensionInfo.reduce((v, dim) => v + dim.qAttrExprInfo.length, attrIdx);

        // offset by total number of attr expr in measures before 'index'
        attrIdx = hc.qMeasureInfo
          .slice(0, index)
          .reduce((v, meas) => v + meas.qAttrExprInfo.length, attrIdx);

        // offset by the actual column value for the attribute expression itself
        attrIdx += +ATTR_EXPR_RX.exec(path)[1];

        index = attrIdx;
      }
    }
  }

  LAYOUT_TO_PROP.forEach(([v, prop]) => {
    path = path.replace(v, prop);
  });

  if (shortenPath) {
    path = `${path.substr(0, path.indexOf('/qHyperCubeDef') + 14)}`; // 14 = length of '/qHyperCubeDef'
  }

  if (path && path[0] !== '/') {
    path = `/${path}`;
  }

  return {
    index,
    path,
    type: isDimension ? 'dimension' : 'measure'
  };
}

/**
 * Helper method to generate suitable QIX selection methods and parameters based on a brush instance.
 * @alias brush
 * @memberof picasso.q
 * @param {brush} brush A brush instance
 * @param {object} [opts]
 * @param {boolean} [opts.byCells=false] Whether to prefer selection by row index.
 * @param {string} [opts.primarySource] Field source to extract row indices from. If not specified, indices from first source are used.
 * @param {object} [layout] QIX data layout. Needed only when brushing on attribute expressions, to be able to calculate the measure index.
 * @return {object[]} An array of relevant selections
 */
export default function qBrush(brush, opts = {}, layout) {
  const byCells = opts.byCells;
  const primarySource = opts.primarySource;
  const selections = [];
  const methods = {};
  const isActive = brush.isActive();
  let hasValues = false;
  brush.brushes().forEach((b) => {
    const info = extractFieldFromId(b.id, layout);
    if (b.type === 'range' && info.type === 'measure') {
      const ranges = b.brush.ranges();
      if (ranges.length) {
        hasValues = true;
        if (!methods.rangeSelectHyperCubeValues) {
          methods.rangeSelectHyperCubeValues = {
            path: info.path,
            ranges: []
          };
        }
        ranges.forEach(range => methods.rangeSelectHyperCubeValues.ranges.push({
          qMeasureIx: info.index,
          qRange: {
            qMin: range.min,
            qMax: range.max,
            qMinInclEq: true,
            qMaxInclEq: true
          }
        }));
      }
    }
    if (b.type === 'range' && info.type === 'dimension') {
      const ranges = b.brush.ranges();
      if (ranges.length) {
        hasValues = true;
        if (!methods.selectHyperCubeContinuousRange) {
          methods.selectHyperCubeContinuousRange = {
            path: info.path,
            ranges: []
          };
        }
        ranges.forEach(range => methods.selectHyperCubeContinuousRange.ranges.push({
          qDimIx: info.index,
          qRange: {
            qMin: range.min,
            qMax: range.max,
            qMinInclEq: true,
            qMaxInclEq: false
          }
        }));
      }
    }
    if (b.type === 'value' && info.type === 'dimension') {
      if (byCells) {
        if (!methods.selectHyperCubeCells) {
          methods.selectHyperCubeCells = {
            path: info.path,
            cols: []
          };
        }

        methods.selectHyperCubeCells.cols.push(info.index);
        if (b.id === primarySource || (!primarySource && !methods.selectHyperCubeCells.values)) {
          methods.selectHyperCubeCells.values = b.brush.values()
            .map(s => +s)
            .filter(v => !isNaN(v));
          hasValues = !!methods.selectHyperCubeCells.values.length;
        }
      } else {
        const values = b.brush.values().map(s => +s).filter(v => !isNaN(v));
        hasValues = !!values.length;
        selections.push({
          params: [info.path, info.index, values, false],
          method: 'selectHyperCubeValues'
        });
      }
    }
  });

  if (!hasValues && isActive) {
    return [{
      method: 'resetMadeSelections',
      params: []
    }];
  }

  if (methods.rangeSelectHyperCubeValues) {
    selections.push({
      method: 'rangeSelectHyperCubeValues',
      params: [methods.rangeSelectHyperCubeValues.path, methods.rangeSelectHyperCubeValues.ranges, [], true]
    });
  }

  if (methods.selectHyperCubeContinuousRange) {
    selections.push({
      method: 'selectHyperCubeContinuousRange',
      params: [methods.selectHyperCubeContinuousRange.path, methods.selectHyperCubeContinuousRange.ranges]
    });
  }

  if (methods.selectHyperCubeCells) {
    selections.push({
      method: 'selectHyperCubeCells',
      params: [
        methods.selectHyperCubeCells.path,
        methods.selectHyperCubeCells.values,
        methods.selectHyperCubeCells.cols
      ]
    });
  }

  return selections;
}
