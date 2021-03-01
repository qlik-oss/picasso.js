import resolve from '../json-path-resolver';

const LAYOUT_TO_PROP = [
  ['qHyperCube', 'qHyperCubeDef'],
  ['qTreeData', 'qTreeDataDef'],
  ['qDimensionInfo', 'qDimensions'],
  ['qMeasureInfo', 'qMeasures'],
  ['qAttrDimInfo', 'qAttributeDimensions'],
  ['qAttrExprInfo', 'qAttributeExpressions'],
];

const DIM_RX = /\/qDimensionInfo(?:\/(\d+))?/;
const M_RX = /\/qMeasureInfo\/(\d+)/;
const ATTR_DIM_RX = /\/qAttrDimInfo\/(\d+)(?:\/(\d+))?/;
const ATTR_EXPR_RX = /\/qAttrExprInfo\/(\d+)/;
const HC_RX = /\/?qHyperCube/;
const TD_RX = /\/?qTreeData/;

const SHORTEN_HC = (path) => `${path.substr(0, path.indexOf('/qHyperCubeDef') + 14)}`; // 14 = length of '/qHyperCubeDef'
const SHORTEN_TD = (path) => `${path.substr(0, path.indexOf('/qTreeDataDef') + 13)}`; // 13 = length of '/qTreeDataDef'

export function extractFieldFromId(id, layout) {
  let path = id;
  let dimensionIdx = -1;
  let measureIdx = -1;
  let pathToCube = '';
  let shortenizer = (p) => p;
  if (HC_RX.test(id)) {
    pathToCube = `${path.substr(0, path.indexOf('qHyperCube') + 10)}`; // 10 = length of 'qHyperCube'
    shortenizer = SHORTEN_HC;
  } else if (TD_RX.test(id)) {
    pathToCube = `${path.substr(0, path.indexOf('qTreeData') + 9)}`; // 9 = length of 'qTreeData'
    shortenizer = SHORTEN_TD;
  }

  let shortenPath = true;

  if (DIM_RX.test(id)) {
    dimensionIdx = +DIM_RX.exec(id)[1];
  }

  if (M_RX.test(id)) {
    measureIdx = +M_RX.exec(id)[1];
  }

  if (ATTR_DIM_RX.test(id)) {
    measureIdx = -1;
    dimensionIdx = 0;
    const attrCol = +ATTR_DIM_RX.exec(path)[2];
    if (!isNaN(attrCol)) {
      dimensionIdx = attrCol;
      path = path.replace(/\/\d+$/, '');
    }
    shortenPath = false;
  }

  if (ATTR_EXPR_RX.test(id)) {
    // depends on number of measures + number of attr expressions
    // in dimensions and measures before this one
    const offset = measureIdx;
    if (layout) {
      measureIdx = 0;
      const hc = resolve(pathToCube, layout);

      // offset by number of measures
      measureIdx += (hc.qMeasureInfo || []).length;

      // offset by total number of attr expr in dimensions
      // (assuming attr expr in dimensions are ordered first)
      if (dimensionIdx > -1) {
        measureIdx = hc.qDimensionInfo
          .slice(0, dimensionIdx)
          .reduce((v, dim) => v + dim.qAttrExprInfo.length, measureIdx);
        dimensionIdx = -1;
      } else {
        measureIdx = hc.qDimensionInfo.reduce((v, dim) => v + dim.qAttrExprInfo.length, measureIdx);
        // offset by total number of attr expr in measures before 'index'
        measureIdx = hc.qMeasureInfo.slice(0, offset).reduce((v, meas) => v + meas.qAttrExprInfo.length, measureIdx);
      }

      // offset by the actual column value for the attribute expression itself
      measureIdx += +ATTR_EXPR_RX.exec(path)[1];
    } else if (dimensionIdx > -1) {
      dimensionIdx = -1;
      measureIdx = +ATTR_EXPR_RX.exec(path)[1];
    } else {
      measureIdx += +ATTR_EXPR_RX.exec(path)[1] + 1;
    }
  }

  LAYOUT_TO_PROP.forEach(([v, prop]) => {
    path = path.replace(v, prop);
  });

  if (shortenPath) {
    path = shortenizer(path);
  }

  if (path && path[0] !== '/') {
    path = `/${path}`;
  }

  return {
    measureIdx,
    dimensionIdx,
    path,
  };
}

