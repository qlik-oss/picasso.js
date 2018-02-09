/* global browser */

import { findShapes, getAffectedShapes } from '../../model/chart';
import { clickOnShape, hoverOverShape } from '../../webdriver/actions';

describe('Brushing', () => {
  const tap = '/fixtures/chart/brushing/tap.fix.html';
  const tapScroll = '/fixtures/chart/brushing/tap_scroll.fix.html';
  const over = '/fixtures/chart/brushing/over.fix.html';

  it('tap', () => {
    browser.get(tap);
    let targetShape;
    findShapes('circle').then((shapes) => {
      targetShape = shapes[0];
      clickOnShape(targetShape);
    });

    getAffectedShapes('test').then((activeShapes) => {
      expect(activeShapes).to.be.of.length(1);
      expect(targetShape.bounds).to.deep.equal(activeShapes[0].bounds);
    });
  });

  it('tap on scrolled page', () => {
    browser.get(tapScroll);
    let targetShape;
    findShapes('circle').then((shapes) => {
      targetShape = shapes[0];
      clickOnShape(targetShape);
    });

    getAffectedShapes('test').then((activeShapes) => {
      expect(activeShapes).to.be.of.length(1);
      expect(targetShape.bounds).to.deep.equal(activeShapes[0].bounds);
    });
  });

  it('over', () => {
    browser.get(over);
    let targetShape;
    findShapes('circle').then((shapes) => {
      targetShape = shapes[0];
      hoverOverShape(targetShape);
    });

    getAffectedShapes('test').then((activeShapes) => {
      expect(activeShapes).to.be.of.length(1);
      expect(targetShape.bounds).to.deep.equal(activeShapes[0].bounds);
    });
  });
});
