import { testRectRect } from '../../../math/narrow-phase-collision';
import { rectContainsRect } from '../../../math/intersection';

/**
 * Using the basic example found here: https://en.wikipedia.org/wiki/Binary_search_algorithm
 *
 * Finds the first node that may intersect the label.
 * @private
 */
function binaryLeftSearch(labelBounds, ary, coord, side, prop) {
  let left = 0;
  let right = ary.length - 1;
  let node;

  while (left < right) {
    let m = Math.floor((left + right) / 2);
    node = ary[m];
    if (node[prop][coord] + node[prop][side] < labelBounds[coord]) { // is on right side
      left = m + 1;
    } else { // is on the left side
      right = m - 1;
    }
  }
  return left;
}

/**
 * The purpose of this module is to act a filtering function to remove any labels
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
  nodes,
  labels,
  container
}) {
  const removedLabels = {};
  const coord = orientation === 'v' ? 'x' : 'y';
  const side = orientation === 'v' ? 'width' : 'height';

  return (doNotUse, labelIndex) => {
    const { textBounds: labelBounds, node: labelNode } = labels[labelIndex];

    // ### Test if label is not fully inside container ###
    if (!rectContainsRect(labelBounds, container)) {
      removedLabels[labelIndex] = true;
      return false;
    }

    // ### Test label to label collision ###
    // Only check up until the current label index, which sets a prio order from left to right,
    // such that labels too the left are priorities and rendered first.
    const leftStartLabel = binaryLeftSearch(labelBounds, labels, coord, side, 'textBounds');
    for (let i = leftStartLabel; i < labelIndex; i++) {
      // Skip collision check if label have already been removed
      if (!removedLabels[i] && testRectRect(labelBounds, labels[i].textBounds)) {
        removedLabels[labelIndex] = true;
        return false;
      }
    }

    // ### Test label to node collision ###
    const leftStartNode = binaryLeftSearch(labelBounds, nodes, coord, side, 'localBounds');
    for (let i = leftStartNode; i < nodes.length; i++) {
      const node = nodes[i];
      // Do not test beyond this node, as they are assumed to not collide with the label
      if ((labelBounds[coord] + labelBounds[side]) < node.localBounds[coord]) {
        break;
      }

      if (testRectRect(labelBounds, node.localBounds) && labelNode !== node) {
        removedLabels[labelIndex] = true;
        return false;
      }
    }

    // No collision occured, allow the label to be rendered
    return true;
  };
}
