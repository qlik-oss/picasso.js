describe('picasso-interactions', () => {
  const fixture = 'http://localhost:10001/interactions/interactions-lasso.fix.html';
  const fixtureRange = 'http://localhost:10001/interactions/interactions-range.fix.html';

  it('Single select', async () => {
    await page.goto(fixture);
    await page.waitForSelector('.container');
    await page.click('rect[data-value="Apr"]');
    await page.click('rect[data-value="Mar"]');
    let aprisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Apr'));
    let marisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Mar'));
    expect(aprisSelected).to.equal(true);
    expect(marisSelected).to.equal(true);
  });

  it('lasso select', async () => {
    await page.goto(fixture);
    await page.waitForSelector('.container');
    const a = await page.$('rect[data-value="Apr"]');
    const f = await page.$('rect[data-value="Feb"]');
    const feb = await f.boundingBox();
    const apr = await a.boundingBox();
    await page.mouse.move(feb.x + feb.width / 2, feb.y + feb.height / 2);
    await page.mouse.down();
    await page.mouse.move(apr.x + apr.width / 2, feb.y + feb.height / 2);
    await page.mouse.move(apr.x + apr.width / 2, feb.y + feb.width / 2);
    await page.mouse.move(feb.x + feb.width / 2, feb.y + feb.width / 2);
    await page.mouse.move(feb.x + feb.width / 2, feb.y + feb.height / 2);
    await page.mouse.up();
    let febisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Feb'));
    let aprisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Apr'));
    expect(febisSelected).to.equal(true, 'Expected feb to be selected');
    expect(aprisSelected).to.equal(true, 'Expected apr to be selected');
  });

  it('Range select y-axis', async () => {
    await page.goto(fixtureRange);
    await page.waitForSelector('.container');
    const e = (await page.$x('//*[. = "4000"]'))[0];
    const d = (await page.$x('//*[. = "8000"]'))[0];
    const label = await e.boundingBox();
    const label2 = await d.boundingBox();
    await page.mouse.move(label.x + label.width / 2, label.y + label.height / 2);
    await page.mouse.down();
    await page.mouse.move(label2.x + label2.width / 2, label2.y + label2.height / 2);
    await page.mouse.up();
    let rangeSelect = await page.evaluate(() => picassochart.brush('highlight').containsRange('0/Sales', { min: 4100, max: 8000 }));
    expect(rangeSelect).to.equal(true, 'The rangeselect contained at least values between 4100-8000');
  });

  it('Resize range-select on y-axis', async () => {
    await page.goto(fixtureRange);
    await page.waitForSelector('.container');
    const e = (await page.$x('//*[. = "4000"]'))[0];
    const r = (await page.$x('//*[. = "2000"]'))[0];
    const d = (await page.$x('//*[. = "8000"]'))[0];
    const label = await e.boundingBox();
    const label2 = await d.boundingBox();
    const label3 = await r.boundingBox();
    await page.mouse.move(label.x + label.width / 2, label.y + label.height / 2);
    await page.mouse.down();
    await page.mouse.move(label2.x + label2.width / 2, label2.y + label2.height / 2);
    await page.mouse.up();
    await page.mouse.move(label2.x + label2.width / 2, label2.y + label2.height / 2);
    await page.mouse.down();
    await page.mouse.move(label3.x + label3.width / 2, label3.y + label3.height / 2);
    await page.mouse.up();
    let rangeSelect = await page.evaluate(() => picassochart.brush('highlight').containsRange('0/Sales', { min: 2100, max: 3800 }));
    expect(rangeSelect).to.equal(true, 'The rangeselect contained at least values between 2100-3800');
  });

  // Not able to resize with bubbles in this setup
  it.skip('Resize range-select on y-axis with bubble', async () => {
    await page.goto(fixtureRange);
    await page.waitForSelector('.container');
    const e = (await page.$x('//*[. = "4000"]'))[0];
    const r = (await page.$x('//*[. = "2000"]'))[0];
    const d = (await page.$x('//*[. = "8000"]'))[0];
    const a = await page.$('[data-value="July"]');
    const label = await e.boundingBox();
    const label2 = await d.boundingBox();
    const label3 = await r.boundingBox();
    const labelJuly = await a.boundingBox();
    await page.mouse.move(label.x + label.width / 2, label.y + label.height / 2);
    await page.mouse.down();
    await page.mouse.move(label2.x + label2.width / 2, label2.y + label2.height / 2);
    await page.mouse.up();
    await page.mouse.move(labelJuly.x + labelJuly.width / 2, label.y + label.height / 2);
    await page.mouse.down();
    await page.mouse.move(label3.x + label3.width / 2, label3.y + label3.height / 2);
    await page.mouse.up();
    let rangeSelect = await page.evaluate(() => picassochart.brush('highlight').containsRange('0/Sales', { min: 3100, max: 3800 }));
    expect(rangeSelect).to.equal(true, 'The rangeselect contained at least values between 3100-3800');
  });

  it('Range select x-axis', async () => {
    await page.goto(fixtureRange);
    await page.waitForSelector('.container');
    const e = await page.$('[data-value="Jan"]');
    const d = await page.$('[data-value="Feb"]');
    const box = await e.boundingBox(); /* Get boundingbox for box element 1 */
    const box2 = await d.boundingBox(); /* Get boundingbox for box element 2 */
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); /* Move to center point of element 1 */
    await page.mouse.down();
    await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2); /* Move to center point of element 2 */
    await page.mouse.up();
    let janisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Jan'));
    let febisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Feb'));
    expect(janisSelected).to.equal(true, 'Jan should have been selected but it was not');
    expect(febisSelected).to.equal(true, 'Feb should have been selected but it was not');
  });

  it('Resize range-select on x-axis', async () => {
    await page.goto(fixtureRange);
    await page.waitForSelector('.container');
    const e = await page.$('[data-value="Jan"]');
    const d = await page.$('[data-value="Feb"]');
    const f = await page.$('[data-value="Apr"]');
    const box = await e.boundingBox(); /* Get boundingbox for box element 1 */
    const box2 = await d.boundingBox(); /* Get boundingbox for box element 2 */
    const dest = await f.boundingBox(); /* Get boundingbox for box element 3 */
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); /* Move to center point of element 1 */
    await page.mouse.down();
    await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2); /* Move to center point of element 2 */
    await page.mouse.up();
    await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
    await page.mouse.down();
    await page.mouse.move(dest.x + dest.width / 2, dest.y + dest.height / 2);
    await page.mouse.up();
    let janisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Jan'));
    let aprisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Apr'));
    expect(janisSelected).to.equal(true, 'Jan should have been selected but it was not');
    expect(aprisSelected).to.equal(true, 'Apr should have been selected but it was not');
  });

  it('Resize range-select on x-axis with bubble', async () => {
    await page.goto(fixtureRange);
    await page.waitForSelector('.container');
    const e = await page.$('[data-value="Jan"]');
    const d = await page.$('[data-value="Feb"]');
    const f = await page.$('[data-value="Apr"]');
    const box = await e.boundingBox(); /* Get boundingbox for box element 1 */
    const box2 = await d.boundingBox(); /* Get boundingbox for box element 2 */
    const dest = await f.boundingBox(); /* Get boundingbox for box element 3 */
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); /* Move to center point of element 1 */
    await page.mouse.down();
    await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2); /* Move to center point of element 2 */
    await page.mouse.move(box2.x + box2.width / 2, 5); /* Drag in the bubblet */
    await page.mouse.move(dest.x + dest.width / 2, dest.y + dest.height / 2); /* Move the bubble to Apr box */
    await page.mouse.up();
    let janisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Jan'));
    let aprisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Apr'));
    expect(janisSelected).to.equal(true, 'Jan should have been selected but it was not');
    expect(aprisSelected).to.equal(true, 'Apr should have been selected but it was not');
  });

  it('Move range-select on x-axis', async () => {
    await page.goto(fixtureRange);
    await page.waitForSelector('.container');
    const b = await page.$('rect[data-value="Jan"]');
    const l = await page.$('[data-value="Jan"]');
    const label = await l.boundingBox(); /* Get boundingbox for label element */
    const box = await b.boundingBox(); /* Get boundingbox for box element */
    await page.mouse.move(box.x, label.y + label.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width, label.y + label.height / 2);
    await page.mouse.up();
    await page.mouse.move(label.x, label.y);
    await page.mouse.down();
    const d = await page.$('[data-value="Feb"]');
    const dest = await d.boundingBox();
    await page.mouse.move(dest.x, dest.y);
    let febisSelected = await page.evaluate(() => picassochart.brush('highlight').containsValue('0/Month', 'Feb'));
    expect(febisSelected).to.equal(true, 'Feb should have been selected but it was not');
  });

  it('Move range-select on y-axis', async () => {
    await page.goto(fixtureRange);
    await page.waitForSelector('.container');
    const d = (await page.$x('//*[. = "8000"]'))[0];
    const e = (await page.$x('//*[. = "6000"]'))[0];
    const f = (await page.$x('//*[. = "0"]'))[0];
    const label = await e.boundingBox();
    const label2 = await d.boundingBox();
    const dest = await f.boundingBox();
    await page.mouse.move(label.x + label.width / 2, label.y + label.height / 2);
    await page.mouse.down();
    await page.mouse.move(label2.x + label2.width / 2, label2.y + label2.height / 2);
    await page.mouse.up();
    await page.mouse.move(label.x + label.width / 2, label2.y + label.height / 2);
    await page.mouse.down();
    await page.mouse.move(dest.x + dest.width / 2, dest.y + dest.height / 2);
    await page.mouse.up();
    let rangeSelect = await page.evaluate(() => picassochart.brush('highlight').containsRange('0/Sales', { min: 0, max: 5800 }));
    expect(rangeSelect).to.equal(true, 'The rangeselect contained at least values between 10-1500');
  });
});
