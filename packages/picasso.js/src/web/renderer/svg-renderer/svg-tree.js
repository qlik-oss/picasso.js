import { createTree } from '../node-tree';
import { creator, maintainer, destroyer } from './svg-nodes';

export default class TreeItemRenderer {
  /**
   * Constructor
   * @private
   * @param  {TreeCreator} treeCreator - Function used to create the DOM tree..
   * @param  {SVGCreator} nodeCreator - Function used to create nodes.
   * @param  {SVGMaintainer} nodeMaintainer - Function used to update nodes.
   * @param  {SVGDestroyer} nodeDestroyer - Function used to destroy nodes.
   */
  constructor(treeCreator, nodeCreator, nodeMaintainer, nodeDestroyer) {
    this.create = treeCreator;
    this.nodeCreator = nodeCreator;
    this.nodeMaintainer = nodeMaintainer;
    this.nodeDestroyer = nodeDestroyer;
  }

  render(newItems, root) {
    return this.create([], newItems, root, this.nodeCreator, this.nodeMaintainer, this.nodeDestroyer);
  }
}

export function tree() {
  return new TreeItemRenderer(createTree, creator, maintainer, destroyer);
}

/**
 * Create an SVGElement and attach to parent.
 * @private
 * @callback SVGCreator
 * @param {String} type - The type of element to create.
 * @param {SVGElement} parent - The parent element to append the new element to.
 * @return {SVGElement} The created element
 */

/**
 * Update the element with content from item.
 * @private
 * @callback SVGMaintainer
 * @param {SVGElement} el - The element to update
 * @param {Object} item - The object to use as input for the update
 */

/**
 * Detach element from its parent.
 * @private
 * @callback SVGDestroyer
 * @param {SVGElement} el - Element to destroy.
 */

/**
 * Create, update and destroy nodes.
 * @private
 * @callback TreeCreator
 * @param {Object[]} existing - The existing items in the tree.
 * @param {Object[]} active - The new items to create the tree from.
 * @param {SVGCreator} creator - Function used to create nodes.
 * @param {SVGMaintainer} maintainer - Function used to update nodes.
 * @param {SVGDestroyer} destroyer - Function used to destroy nodes.
 */
