/* eslint-disable */

describe('picasso-barchart', () => {
  const fixture = 'http://localhost:10001/barchart/barchart.fix.html';

  it('Select some bars', async () => {
    await page.goto(fixture);
    await page.waitForSelector('.container');
    await page.click('rect[data-value="Apr"]');
    await page.click('rect[data-value="Mar"]');
    let aprisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Apr'));
    let marisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Mar'));
    expect(aprisSelected).to.equal(true);
    expect(marisSelected).to.equal(true);
  });
  it.skip('Range select bars', async () => {
    await page.goto(fixture);
    await page.waitForSelector('.container');
  });
});
