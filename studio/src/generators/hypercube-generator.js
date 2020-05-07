/* eslint no-prototype-builtins: 0 */
/* eslint no-continue: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint no-nested-ternary: 0 */
/* eslint no-confusing-arrow: 0 */
/* eslint no-mixed-operators: 0 */

/**
 * HypercubeGenerator
 * Ripped apart from sense-client repo
 * Originally created by MEK
 * Modified by BGE for ES6 & Picasso
 */
class HypercubeGenerator {
  /**
   * Get all unique values in an array
   *
   * @return {Array}   All unique variables
   */
  arrayGetUnique() {
    const u = {};
    const a = [];

    for (let i = 0, l = this.length; i < l; ++i) {
      if (u.hasOwnProperty(this[i])) {
        continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
    }

    return a;
  }

  generateDimensionInfoFromData(data, label) {
    const numUnique = this.arrayGetUnique.call(data).length;
    const glyphCount = Math.max(...data.map((text) => (text ? text.length : 0)));
    const info = {
      othersLabel: 'Otheeeeers',
      qApprMaxGlyphCount: glyphCount,
      qCardinal: numUnique,
      qDimensionType: 'D',
      qFallbackTitle: label,
      qGroupFallbackTitles: [label],
      qGroupPos: 0,
      qGrouping: 'N',
      qSortIndicator: 'N',
      qStateCounts: {
        qAlternative: 0,
        qDeselected: 0,
        qExcluded: 0,
        qLocked: 0,
        qOption: numUnique,
        qSelected: 0,
      },
    };

    return info;
  }

  generateMeasureInfoFromData(data, label) {
    const len = data ? data.length : 0;
    const glyphCount = Math.max(...data.map((value) => `${value}`.length));
    const max = Math.max(...data);
    const min = Math.min(...data);
    const info = {
      qApprMaxGlyphCount: glyphCount,
      qCardinal: len,
      qFallbackTitle: label,
      qMax: max,
      qMin: min,
      qNumFormat: {
        qDec: '.',
        qFmt: '#,###.#',
        qThou: ',',
        qUseThou: 0,
        qnDec: 1,
      },
      qSortIndicator: 'N',
    };

    return info;
  }

  /**
   * Extract all values of a column in a 2d array
   *
   * @param  {Integer} columnIndex   The column index
   * @param  {Array} arr             Specified array
   * @return {Array}                 Values from column
   */
  extractColumnFrom2DArray(columnIndex, arr) {
    const column = [];

    arr.forEach((row) => {
      column.push(row[columnIndex]);
    });

    return column;
  }

  /**
   * Turn a 2d array into a hypercube json object
   *
   * @param  {Array} arr 2d array
   * @return {Array}     hypercube array
   */
  generateDataFromArray(arr) {
    let i;
    let j;
    let numDim = 0;
    let numRows;
    const matrix = [];
    let row;

    numRows = arr ? arr.length : 0;
    const numCols = numRows && arr[0] ? arr[0].length : 0;

    const types = arr.splice(0, 1)[0]; // first row should contain type (dimension, measure)
    const labels = arr.splice(0, 1)[0]; // second row should contain labels

    numRows -= 2;

    const data = {
      qHyperCube: {
        qDataPages: [
          {
            qArea: {},
            qMatrix: [],
            qTails: [
              {
                qDown: 0,
                qUp: 0,
              },
            ],
          },
        ],
        qDimensionInfo: [],
        qMeasureInfo: [],
        qMode: 'S',
        qSize: {
          qcx: numCols,
          qcy: numRows,
        },
      },
    };

    const elemMap = [];
    const elemSize = [];

    for (i = 0; i < numCols; i++) {
      if (types[i] === 'd') {
        numDim++;
        elemMap.push({});
        elemSize.push(0);
        data.qHyperCube.qDimensionInfo.push(
          this.generateDimensionInfoFromData(this.extractColumnFrom2DArray(i, arr), labels[i])
        );
      } else {
        data.qHyperCube.qMeasureInfo.push(
          this.generateMeasureInfoFromData(this.extractColumnFrom2DArray(i, arr), labels[i])
        );
      }
    }

    function getElemNo(string, dim) {
      const map = elemMap[dim];
      if (map[string] === undefined) {
        map[string] = elemSize[dim]++;
      }
      return map[string];
    }

    for (i = 0; i < numRows; i++) {
      row = [];
      for (j = 0; j < numDim; j++) {
        row.push({
          qElemNumber: getElemNo(arr[i][j], j),
          qNum: parseFloat(arr[i][j]),
          qState: 'S',
          qText: arr[i][j],
        });
      }

      for (; j < numCols; j++) {
        row.push({
          qElemNumber: 0,
          qNum: arr[i][j],
          qState: 'L',
          qText: `${arr[i][j]}`,
        });
      }
      matrix.push(row);
    }

    data.qHyperCube.qDataPages[0].qMatrix = matrix;
    data.qHyperCube.qDataPages[0].qArea = {
      qTop: 0,
      qLeft: 0,
      qWidth: numCols,
      qHeight: numRows,
    };

    data.color = {
      auto: true,
    };

    return data;
  }

  /**
   * Generate a random 2d array with random values 0-1
   *
   * @param  {Integer} width  The width of the 2d array
   * @param  {Integer} height The height of the 2d array
   * @return {Array}          2d-generated array
   */
  random2dArr(width, height, manipulateRow, manipulatePoint) {
    return Array(height)
      .fill(undefined)
      .map((vy, y) => {
        let rowData = Array(width)
          .fill(undefined)
          .map((vx, x) => manipulatePoint.call(this, x, y, width, height));
        if (manipulateRow && typeof manipulateRow === 'function') {
          rowData = manipulateRow.call(this, rowData);
        }
        return rowData;
      });
  }

  /**
   * Replace random values with null, defaults to approx 10%
   *
   * @param  {Array} arr Input array
   * @param  {Number} chance Percentage of null values
   * @return {Array}     Modified array
   */
  randomNullInsert(arr, chance = 0.1) {
    return arr.map((v) => (Math.random() <= chance ? null : v));
  }

  /**
   * Generate random data for usage with generateDataFromArray
   *
   * @param  {Integer} dimensions The number of dimensions to be generated
   * @param  {Integer} measures   The number of measures
   * @param  {Integer} rows       The number of rows
   * @param  {Boolean} sorted     If the rows are supposed to be sorted or not
   * @return {Array}              2d Array
   */
  generateRandomData(dimensions, measures, rows, sorted = false) {
    return [
      [...Array(dimensions).fill('d'), ...Array(measures).fill('m')],
      ...this.random2dArr(
        dimensions + measures,
        rows + 1,
        sorted ? (row) => row.sort() : null,
        (x, y, width, height) => (!sorted ? ((x / width) * y) / height : 1) * Math.random()
      ),
    ];
  }

  /**
   * Generate custom data for usage with generateDataFromArray
   *
   * @param  {Integer} dimensions The number of dimensions to be generated
   * @param  {Integer} measures   The number of measures
   * @param  {Integer} rows       The number of rows
   * @param  {Function} callback  Custom callback for generating values
   * @return {Array}              2d Array
   */
  generateCustomData(dimensions, measures, rows, rowcallback, pointcallback) {
    return [
      [...Array(dimensions).fill('d'), ...Array(measures).fill('m')],
      ...this.random2dArr(dimensions + measures, rows + 1, rowcallback, pointcallback),
    ];
  }
}

export default new HypercubeGenerator();
