import GradientItem, { create as createGradientItem } from '../../../../../src/core/scene-graph/display-objects/gradient-item';

/* eslint no-unused-expressions: 0 */

describe('GradientItem', () => {
  let item;

  describe('Constructor', () => {
    it('should instantiate a new GradientItem', () => {
      item = createGradientItem();
      expect(item).to.be.an.instanceof(GradientItem);
    });

    it('should not have a collider by default', () => {
      item = createGradientItem();
      expect(item.collider()).to.equal(null);
    });

    it('should accept arguments', () => {
      item = createGradientItem({
        x1: 1,
        x2: 2,
        y1: 3,
        y2: 4,
        id: 'customId',
        offset: 0.5,
        style: 'styleTest',
        notToBeAttached: 'asdf'
      });

      expect(item.attrs.x1).to.be.equal(1);
      expect(item.attrs.x2).to.be.equal(2);
      expect(item.attrs.y1).to.be.equal(3);
      expect(item.attrs.y2).to.be.equal(4);
      expect(item.attrs.id).to.be.equal('customId');
      expect(item.attrs.offset).to.be.equal(0.5);
      expect(item.attrs.style).to.be.equal('styleTest');
      expect(item.attrs.notToBeAttached).to.be.undefined;
    });
  });

  describe('Set', () => {
    it('should handle no arguments', () => {
      item = createGradientItem();
      item.set();
    });

    it('should set correct values', () => {
      item = createGradientItem();
      item.set({
        x1: 1,
        x2: 2,
        y1: 3,
        y2: 4,
        id: 'customId',
        offset: 0.5,
        style: 'styleTest',
        notToBeAttached: 'asdf'
      });

      expect(item.attrs.x1).to.be.equal(1);
      expect(item.attrs.x2).to.be.equal(2);
      expect(item.attrs.y1).to.be.equal(3);
      expect(item.attrs.y2).to.be.equal(4);
      expect(item.attrs.id).to.be.equal('customId');
      expect(item.attrs.offset).to.be.equal(0.5);
      expect(item.attrs.style).to.be.equal('styleTest');
      expect(item.attrs.notToBeAttached).to.be.undefined;
    });
  });

  describe('Children', () => {
    it('should append properly', () => {
      item = createGradientItem();

      item.addChild(createGradientItem());

      expect(item.children.length).to.be.equal(1);
    });

    it('should append multiple properly', () => {
      item = createGradientItem();

      item.addChildren([createGradientItem(), createGradientItem()]);

      expect(item.children.length).to.be.equal(2);
    });

    it('should remove properly', () => {
      item = createGradientItem();

      let child = createGradientItem();

      item.addChild(child);
      item.removeChild(child);

      expect(item.children.length).to.be.equal(0);
    });

    it('should remove multiple properly', () => {
      item = createGradientItem();

      let children = [createGradientItem(), createGradientItem()];

      item.addChildren(children);
      item.removeChildren(children);

      expect(item.children.length).to.be.equal(0);
    });
  });
});
