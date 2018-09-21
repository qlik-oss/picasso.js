import DisplayObject from '../../../../../src/core/scene-graph/display-objects/display-object';
import { Collision } from '../../../../../src/core/scene-graph/collision';
import { SceneNode } from '../../../../../src/core/scene-graph/scene-node';

describe('Display Object', () => {
  let _displayObject;

  beforeEach(() => {
    _displayObject = new DisplayObject();
  });

  describe('Constructor', () => {
    it('should instantiate a new DisplayObject', () => {
      expect(_displayObject).to.be.an.instanceof(DisplayObject);
    });

    it('should not have a collider by default', () => {
      expect(_displayObject.collider).to.equal(null);
    });
  });

  describe('Set', () => {
    it('should accept arguments', () => {
      const args = {
        fill: '1',
        stroke: '2',
        strokeWidth: '3',
        strokeLinejoin: 'bevel',
        fontFamily: '4',
        fontSize: '5',
        baseline: '6',
        anchor: '7',
        maxWidth: '8',
        opacity: '9',
        transform: '10',
        data: {
          value: 11
        },
        id: '12',
        desc: {
          myProp: 1337
        },
        tag: 'Hello world'
      };

      _displayObject.set(args);

      expect(_displayObject.attrs).to.deep.equal({
        fill: '1',
        stroke: '2',
        'stroke-width': '3',
        'stroke-linejoin': 'bevel',
        'font-family': '4',
        'font-size': '5',
        'dominant-baseline': '6',
        'text-anchor': '7',
        maxWidth: '8',
        opacity: '9',
        transform: '10',
        id: '12'
      });
      expect(_displayObject.data).to.deep.equal({
        value: 11
      });
      expect(_displayObject.desc).to.deep.equal({
        myProp: 1337
      });
      expect(_displayObject.tag).to.equal('Hello world');
      expect(_displayObject.node).to.deep.equal(args);
    });

    it('desc attribute must be of type object', () => {
      _displayObject.set({
        desc: 'Hello'
      });
      expect(_displayObject.desc).to.be.undefined;

      _displayObject.set({
        desc: {
          myProp: 'Hello'
        }
      });
      expect(_displayObject.desc).to.deep.equal({
        myProp: 'Hello'
      });
    });

    it('tag attribute must be of type string', () => {
      _displayObject.set({
        tag: 1231
      });
      expect(_displayObject.tag).to.be.undefined;
    });
  });

  describe('getItemsFrom', () => {
    beforeEach(() => {
      _displayObject.set({ fill: 'me' });
      _displayObject.collider = {
        type: 'rect', x: 0, y: 0, width: 100, height: 100
      };
    });

    it('should return a collision with it self, if it contains point', () => {
      const shape = { x: 50, y: 50 };
      const collisions = _displayObject.getItemsFrom(shape);
      expect(collisions).to.be.of.length(1);
      expect(collisions[0]).to.be.an.instanceof(Collision);
      expect(collisions[0].node).to.be.an.instanceof(SceneNode);
      expect(collisions[0].parent).to.equal(null);
      expect(collisions[0].input).to.deep.equal(shape);
    });

    it('should return a collision with it self, if it intersects line', () => {
      const shape = {
        x1: 50, y1: 50, x2: 100, y2: 100
      };
      const collisions = _displayObject.getItemsFrom(shape);
      expect(collisions).to.be.of.length(1);
      expect(collisions[0]).to.be.an.instanceof(Collision);
      expect(collisions[0].node).to.be.an.instanceof(SceneNode);
      expect(collisions[0].parent).to.equal(null);
      expect(collisions[0].input).to.deep.equal(shape);
    });

    it('should return a collision with it self, if it intersects rect', () => {
      const shape = {
        x: 50, y: 50, width: 100, height: 100
      };
      const collisions = _displayObject.getItemsFrom(shape);
      expect(collisions).to.be.of.length(1);
      expect(collisions[0]).to.be.an.instanceof(Collision);
      expect(collisions[0].node).to.be.an.instanceof(SceneNode);
      expect(collisions[0].parent).to.equal(null);
      expect(collisions[0].input).to.deep.equal(shape);
    });

    it('should return a collision with it self, if it intersects circle', () => {
      const shape = { x: 50, y: 50, r: 1 };
      const collisions = _displayObject.getItemsFrom(shape);
      expect(collisions).to.be.of.length(1);
      expect(collisions[0]).to.be.an.instanceof(Collision);
      expect(collisions[0].node).to.be.an.instanceof(SceneNode);
      expect(collisions[0].parent).to.equal(null);
      expect(collisions[0].input).to.deep.equal(shape);
    });
  });

  describe('containsPoint', () => {
    beforeEach(() => {
      _displayObject.collider = {
        type: 'rect', x: 0, y: 0, width: 100, height: 100
      };
    });

    it('should return a true if it contains point', () => {
      const r = _displayObject.containsPoint({ x: 50, y: 50 });
      expect(r).to.equal(true);
    });

    it('should return a false if it doesnt contains point', () => {
      const r = _displayObject.containsPoint({ x: -50, y: -50 });
      expect(r).to.equal(false);
    });
  });

  describe('intersectsLine', () => {
    beforeEach(() => {
      _displayObject.collider = {
        type: 'rect', x: 0, y: 0, width: 100, height: 100
      };
    });

    it('should return a true if it intersect line', () => {
      const r = _displayObject.intersectsLine({
        x1: 50, y1: 50, x2: 100, y2: 100
      });
      expect(r).to.equal(true);
    });

    it('should return a false if it doesnt intersect line', () => {
      const r = _displayObject.intersectsLine({
        x1: -50, y1: -50, x2: -100, y2: -100
      });
      expect(r).to.equal(false);
    });
  });

  describe('intersectsRect', () => {
    beforeEach(() => {
      _displayObject.collider = {
        type: 'rect', x: 0, y: 0, width: 100, height: 100
      };
    });

    it('should return a true if it intersect rect', () => {
      const r = _displayObject.intersectsRect({
        x: 50, y: 50, width: 100, height: 100
      });
      expect(r).to.equal(true);
    });

    it('should return a false if it doesnt intersect rect', () => {
      const r = _displayObject.intersectsRect({
        x: -50, y: -50, width: 1, height: 1
      });
      expect(r).to.equal(false);
    });
  });

  describe('intersectsCircle', () => {
    beforeEach(() => {
      _displayObject.collider = {
        type: 'rect', x: 0, y: 0, width: 100, height: 100
      };
    });

    it('should return a true if it intersect circle', () => {
      const r = _displayObject.intersectsCircle({ x: 50, y: 50, r: 1 });
      expect(r).to.equal(true);
    });

    it('should return a false if it doesnt intersect circle', () => {
      const r = _displayObject.intersectsCircle({ x: -50, y: -50, r: 1 });
      expect(r).to.equal(false);
    });
  });
});
