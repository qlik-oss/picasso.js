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

const SHORTEN_HC = (path: string): string => `${path.substr(0, path.indexOf('/qHyperCubeDef') + 14)}`; // 14 = length of '/qHyperCubeDef'
const SHORTEN_TD = (path: string): string => `${path.substr(0, path.indexOf('/qTreeDataDef') + 13)}`; // 13 = length of '/qTreeDataDef'

type ExtractFieldResult = {
  path: string;
  dimensionIdx: number;
  measureIdx: number;
};

export function extractFieldFromId(id: string, layout?: QLayout): ExtractFieldResult {
  let path = id;
  let dimensionIdx = -1;
  let measureIdx = -1;
  let pathToCube = '';
  let shortenizer = (p: string): string => p;
  if (HC_RX.test(id)) {
    pathToCube = `${path.substr(0, path.indexOf('qHyperCube') + 10)}`; // 10 = length of 'qHyperCube'
    shortenizer = SHORTEN_HC;
  } else if (TD_RX.test(id)) {
    pathToCube = `${path.substr(0, path.indexOf('qTreeData') + 9)}`; // 9 = length of 'qTreeData'
    shortenizer = SHORTEN_TD;
  }

  let shortenPath = true;

  if (DIM_RX.test(id)) {
    const match = DIM_RX.exec(id);
    dimensionIdx = +(match?.[1] ?? -1);
  }

  if (M_RX.test(id)) {
    const match = M_RX.exec(id);
    measureIdx = +(match?.[1] ?? -1);
  }

  if (ATTR_DIM_RX.test(id)) {
    measureIdx = -1;
    dimensionIdx = 0;
    const match = ATTR_DIM_RX.exec(path);
    const attrCol = +(match?.[2] ?? 'NaN');
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
          .reduce((v: number, dim: DimensionInfo) => v + (dim.qAttrExprInfo?.length ?? 0), measureIdx);
        dimensionIdx = -1;
      } else {
        measureIdx = hc.qDimensionInfo.reduce((v: number, dim: DimensionInfo) => v + (dim.qAttrExprInfo?.length ?? 0), measureIdx);
        // offset by total number of attr expr in measures before 'index'
        measureIdx = hc.qMeasureInfo.slice(0, offset).reduce((v: number, meas: MeasureInfo) => v + (meas.qAttrExprInfo?.length ?? 0), measureIdx);
      }

      // offset by the actual column value for the attribute expression itself
      const match = ATTR_EXPR_RX.exec(path);
      measureIdx += +(match?.[1] ?? 0);
    } else if (dimensionIdx > -1) {
      dimensionIdx = -1;
      const match = ATTR_EXPR_RX.exec(path);
      measureIdx = +(match?.[1] ?? 0);
    } else {
      const match = ATTR_EXPR_RX.exec(path);
      measureIdx += +(match?.[1] ?? 0) + 1;
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
 * @param {boolean} [opts.orMode=true] If false, combine measure range selections.
 * @param {object} [layout] QIX data layout. Needed only when brushing on attribute expressions, to be able to calculate the measure index.
 * @return {object[]} An array of relevant selections
 */
type BrushItem = {
  id: string;
  type: string;
  brush: {
    ranges(): Array<{ min: number; max: number; [key: string]: unknown }>;
    values(): unknown[];
  };
  cells?: unknown[];
  [key: string]: unknown;
};

type MethodEntry = {
  path: string;
  ranges?: Array<{ [key: string]: unknown }>;
  values?: unknown[];
  cols?: unknown[];
  cells?: Array<{ [key: string]: unknown }>;
};

type DimensionInfo = {
  qAttrExprInfo?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

type MeasureInfo = {
  qAttrExprInfo?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

type QLayout = {
  qHyperCube?: {
    qMode?: string;
    qNoOfLeftDims?: number;
    qEffectiveInterColumnSortOrder?: number[];
    qDimensionInfo?: DimensionInfo[];
    qMeasureInfo?: MeasureInfo[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export default function qBrush(
  brush: { isActive(): boolean; brushes(): BrushItem[]; [key: string]: unknown },
  opts: { byCells?: boolean; primarySource?: string; [key: string]: unknown } = {},
  layout?: QLayout
) {
  const byCells = opts.byCells;
  const primarySource = opts.primarySource;
  const selections = [];
  const methods: Record<string, MethodEntry> = {};
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
        const rangesArray = methods.multiRangeSelectTreeDataValues.ranges!;
        ranges.forEach((range) =>
          rangesArray.push({
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
          const rangesArray = methods.rangeSelectHyperCubeValues.ranges!;
          ranges.forEach((range) =>
            rangesArray.push({
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
          const rangesArray = methods.selectHyperCubeContinuousRange.ranges!;
          ranges.forEach((range) =>
            rangesArray.push({
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
            const noOfLeftDims = hyperCube.qNoOfLeftDims ?? 0;
            const dimInterColSortIdx = (hyperCube.qEffectiveInterColumnSortOrder ?? []).indexOf(info.dimensionIdx);

            if (!methods.selectPivotCells) {
              methods.selectPivotCells = {
                path: info.path,
                cells: [],
              };
            }

            if (b.id === primarySource || !primarySource) {
              const validValues = b.brush
                .values()
                .map((s: unknown) => Number(s))
                .filter((v: number) => !isNaN(v));

              const cellsArray = methods.selectPivotCells.cells!;
              if ((noOfLeftDims === 0 || dimInterColSortIdx >= noOfLeftDims) && noOfLeftDims > -1) {
                validValues.forEach((val) => {
                  cellsArray.push({
                    qType: 'T',
                    qCol: val,
                    qRow: dimInterColSortIdx - noOfLeftDims,
                  });
                });
              } else {
                validValues.forEach((val) => {
                  cellsArray.push({
                    qType: 'L',
                    qCol: info.dimensionIdx,
                    qRow: val,
                  });
                });
              }
              hasValues = !!cellsArray.length;
            }
          } else {
            if (!methods.selectHyperCubeCells) {
              methods.selectHyperCubeCells = {
                path: info.path,
                cols: [],
              };
            }

            const colsArray = methods.selectHyperCubeCells.cols!;
            colsArray.push(info.dimensionIdx);
            if (b.id === primarySource || (!primarySource && !methods.selectHyperCubeCells.values)) {
              methods.selectHyperCubeCells.values = b.brush
                .values()
                .map((s: unknown) => Number(s))
                .filter((v: number) => !isNaN(v));
              hasValues = !!methods.selectHyperCubeCells.values.length;
            }
          }
        } else {
          const values = b.brush
            .values()
            .map((s: unknown) => Number(s))
            .filter((v: number) => !isNaN(v));
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
      params: [
        methods.rangeSelectHyperCubeValues.path,
        methods.rangeSelectHyperCubeValues.ranges,
        [],
        opts.orMode ?? true,
      ],
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
