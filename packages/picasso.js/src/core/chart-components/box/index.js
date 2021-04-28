import component from './box';

export default function box(picasso) {
  picasso.component('box', component);
  picasso.component('box-marker', component); // temporary backwards compatibility - DEPRECATED
}

/**
 * @typedef {object} ComponentBox
 * @extends ComponentSettings
 * @example
 * {
 *   type: "box",
 *   data: {
 *    mapTo: {
 *      min: { source: "/qHyperCube/qMeasureInfo/0" },
 *      start: { source: "/qHyperCube/qMeasureInfo/1" },
 *      med: { source: "/qHyperCube/qMeasureInfo/2" },
 *      end: { source: "/qHyperCube/qMeasureInfo/3" },
 *      max: { source: "/qHyperCube/qMeasureInfo/4" },
 *    },
 *    groupBy: {
 *      source: "/qHyperCube/qDimensionInfo/0"
 *    }
 *  },
 *  settings: {
 *    major: {
 *      scale: { source: "/qHyperCube/qDimensionInfo/0" }
 *    },
 *    minor: {
 *      scale: { source: ["/qHyperCube/qMeasureInfo/0",
 *               "/qHyperCube/qMeasureInfo/1",
 *               "/qHyperCube/qMeasureInfo/2",
 *               "/qHyperCube/qMeasureInfo/3",
 *               "/qHyperCube/qMeasureInfo/4"] }
 *    }
 *  }
 * }
 */

/**
 * @typedef {object} ComponentBox.settings
 * @property {object} major
 * @property {string} major.scale The scale to use along the major (dimension) axis
 * @property {string|ComponentBox~MajorReference} [major.ref='self'] Reference to the data property along the major axis
 * @property {object} minor
 * @property {string} minor.scale The scale to use along the minor (measure) axis
 * @property {string} [orientation='vertical'] Which orientation to use (vertical or horizontal)
 * @property {object} [box] Visual properties for the box shape in the box marker
 * @property {boolean} [box.show=true] Boolean for showing the box shape
 * @property {string} [box.fill='#fff']
 * @property {string} [box.stroke='#000']
 * @property {number} [box.strokeWidth=1]
 * @property {string} [box.strokeLinejoin='miter']
 * @property {number} [box.width=1]
 * @property {number} [box.maxWidthPx=100] Maximum width of the box in pixels (not applicable when using major start and end)
 * @property {number} [box.minWidthPx=1] Minimum width of the box in pixels (not applicable when using major start and end)
 * @property {number} [box.minHeightPx=1] Minimum height of the box shape
 * @property {object} [line] Visual properties for lines between min-start, end-max.
 * @property {boolean} [line.show=true]
 * @property {string} [line.stroke='#000']
 * @property {number} [line.strokeWidth=1]
 * @property {object} [whisker] All the visual properties for whiskers at min and max.
 * @property {boolean} [whisker.show=true]
 * @property {string} [whisker.stroke='#000']
 * @property {number} [whisker.strokeWidth=1]
 * @property {number} [whisker.width=1]
 * @property {object} [median] Visual properties for the median
 * @property {boolean} [median.show=true]
 * @property {string} [median.stroke='#000']
 * @property {number} [median.strokeWidth=1]
 * @property {object} [oob] EXPERIMENTAL: Out of bounds symbol utilizing the symbol API
 * @property {boolean} [oob.show=true]
 * @property {string} [oob.type='n-polygon'] Type of the symbol to be used
 * @property {string} [oob.fill='#999'] Fill color of the symbol
 * @property {string} [oob.stroke='#000'] Stroke color
 * @property {number} [oob.strokeWidth=0] Stroke width
 * @property {number} [oob.size=10] Size/width of the symbol in pixels
 * @property {number} [oob.sides=3] Number of sides for a n-polygon (3 for triangle)
 */

/**
 * @typedef {object} ComponentBox~MajorReference
 * @property {string} start Reference to the data property of the start value along the major axis
 * @property {string} end Reference to the data property of the end value along the major axis
 */

/**
 * @typedef {object} ComponentBox.data
 * @property {number} [min] Min
 * @property {number} [max] Max
 * @property {number} [start] Start of box
 * @property {number} [end] End of box
 * @property {number} [med] Median
 */
