import crispify from './crispifier';

class Transposer {
  /**
   * @private
   */
  constructor(...items) {
    this.reset();

    this.push(...items);
  }

  /**
   * Evaluate a key for a transposed coordinate
   *
   * @param  {String} key   Key
   * @return {String}         Actual key
   */
  static evaluateKey(key, flipXY) {
    if (flipXY) {
      const firstChar = key.substring(0, 1);
      const rest = key.substring(1);

      if (firstChar === 'x') {
        return `y${rest}`;
      }
      if (firstChar === 'y') {
        return `x${rest}`;
      }
      if (key === 'cx') {
        return 'cy';
      }
      if (key === 'cy') {
        return 'cx';
      }
      if (key === 'width') {
        return 'height';
      }
      if (key === 'height') {
        return 'width';
      }
    }

    return key;
  }

  /**
   * Transpose a coordinate according to this.flipXY and
   * the available rendering area
   *
   * @param  {String} key        The key of the coordinate to transpose
   * @param  {Number} coordinate The coordinate
   * @return {Number}            The actual location of the coordinate
   */
  transposeCoordinate(key, coordinate, flipXY) {
    if (typeof coordinate === 'number' && isFinite(coordinate)) {
      const firstChar = key.substring(0, 1);

      if (firstChar === 'x' || key === 'cx') {
        return coordinate * this.width;
      }
      if (key === 'width') {
        return coordinate * this.width;
      }
      if (key === 'r') {
        return coordinate * (!flipXY ? this.width : this.height);
      }
      if (firstChar === 'y' || key === 'cy') {
        return coordinate * this.height;
      }
      if (key === 'height') {
        return coordinate * this.height;
      }
    }

    return coordinate;
  }

  /**
   * Push an item into the storage of the transposer
   *
   * @param  {Object} items An item to be drawed
   * @return {Object}       Can be chained
   */
  push(...items) {
    this.storage.push(...items);
    return this;
  }

  processItem(item) {
    let newItem = {};
    const flipXY = typeof item.flipXY !== 'undefined' ? item.flipXY : this.flipXY;
    const crisp = typeof item.crisp !== 'undefined' ? item.crisp : this.crisp;

    if (item.fn && typeof item.fn === 'function') {
      let width = flipXY ? this.height : this.width;
      let height = flipXY ? this.width : this.height;

      item = item.fn({ width, height, flipXY });

      const objectKeys = Object.keys(item);

      for (let ki = 0, kl = objectKeys.length; ki < kl; ki++) {
        let key = objectKeys[ki];
        const nkey = Transposer.evaluateKey(key, flipXY);
        newItem[nkey] = item[key];
      }
    } else {
      const objectKeys = Object.keys(item);

      for (let ki = 0, kl = objectKeys.length; ki < kl; ki++) {
        let key = objectKeys[ki];
        const nkey = Transposer.evaluateKey(key, flipXY);
        const nval = this.transposeCoordinate(nkey, item[key], flipXY);
        newItem[nkey] = nval;
      }
    }

    if (crisp) {
      crispify(newItem);
    }

    return newItem;
  }

  /**
   * Get the output of the transposer
   *
   * @return {Array}   Array of objects
   */
  output() {
    let items = [];

    for (let i = 0, l = this.storage.length; i < l; i++) {
      let newItem = this.processItem(this.storage[i]);

      items.push(newItem);
    }

    return items;
  }

  /**
   * Reset the transposer
   *
   * @return {Undefined}  Does not return anything
   */
  reset() {
    this.storage = [];
    this.flipXY = false;
    this.crisp = false;

    this.width = 0;
    this.height = 0;
  }
}

export function transposer(...items) {
  return new Transposer(...items);
}

export default Transposer;
