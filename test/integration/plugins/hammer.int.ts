describe('picasso-hammer', () => {
  const fixture = 'http://localhost:10001/plugins/hammer.fix.html';

  it('should trigger tap event on chart', async () => {
    await page.goto(fixture);
    await page.waitForSelector('#container');
    const a = await page.$('#container');
    const obj = await a.boundingBox();
    await page.mouse.move(obj.x + 10, obj.y + 10);
    await page.mouse.down();
    await page.mouse.up();
    const tapCount = await page.evaluate(() => window.tapCount);
    expect(tapCount).to.equal(1);
  });
});
