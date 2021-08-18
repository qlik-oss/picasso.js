const fs = require('fs');

async function store(data, file) {
  const stream = fs.createWriteStream(file);
  stream.write(Buffer.from(data, 'base64'));
  stream.end();
}

async function browserErrorLogger() {
  const browserLogs = await browser.manage().logs().get('browser');
  browserLogs.forEach((log) => {
    if (log.level.value > 900) {
      // it's an error log
      console.log(`Browser console error: ${log.message}`);
    }
  });
}

describe('picasso-interactions', () => {
  before(() => {
    browserErrorLogger();
  });

  const fixture = './brushing/tap.fix.html';
  const EC = protractor.ExpectedConditions;
  it('single select', async () => {
    await browser.get(fixture);
    try {
      await browser.wait(EC.presenceOf($('.container')), 10000, 'Chart did not appear');
    } catch (e) {
      const err = await browser.takeScreenshot();
      store(err, 'test/protractor/err.png');
    }

    const snap = await browser.takeScreenshot();
    store(snap, 'test/protractor/snapshot1.png');

    await $('rect[data-value="Apr"]').click();
    await $('rect[data-value="June"]').click();
    const aprIsSelected = await browser.executeScript(
      'return picassochart.brush("highlight").containsValue("0/Month", "Apr")'
    );
    const juneIsSelected = await browser.executeScript(
      'return picassochart.brush("highlight").containsValue("0/Month", "June")'
    );

    const snap2 = await browser.takeScreenshot();
    store(snap2, 'test/protractor/snapshot2.png');

    expect(aprIsSelected).to.equal(true);
    expect(juneIsSelected).to.equal(true);
  });
});
