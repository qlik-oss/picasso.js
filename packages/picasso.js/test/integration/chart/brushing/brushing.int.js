/* global browser */

import { findShapes, getAffectedShapes } from '../../model/chart';
import { clickOnShape, hoverOverShape } from '../../webdriver/actions';

describe('Brushing', () => {
  const tap = '/fixtures/chart/brushing/tap.fix.html';
  const tapScroll = '/fixtures/chart/brushing/tap_scroll.fix.html';
  const over = '/fixtures/chart/brushing/over.fix.html';

  it('tap', async () => {
    await browser.get(tap);
    let targetShape;
    const shapes = await findShapes('circle');
    targetShape = shapes[0];
    await clickOnShape(targetShape);

    const activeShapes = await getAffectedShapes('test');
    expect(activeShapes).to.be.of.length(1);
    expect(targetShape.bounds).to.deep.equal(activeShapes[0].bounds);
  });

  it('tap on scrolled page', async () => {
    await browser.get(tapScroll);
    let targetShape;
    const shapes = await findShapes('circle');
    targetShape = shapes[0];
    await clickOnShape(targetShape);

    const activeShapes = await getAffectedShapes('test');
    expect(activeShapes).to.be.of.length(1);
    expect(targetShape.bounds).to.deep.equal(activeShapes[0].bounds);
  });

  it('over', async () => {
    await browser.get(over);
    let targetShape;
    const shapes = await findShapes('circle');
    targetShape = shapes[0];
    await hoverOverShape(targetShape);

    const activeShapes = await getAffectedShapes('test');
    expect(activeShapes).to.be.of.length(1);
    expect(targetShape.bounds).to.deep.equal(activeShapes[0].bounds);
  });
});
