/* global browser, window, $$ */

import { clickAt } from '../webdriver/actions';

describe('picasso-hammer', () => {
  const fixture = '/fixtures/plugins/hammer.fix.html';

  it('should trigger tap event on chart', async () => {
    await browser.get(fixture);

    const getTapCount = () => window.tapCount;

    // const element = await $('#container')
    const element = page.waitForSelector('#container', { visible: true });
    await clickAt(element, { x: 10, y: 10 });
    const tapCount = await browser.executeScript(getTapCount);
    expect(tapCount).to.equal(1);
  });
});
