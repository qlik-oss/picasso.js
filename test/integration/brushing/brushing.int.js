describe('picasso-brush', () => {
  const fixture = 'http://localhost:10001/brushing/over.fix.html';
  const tapScroll = 'http://localhost:10001/brushing/tap_scroll.fix.html';

  it('tap on scrolled page', async () => {
    await page.goto(tapScroll);
    await page.waitForSelector('#container');
    const a = await page.$('[data-label="Cars"]');
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)'); /* Scroll to bottom */
    const circle = await a.boundingBox();

    await page.mouse.move(circle.x + circle.width / 2, circle.y + circle.height / 2);
    await page.mouse.down();
    await page.mouse.up();
    const truckCircle = await page.$eval('[data-label="Trucks"]', (c, attribute) => c.getAttribute(attribute), 'fill');
    expect(truckCircle).to.equal('red', 'Wrong color was shown when hovering');
    const carsCircle = await page.$eval('[data-label="Cars"]', (c, attribute) => c.getAttribute(attribute), 'fill');
    expect(carsCircle).to.equal('#3F8AB3', 'Wrong color was shown');
  });
  it('Hover on circle', async () => {
    await page.goto(fixture);
    await page.waitForSelector('#container');
    const a = await page.$('[data-label="Cars"]');
    const circle = await a.boundingBox();

    await page.mouse.move(circle.x + circle.width / 2, circle.y + circle.height / 2);
    const truckCircle = await page.$eval('[data-label="Trucks"]', (c, attribute) => c.getAttribute(attribute), 'fill');
    expect(truckCircle).to.equal('red', 'Wrong color was shown when hovering');
    const carsCircle = await page.$eval('[data-label="Cars"]', (c, attribute) => c.getAttribute(attribute), 'fill');
    expect(carsCircle).to.equal('#3F8AB3', 'Wrong color was shown');
  });
});
