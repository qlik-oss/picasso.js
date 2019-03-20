describe('picasso-interactions', () => {
  const fixture = './interactions/interactions-lasso.fix.html';
  const EC = protractor.ExpectedConditions;
  it('single select', async () => {
    await browser.get(fixture);
    await browser.wait(EC.presenceOf($('.container')), 10000, 'Chart did not appear');

    await $('rect[data-value="Apr"]').click();
    await $('rect[data-value="Mar"]').click();
    const aprIsSelected = await browser.executeScript('return picassochart.brush("highlight").containsValue("0/Month", "Apr")');
    const marIsSelected = await browser.executeScript('return picassochart.brush("highlight").containsValue("0/Month", "Mar")');
    expect(aprIsSelected).to.equal(true);
    expect(marIsSelected).to.equal(true);
  });
});
