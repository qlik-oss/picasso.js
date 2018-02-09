/* global browser, window, $$ */

import { clickAt } from '../webdriver/actions';

describe('picasso-hammer', () => {
  const fixture = '/fixtures/plugins/hammer.fix.html';

  it('should trigger tap event on chart', () => {
    browser.get(fixture);

    const getTapCount = () => window.tapCount;

    const element = $$('#container');
    clickAt(element, { top: 10, left: 10 });
    browser.executeScript(getTapCount).then((tapCount) => {
      expect(tapCount).to.equal(1);
    });
  });
});
