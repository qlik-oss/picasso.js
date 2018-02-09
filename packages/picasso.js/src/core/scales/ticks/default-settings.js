/* eslint import/prefer-default-export: 0 */

export function continuousDefaultSettings() {
  return {
    ticks: {
      tight: false,
      forceBounds: false,
      distance: 100
    },
    minorTicks: {
      count: 3
    }
  };
}
