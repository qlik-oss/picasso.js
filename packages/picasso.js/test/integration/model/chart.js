/* global browser, window */

export function findShapes(selector) {
  function lookup(...args) {
    return window.fixture.findShapes(args[0]).map(s => ({
      element: s.element,
      bounds: s.bounds
    }));
  }

  return browser.executeScript(lookup, selector);
}

export function getAffectedShapes(context) {
  function lookup(...args) {
    return window.fixture.getAffectedShapes(args[0]).map(s => ({
      element: s.element,
      bounds: s.bounds
    }));
  }

  return browser.executeScript(lookup, context);
}
