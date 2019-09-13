import { testRectRect } from '../../../math/narrow-phase-collision';

/**
 * Using the basic example found here: https://en.wikipedia.org/wiki/Binary_search_algorithm
 *
 * Finds the first node that may intersect the label.
 * @private
 */
export function binaryLeftSearch(labelBounds, ary, coord, side, extractBounds) {
  let left = 0;
  let right = ary.length - 1;
  let bounds;

  while (left < right) {
    let m = Math.floor((left + right) / 2);
    bounds = extractBounds(ary[m]);
    if (bounds[coord] + bounds[side] < labelBounds[coord]) { // label is on right side
      left = m + 1;
    } else { // label is on the left side
      right = m;
    }
  }

  return left;
}

/**
 * The purpose of this module is to act as a filtering function to remove any labels
 * that meets one of the following criterias:
 * -- The label is not fully inside the container, such that it would be fully or partially clipped if rendered
 * -- The label overlaps another label
 * -- The label overlaps another bar which is not the bar the label is originating from
 *
 * Assumes that the nodes are sorted from left/top to right/down, as that allows
 * some optimizations to be performed.
 * @private
 * @returns {function} Filter function, returns false if label be removed and true otherwise
 */
export default function filterOverlappingLabels({
  orientation,
  targetNodes,
  labels,
  container
},
findLeft = binaryLeftSearch) {
  const renderLabels = [];
  const coord = orientation === 'v' ? 'x' : 'y';
  const side = orientation === 'v' ? 'width' : 'height';
  const getTextBounds = (item) => item.textBounds;
  const getNodeBounds = (item) => item.node.localBounds;

  return (doNotUse, labelIndex) => {
    const { textBounds: labelBounds, node: labelNode } = labels[labelIndex];

    // ### Test if label is not fully inside container based on the orientation ###
    if (labelBounds[coord] < container[coord] || labelBounds[coord] + labelBounds[side] > container[coord] + container[side]) {
      return false;
    }

    // ### Test label to label collision ###
    const leftStartLabel = findLeft(labelBounds, renderLabels, coord, side, getTextBounds);
    for (let i = leftStartLabel; i < renderLabels.length; i++) {
      if (testRectRect(labelBounds, renderLabels[i].textBounds)) {
        return false;
      }
    }

    // ### Test label to node collision ###
    const leftStartNode = findLeft(labelBounds, targetNodes, coord, side, getNodeBounds);
    const labelRightBoundary = (labelBounds[coord] + labelBounds[side]);
    for (let i = leftStartNode; i < targetNodes.length; i++) {
      const node = targetNodes[i].node;
      // Do not test beyond this node, as they are assumed to not collide with the label
      if (labelRightBoundary < node.localBounds[coord]) {
        break;
      }

      if (testRectRect(labelBounds, node.localBounds) && labelNode !== node) {
        return false;
      }
    }

    // No collision occured, allow the label to be rendered
    renderLabels.push(labels[labelIndex]);
    return true;
  };
}
