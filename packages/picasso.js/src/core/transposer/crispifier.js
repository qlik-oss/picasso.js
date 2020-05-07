/**
 * Create a crispifier
 * @ignore
 *
 * @param  {Object} [crispMap] Optional crispmap if you need custom crisping.
 * @return {Function}          crispItem function
 *
 * @example
 * import { crispifierFactory } from "core/crispifier";
 *
 * let crispify = crispifierFactory(customCrispMap);
 *
 * // For a single item
 * crispify(myItem);
 *
 * // For multiple items
 * crispify.multiple(myArrayOfItems);
 */
export function crispifierFactory(crispMap) {
  // Define the crispMap
  if (crispMap === undefined) {
    crispMap = {};

    crispMap.line = {
      append: ['x1', 'x2', 'y1', 'y2'],
      round: [],
      condition: (item) => item.x1 === item.x2 || item.y1 === item.y2,
      conditionAppend: (item) => item.strokeWidth % 2 !== 0,
    };

    crispMap.rect = {
      append: ['x', 'y'],
      round: ['width', 'height'],
      condition: () => true,
      conditionAppend: (item) => item.strokeWidth % 2 !== 0,
    };
  }

  // Re-map the crispmap
  Object.keys(crispMap).forEach((type) => {
    const self = crispMap[type];

    self.items = [];

    self.append.forEach((toAppend) => {
      self.items.push({
        key: toAppend,
        type: 'append',
      });
    });

    self.round.forEach((toAppend) => {
      self.items.push({
        key: toAppend,
        type: 'round',
      });
    });
  });

  /**
   * Crispify a single item
   * @ignore
   * @param  {Object} item  Item with renderer variables such as X, Y, and type.
   * @return {Undefined}    Returns nothing, modifies the original item instead
   */
  function crispItem(item) {
    if (crispMap[item.type] && crispMap[item.type].condition(item)) {
      const self = crispMap[item.type];
      const doAppend = self.conditionAppend === undefined || self.conditionAppend(item);

      self.items.forEach((i) => {
        const rounded = Math.round(item[i.key]);
        const diff = item[i.key] - rounded;
        item[i.key] = rounded;

        if (doAppend && i.type === 'append') {
          if (diff > 0) {
            item[i.key] += 0.5;
          } else {
            item[i.key] -= 0.5;
          }
        }
      });
    }
  }

  /**
   * Crispify multiple items
   * @ignore
   *
   * @param  {Array} items  Array of objects to crispify
   * @return {Undefined}    Returns nothing, modifies the original item instead
   */
  crispItem.multiple = (items) => items.forEach((item) => crispItem(item));

  return crispItem;
}

const crispifier = crispifierFactory();

export default crispifier;
