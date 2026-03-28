import { createTree } from '../node-tree';
import { creator, maintainer, destroyer } from './svg-nodes';

/** Function used to create an SVG element and attach it to a parent */
type NodeCreatorFn = (type: string, parent: Element) => Element;
/** Function used to update an SVG element with item data */
type NodeMaintainerFn = (element: Element, item: object) => void;
/** Function used to detach and destroy an SVG element */
type NodeDestroyerFn = (element: Element) => void;
/** Function used to create/update/destroy a DOM tree */
type TreeCreatorFn = (
  oldItems: unknown[],
  newItems: unknown[],
  root: Element,
  creator: NodeCreatorFn,
  maintainer: NodeMaintainerFn,
  destroyer: NodeDestroyerFn
) => unknown[];

export default class TreeItemRenderer {
  declare create: TreeCreatorFn;
  declare nodeCreator: NodeCreatorFn;
  declare nodeDestroyer: NodeDestroyerFn;
  declare nodeMaintainer: NodeMaintainerFn;
  /**
   * Constructor
   * @private
   * @param  {TreeCreator} treeCreator - Function used to create the DOM tree..
   * @param  {SVGCreator} nodeCreator - Function used to create nodes.
   * @param  {SVGMaintainer} nodeMaintainer - Function used to update nodes.
   * @param  {SVGDestroyer} nodeDestroyer - Function used to destroy nodes.
   */
  constructor(treeCreator: TreeCreatorFn, nodeCreator: NodeCreatorFn, nodeMaintainer: NodeMaintainerFn, nodeDestroyer: NodeDestroyerFn) {
    this.create = treeCreator;
    this.nodeCreator = nodeCreator;
    this.nodeMaintainer = nodeMaintainer;
    this.nodeDestroyer = nodeDestroyer;
  }

  render(newItems: unknown[], root: Element) {
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
