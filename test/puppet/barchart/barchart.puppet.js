/* eslint-disable */

describe('picasso-barchart', () => {
  const fixture = 'http://localhost:10001/barchart/barchart-lasso.fix.html';
  const fixtureRange = 'http://localhost:10001/barchart/barchart-range.fix.html';

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

  it('lasso select in barchart', async () => {
    await page.goto(fixture);
    await page.waitForSelector('.container');
    await page.mouse.move(80,100);
    await page.mouse.down();
    await page.mouse.move(80,400);
    await page.mouse.move(280,400);
    await page.mouse.move(280,100);
    await page.mouse.move(80,100);
    await page.mouse.up();
    let febisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Feb'));
    expect(febisSelected).to.equal(true, 'Expected feb to be selected');
  });

  // Due to a bug the barchart aint brushing.
  it.skip('Range select y-axis bar in barchart', async () => {
    await page.goto(fixtureRange);
    await page.waitForSelector('.container');
    await page.mouse.move(10,10);
    await page.mouse.down();
    await page.mouse.move(10,200);
    await page.mouse.up();
    let rangeSelect = await page.evaluate(() => picassochart.brush("highlight").containsRange('0/Sales', { min: 9000, max: 9100 }));
    console.log(rangeSelect);
  });

  // Due to a bug the barchart aint brushing.
  it.skip('Range select x-axis bar in barchart', async () => {
    await page.goto(fixtureRange);
    await page.waitForSelector('.container');
    await page.mouse.move(80,800);
    await page.mouse.down();
    await page.mouse.move(350,800);
    await page.mouse.up();
    let janisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Jan'));
    let febisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Apr'));
    expect(janisSelected).to.equal(true);
    expect(febisSelected).to.equal(true);
  });
  // Due to a bug the barchart aint brushing.
  it.skip('Move range-select', async () => {
    await page.goto(fixtureRange);
    await page.waitForSelector('.container');
    await page.evaluate(() => picassochart.brush("highlight").setRange('0/Sales', { min: 4000, max: 7000 }));
  });
  // Due to a bug the barchart aint brushing.
  it.skip('Resize range-select', async () => {
    await page.goto(fixtureRange);
    await page.waitForSelector('.container');
    await page.evaluate(() => picassochart.brush("highlight").setRange('0/Sales', { min: 4000, max: 7000 }));
  });
});
