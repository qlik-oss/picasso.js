import PatternItem, { create } from '../pattern-item';

/* eslint no-unused-expressions: 0 */

describe('GradientItem', () => {
  let item;

  describe('Constructor', () => {
    it('should instantiate a new GradientItem', () => {
      item = create();
      expect(item).to.be.an.instanceof(PatternItem);
    });

    it('should not have a collider by default', () => {
      item = create();
      expect(item.collider).to.equal(null);
    });

    it('should accept arguments', () => {
      item = create({
        x: 0,
        y: 2,
        width: 3,
        height: 4,
        id: 'customId',
        patternUnits: 'units',
        notToBeAttached: 'asdf'
      });

      expect(item.attrs.x).to.equal(0);
      expect(item.attrs.y).to.equal(2);
      expect(item.attrs.width).to.equal(3);
      expect(item.attrs.height).to.equal(4);
      expect(item.attrs.id).to.equal('customId');
      expect(item.attrs.patternUnits).to.equal('units');
      expect(item.attrs.notToBeAttached).to.be.undefined;
    });
  });

  describe('Set', () => {
    it('should handle no arguments', () => {
      item = create();
      item.set();
    });

    it('should set correct values', () => {
      item = create();
      item.set({
        x: 0,
        y: 2,
        width: 3,
        height: 4,
        id: 'customId',
        patternUnits: 'units',
        notToBeAttached: 'asdf'
      });

      expect(item.attrs.x).to.equal(0);
      expect(item.attrs.y).to.equal(2);
      expect(item.attrs.width).to.equal(3);
      expect(item.attrs.height).to.equal(4);
      expect(item.attrs.id).to.equal('customId');
      expect(item.attrs.patternUnits).to.equal('units');
      expect(item.attrs.notToBeAttached).to.be.undefined;
    });
  });

  describe('Children', () => {
    it('should append properly', () => {
      item = create();

      item.addChild(create());

      expect(item.children.length).to.be.equal(1);
    });

    it('should append multiple properly', () => {
      item = create();

      item.addChildren([create(), create()]);

      expect(item.children.length).to.be.equal(2);
    });

    it('should remove properly', () => {
      item = create();

      let child = create();

      item.addChild(child);
      item.removeChild(child);

      expect(item.children.length).to.be.equal(0);
    });

    it('should remove multiple properly', () => {
      item = create();

      let children = [create(), create()];

      item.addChildren(children);
      item.removeChildren(children);

      expect(item.children.length).to.be.equal(0);
    });
  });
});