/**
 * Helper method to generate suitable QIX selection methods and parameters based on a brush instance.
 * @alias brush
 * @memberof picasso.q
 * @param {Brush} brush A brush instance
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
    if (b.type === 'range' && info.measureIdx > -1 && info.dimensionIdx > -1) {
      const ranges = b.brush.ranges();
      if (ranges.length) {
        hasValues = true;
        if (!methods.multiRangeSelectTreeDataValues) {
          methods.multiRangeSelectTreeDataValues = {
            path: info.path,
            ranges: [],
          };
        }
        ranges.forEach((range) =>
          methods.multiRangeSelectTreeDataValues.ranges.push({
            qMeasureIx: info.measureIdx,
            qDimensionIx: info.dimensionIdx,
            qRange: {
              qMin: range.min,
              qMax: range.max,
              qMinInclEq: true,
              qMaxInclEq: true,
            },
          })
        );
      }
    } else {
      if (b.type === 'range' && info.measureIdx > -1) {
        const ranges = b.brush.ranges();
        if (ranges.length) {
          hasValues = true;
          if (!methods.rangeSelectHyperCubeValues) {
            methods.rangeSelectHyperCubeValues = {
              path: info.path,
              ranges: [],
            };
          }
          ranges.forEach((range) =>
            methods.rangeSelectHyperCubeValues.ranges.push({
              qMeasureIx: info.measureIdx,
              qRange: {
                qMin: range.min,
                qMax: range.max,
                qMinInclEq: true,
                qMaxInclEq: true,
              },
            })
          );
        }
      }
      if (b.type === 'range' && info.dimensionIdx > -1) {
        const ranges = b.brush.ranges();
        if (ranges.length) {
          hasValues = true;
          if (!methods.selectHyperCubeContinuousRange) {
            methods.selectHyperCubeContinuousRange = {
              path: info.path,
              ranges: [],
            };
          }
          ranges.forEach((range) =>
            methods.selectHyperCubeContinuousRange.ranges.push({
              qDimIx: info.dimensionIdx,
              qRange: {
                qMin: range.min,
                qMax: range.max,
                qMinInclEq: true,
                qMaxInclEq: false,
              },
            })
          );
        }
      }

      if (b.type === 'value' && info.dimensionIdx > -1) {
        if (byCells) {
          if (
            layout &&
            layout.qHyperCube &&
            (layout.qHyperCube.qMode === 'P' || layout.qHyperCube.qMode === 'T' || layout.qHyperCube.qMode === 'K')
          ) {
            const hyperCube = layout.qHyperCube;
            const noOfLeftDims = hyperCube.qNoOfLeftDims;
            const dimInterColSortIdx = hyperCube.qEffectiveInterColumnSortOrder.indexOf(info.dimensionIdx);

            if (!methods.selectPivotCells) {
              methods.selectPivotCells = {
                path: info.path,
                cells: [],
              };
            }

            if (b.id === primarySource || !primarySource) {
              const validValues = b.brush
                .values()
                .map((s) => +s)
                .filter((v) => !isNaN(v));

              if ((noOfLeftDims === 0 || dimInterColSortIdx >= noOfLeftDims) && noOfLeftDims > -1) {
                validValues.forEach((val) => {
                  methods.selectPivotCells.cells.push({
                    qType: 'T',
                    qCol: val,
                    qRow: dimInterColSortIdx - noOfLeftDims,
                  });
                });
              } else {
                validValues.forEach((val) => {
                  methods.selectPivotCells.cells.push({
                    qType: 'L',
                    qCol: info.dimensionIdx,
                    qRow: val,
                  });
                });
              }
              hasValues = !!methods.selectPivotCells.cells.length;
            }
          } else {
            if (!methods.selectHyperCubeCells) {
              methods.selectHyperCubeCells = {
                path: info.path,
                cols: [],
              };
            }

            methods.selectHyperCubeCells.cols.push(info.dimensionIdx);
            if (b.id === primarySource || (!primarySource && !methods.selectHyperCubeCells.values)) {
              methods.selectHyperCubeCells.values = b.brush
                .values()
                .map((s) => +s)
                .filter((v) => !isNaN(v));
              hasValues = !!methods.selectHyperCubeCells.values.length;
            }
          }
        } else {
          const values = b.brush
            .values()
            .map((s) => +s)
            .filter((v) => !isNaN(v));
          hasValues = !!values.length;
          selections.push({
            params: [info.path, info.dimensionIdx, values, false],
            method: 'selectHyperCubeValues',
          });
        }
      }
    }
  });

  if (!hasValues && isActive) {
    return [
      {
        method: 'resetMadeSelections',
        params: [],
      },
    ];
  }

  if (methods.rangeSelectHyperCubeValues) {
    selections.push({
      method: 'rangeSelectHyperCubeValues',
      params: [methods.rangeSelectHyperCubeValues.path, methods.rangeSelectHyperCubeValues.ranges, [], true],
    });
  }

  if (methods.selectHyperCubeContinuousRange) {
    selections.push({
      method: 'selectHyperCubeContinuousRange',
      params: [methods.selectHyperCubeContinuousRange.path, methods.selectHyperCubeContinuousRange.ranges],
    });
  }

  if (methods.selectHyperCubeCells) {
    selections.push({
      method: 'selectHyperCubeCells',
      params: [
        methods.selectHyperCubeCells.path,
        methods.selectHyperCubeCells.values,
        methods.selectHyperCubeCells.cols,
      ],
    });
  }

  if (methods.selectPivotCells) {
    selections.push({
      method: 'selectPivotCells',
      params: [methods.selectPivotCells.path, methods.selectPivotCells.cells],
    });
  }

  if (methods.multiRangeSelectTreeDataValues) {
    selections.push({
      method: 'multiRangeSelectTreeDataValues',
      params: [methods.multiRangeSelectTreeDataValues.path, methods.multiRangeSelectTreeDataValues.ranges],
    });
  }

  return selections;
}
