/* eslint-disable */



describe('picasso-hammer', () => {
  // const fixture = '/fixtures/plugins/hammer.fix.html';
  const fixture = 'http://localhost:10001/hammer/hammer.fix.html';
  // const click = new Actions();
  // const clickAt = 1;
  it('should trigger tap event on chart', async () => {
    console.log(fixture);
    await page.goto(fixture);

    const getTapCount = () => window.tapCount;

    const element = await page.('#container');
    await clickAt(element, { x: 10, y: 10 });
    const tapCount = await browser.executeScript(getTapCount);
    expect(tapCount).to.equal(1);
  });
});
