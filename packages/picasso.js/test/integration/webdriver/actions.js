/* global browser */

function getRectCenter(rect) {
  return {
    x: rect.x + (rect.width / 2),
    y: rect.y + (rect.height / 2)
  };
}

function moveTo(elm, offset) {
  let position = offset;
  if (typeof offset.width !== 'undefined') {
    position = getRectCenter(offset);
  }
  position.x = Math.round(position.x); // mouseMove doesnt deal with floats
  position.y = Math.round(position.y);

  return browser.actions()
    .mouseMove(elm, position);
}

/**
 * Click on element
 * @param {WebElement} elm WebElement to click on
 * @param {Object} offset offset from top-left corner of WebElement
 */
export function clickAt(elm, offset) {
  moveTo(elm, offset)
    .click()
    .perform();
}

/**
 * Hover over element
 * @param {WebElement} elm WebElement to hover over
 * @param {Object} offset offset from top-left corner of WebElement
 */
export function hoverAt(elm, offset) {
  moveTo(elm, offset)
    .perform();
}

/**
 * Click on the center position of a shape
 * @param {Object} shape Scene Object Model
 */
export function clickOnShape(shape) {
  clickAt(shape.element, shape.bounds);
}

/**
 * Hover over the center position of a shape
 * @param {Object} shape Scene Object Model
 */
export function hoverOverShape(shape) {
  hoverAt(shape.element, shape.bounds);
}
