import Container, { create as createContainer } from '../../../../../src/core/scene-graph/display-objects/container';
import { create as createRect } from '../../../../../src/core/scene-graph/display-objects/rect';
import GeoRect from '../../../../../src/core/geometry/rect';

describe('Container', () => {
  let container;

  describe('Constructor', () => {
    it('should instantiate a new Container', () => {
      container = createContainer();
      expect(container).to.be.an.instanceof(Container);
    });

    it('should not have a collider by default', () => {
      container = createContainer();
      expect(container.collider()).to.equal(null);
    });

    it('should accept arguments', () => {
      container = createContainer({ collider: { type: 'rect' } });
      expect(container.collider()).to.be.a('object');
      expect(container.collider().fn).to.be.an.instanceof(GeoRect);
      expect(container.collider().type).to.equal('rect');
    });
  });

  describe('Set', () => {
    it('should set correct values', () => {
      container = createContainer();
      container.set({ collider: { type: 'rect' } });
      expect(container.collider()).to.be.a('object');
      expect(container.collider().fn).to.be.an.instanceof(GeoRect);
      expect(container.collider().type).to.equal('rect');
    });

    it('should handle no arguments', () => {
      container = createContainer();
      container.set();
      expect(container.collider()).to.equal(null);
    });

    it('should be able to disable the collider', () => {
      container = createContainer({ collider: { type: 'rect' } });
      container.set({ collider: { type: null } });
      expect(container.collider()).to.equal(null);
    });
  });

  describe('BoundingRect', () => {
    it('should return a zero sized rect if no children have been added', () => {
      container = createContainer();
      expect(container.boundingRect()).to.deep.equal({ x: 0, y: 0, width: 0, height: 0 });
    });

    it('should return correct value if container and children are without a transformation', () => {
      container = createContainer();
      container.addChildren([
        createRect({ x: 5, y: 10, width: 1, height: 20 }), // Height
        createRect({ x: 0, y: 0, width: 10, height: 2 }), // Width
        createRect({ x: -10, y: -20, width: 1, height: 2 }) // x,y
      ]);
      expect(container.boundingRect()).to.deep.equal({ x: -10, y: -20, width: 20, height: 50 });
    });

    it('should return correct value with a transformation on its children', () => {
      container = createContainer();
      container.addChildren([
        createRect({ x: 5, y: 10, width: 1, height: 20, transform: 'scale(2, 3)' }),
        createRect({ x: 0, y: 0, width: 10, height: 2, transform: 'scale(2, 3)' }),
        createRect({ x: -10, y: -20, width: 1, height: 2, transform: 'scale(2, 3)' })
      ]);
      container.children.forEach(c => c.resolveGlobalTransform());
      expect(container.boundingRect(true)).to.deep.equal({ x: -20, y: -60, width: 40, height: 150 });
    });

    it('should return correct value with a transformation the container and its children', () => {
      container = createContainer({ transform: 'scale(2, 3)' });
      container.addChildren([
        createRect({ x: 5, y: 10, width: 1, height: 20, transform: 'translate(1, 2)' }),
        createRect({ x: 0, y: 0, width: 10, height: 2, transform: 'translate(1, 2)' }),
        createRect({ x: -10, y: -20, width: 1, height: 2, transform: 'translate(1, 2)' })
      ]);
      container.children.forEach(c => c.resolveGlobalTransform());
      expect(container.boundingRect(true)).to.deep.equal({ x: -18, y: -54, width: 40, height: 150 });
    });

    it('should return correct value a scale transformation', () => {
      container = createContainer({ transform: 'scale(2, 3)' });
      container.addChildren([
        createRect({ x: 5, y: 10, width: 1, height: 20 }), // Height
        createRect({ x: 0, y: 0, width: 10, height: 2 }), // Width
        createRect({ x: -10, y: -20, width: 1, height: 2 }) // x,y
      ]);
      container.children.forEach(c => c.resolveGlobalTransform());
      expect(container.boundingRect(true)).to.deep.equal({ x: -20, y: -60, width: 40, height: 150 });
    });

    it('should return correct value with a translate transformation', () => {
      container = createContainer({ transform: 'translate(2, 3)' });
      container.addChildren([
        createRect({ x: 5, y: 10, width: 1, height: 20 }), // Height
        createRect({ x: 0, y: 0, width: 10, height: 2 }), // Width
        createRect({ x: -10, y: -20, width: 1, height: 2 }) // x,y
      ]);
      container.children.forEach(c => c.resolveGlobalTransform());
      expect(container.boundingRect(true)).to.deep.equal({ x: -8, y: -17, width: 20, height: 50 });
    });

    it('should return correct value with a rotate transformation', () => {
      container = createContainer({ transform: 'rotate(45)' });
      container.addChildren([
        createRect({ x: 5, y: 10, width: 1, height: 20 }),
        createRect({ x: 0, y: 0, width: 10, height: 2 }),
        createRect({ x: -10, y: -20, width: 1, height: 2 })
      ]);
      container.children.forEach(c => c.resolveGlobalTransform());
      expect(container.boundingRect(true)).to.deep.equal({ x: -17.677669529663685, y: -21.213203435596427, width: 25.455844122715707, height: 46.66904755831214 });
    });
  });

  describe('Bounds', () => {
    it('should return a zero sized rect if no children have been added', () => {
      container = createContainer();
      expect(container.bounds()).to.deep.equal([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ]);
    });

    it('should return correct value if container and children are without a transformation', () => {
      container = createContainer();
      container.addChildren([
        createRect({ x: 5, y: 10, width: 1, height: 20 }), // Height
        createRect({ x: 0, y: 0, width: 10, height: 2 }), // Width
        createRect({ x: -10, y: -20, width: 1, height: 2 }) // x,y
      ]);

      expect(container.bounds()).to.deep.equal([
        { x: -10, y: -20 },
        { x: 10, y: -20 },
        { x: 10, y: 30 },
        { x: -10, y: 30 }
      ]);
    });

    it('should return correct value with a transformation on its children', () => {
      container = createContainer();
      container.addChildren([
        createRect({ x: 5, y: 10, width: 1, height: 20, transform: 'scale(2, 3)' }),
        createRect({ x: 0, y: 0, width: 10, height: 2, transform: 'scale(2, 3)' }),
        createRect({ x: -10, y: -20, width: 1, height: 2, transform: 'scale(2, 3)' })
      ]);
      container.children.forEach(c => c.resolveGlobalTransform());

      expect(container.bounds(true)).to.deep.equal([
        { x: -20, y: -60 },
        { x: 20, y: -60 },
        { x: 20, y: 90 },
        { x: -20, y: 90 }
      ]);
    });

    it('should return correct value with a transformation the container and its children', () => {
      container = createContainer({ transform: 'scale(2, 3)' });
      container.addChildren([
        createRect({ x: 5, y: 10, width: 1, height: 20, transform: 'translate(1, 2)' }),
        createRect({ x: 0, y: 0, width: 10, height: 2, transform: 'translate(1, 2)' }),
        createRect({ x: -10, y: -20, width: 1, height: 2, transform: 'translate(1, 2)' })
      ]);
      container.children.forEach(c => c.resolveGlobalTransform());
      expect(container.bounds(true)).to.deep.equal([
        { x: -18, y: -54 },
        { x: 22, y: -54 },
        { x: 22, y: 96 },
        { x: -18, y: 96 }
      ]);
    });

    it('should return correct value a scale transformation', () => {
      container = createContainer({ transform: 'scale(2, 3)' });
      container.addChildren([
        createRect({ x: 5, y: 10, width: 1, height: 20 }), // Height
        createRect({ x: 0, y: 0, width: 10, height: 2 }), // Width
        createRect({ x: -10, y: -20, width: 1, height: 2 }) // x,y
      ]);
      container.children.forEach(c => c.resolveGlobalTransform());
      expect(container.bounds(true)).to.deep.equal([
        { x: -20, y: -60 },
        { x: 20, y: -60 },
        { x: 20, y: 90 },
        { x: -20, y: 90 }
      ]);
    });

    it('should return correct value with a translate transformation', () => {
      container = createContainer({ transform: 'translate(2, 3)' });
      container.addChildren([
        createRect({ x: 5, y: 10, width: 1, height: 20 }), // Height
        createRect({ x: 0, y: 0, width: 10, height: 2 }), // Width
        createRect({ x: -10, y: -20, width: 1, height: 2 }) // x,y
      ]);
      container.children.forEach(c => c.resolveGlobalTransform());
      expect(container.bounds(true)).to.deep.equal([
        { x: -8, y: -17 },
        { x: 12, y: -17 },
        { x: 12, y: 33 },
        { x: -8, y: 33 }
      ]);
    });

    it('should return correct value with a rotate transformation', () => {
      container = createContainer({ transform: 'rotate(45)' });
      container.addChildren([
        createRect({ x: 5, y: 10, width: 1, height: 20 }),
        createRect({ x: 0, y: 0, width: 10, height: 2 }),
        createRect({ x: -10, y: -20, width: 1, height: 2 })
      ]);
      container.children.forEach(c => c.resolveGlobalTransform());
      expect(container.bounds(true)).to.deep.equal([
        { x: -17.677669529663685, y: -21.213203435596427 },
        { x: 7.778174593052022, y: -21.213203435596427 },
        { x: 7.778174593052022, y: 25.45584412271571 },
        { x: -17.677669529663685, y: 25.45584412271571 }
      ]);
    });
  });

  describe('containsPoint', () => {
    it('should return true if any child contains point', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100 }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200 }));

      const r = container.containsPoint({ x: 550, y: 550 });
      expect(r).to.equal(true);
    });

    it('should return true if any childs child contains point', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100 }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200 }));
      const childContainer = createContainer();
      childContainer.addChild(createRect({ x: 0, y: 0, width: 200, height: 200 }));
      childContainer.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));
      container.addChild(childContainer);

      const r = container.containsPoint({ x: 1550, y: 1550 });
      expect(r).to.equal(true);
    });

    it('should return false if no child contains point', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100 }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200 }));

      const r = container.containsPoint({ x: 0, y: 0 });
      expect(r).to.equal(false);
    });

    it('should return true if bounds contains point', () => {
      container = createContainer({ collider: { type: 'bounds' } });
      container.addChild(createRect({ x: 0, y: 0, width: 100, height: 100 }));
      container.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.containsPoint({ x: 2, y: 2 });
      expect(r).to.equal(true);
    });

    it('should return true if custom collider contains point', () => {
      container = createContainer({ collider: { type: 'rect', x: 0, y: 0, width: 100, height: 100 } });
      container.addChild(createRect({ x: 0, y: 0, width: 100, height: 100 }));
      container.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.containsPoint({ x: 2, y: 2 });
      expect(r).to.equal(true);
    });

    it('should return true if frontChild contains point', () => {
      container = createContainer({ collider: { type: 'frontChild' } });
      container.addChild(createRect({ x: 0, y: 0, width: 100, height: 100 }));
      container.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.containsPoint({ x: 2, y: 2 });
      expect(r).to.equal(true);
    });
  });

  describe('intersectsLine', () => {
    it('should return true if any child intersects line', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100 }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200 }));

      const r = container.intersectsLine({ x1: 550, y1: 550, x2: 0, y2: 0 });
      expect(r).to.equal(true);
    });

    it('should return true if any childs child intersects line', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100 }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200 }));
      const childContainer = createContainer();
      childContainer.addChild(createRect({ x: 0, y: 0, width: 200, height: 200 }));
      childContainer.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));
      container.addChild(childContainer);

      const r = container.intersectsLine({ x1: 1550, y1: 1550, x2: 2000, y2: 2000 });
      expect(r).to.equal(true);
    });

    it('should return false if no child intersects line', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100 }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200 }));
      const childContainer = createContainer();
      childContainer.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.intersectsLine({ x1: 2, y1: 2, x2: 0, y2: 0 });
      expect(r).to.equal(false);
    });

    it('should return true if bounds intersects line', () => {
      container = createContainer({ collider: { type: 'bounds' } });
      container.addChild(createRect({ x: 0, y: 0, width: 100, height: 100 }));
      container.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.intersectsLine({ x1: 2, y1: 2, x2: 0, y2: 0 });
      expect(r).to.equal(true);
    });

    it('should return true if custom collider intersects line', () => {
      container = createContainer({ collider: { type: 'rect', x: 0, y: 0, width: 100, height: 100 } });
      container.addChild(createRect({ x: 0, y: 0, width: 100, height: 100 }));
      container.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.intersectsLine({ x1: 2, y1: 2, x2: 0, y2: 0 });
      expect(r).to.equal(true);
    });

    it('should return true if frontChild intersects line', () => {
      container = createContainer({ collider: { type: 'frontChild' } });
      container.addChild(createRect({ x: 0, y: 0, width: 100, height: 100 }));
      container.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.intersectsLine({ x1: 2, y1: 2, x2: 0, y2: 0 });
      expect(r).to.equal(true);
    });
  });

  describe('intersectsRect', () => {
    it('should return true if any child intersects rect', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100 }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200 }));

      const r = container.intersectsRect({ x: 550, y: 550, width: 100, height: 100 });
      expect(r).to.equal(true);
    });

    it('should return true if bounds intersects rect', () => {
      container = createContainer({ collider: { type: 'bounds' } });
      container.addChild(createRect({ x: 0, y: 0, width: 100, height: 100 }));
      container.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.intersectsRect({ x: 550, y: 550, width: 100, height: 100 });
      expect(r).to.equal(true);
    });

    it('should return true if custom collider intersects rect', () => {
      container = createContainer({ collider: { type: 'rect', x: 0, y: 0, width: 100, height: 100 } });
      container.addChild(createRect({ x: 0, y: 0, width: 100, height: 100 }));
      container.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.intersectsRect({ x: 2, y: 2, width: 2, height: 2 });
      expect(r).to.equal(true);
    });

    it('should return true if frontChild intersects rect', () => {
      container = createContainer({ collider: { type: 'frontChild' } });
      container.addChild(createRect({ x: 0, y: 0, width: 100, height: 100 }));
      container.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.intersectsRect({ x: 20, y: 20, width: 2, height: 2 });
      expect(r).to.equal(true);
    });

    it('should return true if any childs child intersects rect', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100 }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200 }));
      const childContainer = createContainer();
      childContainer.addChild(createRect({ x: 0, y: 0, width: 200, height: 200 }));
      childContainer.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));
      container.addChild(childContainer);

      const r = container.intersectsRect({ x: 1550, y: 1550, width: 100, height: 100 });
      expect(r).to.equal(true);
    });

    it('should return false if no child intersects rect', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100 }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200 }));
      const childContainer = createContainer();
      childContainer.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.intersectsRect({ x: 0, y: 0, width: 100, height: 100 });
      expect(r).to.equal(false);
    });
  });

  describe('intersectsCircle', () => {
    it('should return true if any child intersects circle', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100 }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200 }));

      const r = container.intersectsCircle({ x: 550, y: 550, r: 10 });
      expect(r).to.equal(true);
    });

    it('should return true if bounds intersects circle', () => {
      container = createContainer({ collider: { type: 'bounds' } });
      container.addChild(createRect({ x: 0, y: 0, width: 100, height: 100 }));
      container.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.intersectsCircle({ x: 550, y: 550, r: 100 });
      expect(r).to.equal(true);
    });

    it('should return true if custom collider intersects circle', () => {
      container = createContainer({ collider: { type: 'rect', x: 0, y: 0, width: 100, height: 100 } });
      container.addChild(createRect({ x: 0, y: 0, width: 100, height: 100 }));
      container.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.intersectsCircle({ x: 2, y: 2, r: 2 });
      expect(r).to.equal(true);
    });

    it('should return true if frontChild intersects circle', () => {
      container = createContainer({ collider: { type: 'frontChild' } });
      container.addChild(createRect({ x: 0, y: 0, width: 100, height: 100 }));
      container.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.intersectsCircle({ x: 20, y: 20, r: 2 });
      expect(r).to.equal(true);
    });

    it('should return true if any childs child intersects circle', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100 }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200 }));
      const childContainer = createContainer();
      childContainer.addChild(createRect({ x: 0, y: 0, width: 200, height: 200 }));
      childContainer.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));
      container.addChild(childContainer);

      const r = container.intersectsCircle({ x: 1550, y: 1550, r: 100 });
      expect(r).to.equal(true);
    });

    it('should return false if no child intersects circle', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100 }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200 }));
      const childContainer = createContainer();
      childContainer.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200 }));

      const r = container.intersectsCircle({ x: 0, y: 0, r: 100 });
      expect(r).to.equal(false);
    });
  });

  describe('getItemsFrom', () => {
    it('should return an empty array if call has no argument', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2' }));

      const items = container.getItemsFrom();

      expect(items).to.be.empty;
    });

    it('should return an empty array if call argument is an empty object', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2' }));

      const items = container.getItemsFrom({});

      expect(items).to.be.empty;
    });

    it('should return an empty array if call argument is null', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2' }));

      const items = container.getItemsFrom(null);

      expect(items).to.be.empty;
    });

    it('should return an empty array if call argument shape is not supported', () => {
      container = createContainer();
      container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
      container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2' }));

      const items = container.getItemsFrom({ a: 1, b: 2, c: 20, width: 20 });

      expect(items).to.be.empty;
    });

    describe('Bounds', () => {
      it('should return the bounding node', () => {
        container = createContainer({ collider: { type: 'bounds' }, fill: 'container' });
        container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
        container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2' }));

        const items = container.getItemsFrom({ x: 550, y: 550 });

        expect(items.map(i => i.node.attrs.fill)).to.deep.equal(['container']);
      });

      it('should include childrens children', () => {
        container = createContainer({ collider: { type: 'bounds' }, fill: 'container' });
        container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
        container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2' }));
        const childContainer = createContainer({ fill: 'childContainer' });
        childContainer.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200, fill: 'containerRect3' }));
        container.addChild(childContainer);

        const items = container.getItemsFrom({ x: 1550, y: 1550 });

        expect(items.map(i => i.node.attrs.fill)).to.deep.equal(['container']);
      });

      it('should return empty result if no collision is detected', () => {
        container = createContainer({ collider: { type: 'bounds' }, fill: 'container' });
        container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
        container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2' }));

        const items = container.getItemsFrom({ x: 400, y: 450 });

        expect(items).to.be.empty;
      });

      it('should handle polygon as input shape', () => {
        container = createContainer({ collider: { type: 'bounds' }, fill: 'container' });
        container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
        container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2' }));
        const vertices = [
          { x: 0, y: 0 },
          { x: 500, y: 550 },
          { x: 600, y: 50 }
        ];
        const items = container.getItemsFrom({ vertices });

        expect(items).to.not.be.empty;
      });
    });

    describe('FrontChild', () => {
      it('should return the first colliding child node', () => {
        container = createContainer({ collider: { type: 'frontChild' }, fill: 'container' });
        container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
        container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2' }));

        const items = container.getItemsFrom({ x: 550, y: 550 });

        expect(items.map(i => i.node.attrs.fill)).to.deep.equal(['containerRect2']);
      });

      it('should include childrens children', () => {
        container = createContainer({ collider: { type: 'frontChild' }, fill: 'container' });
        container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
        container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2' }));
        const childContainer = createContainer({ fill: 'childContainer' });
        childContainer.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect3' }));
        container.addChild(childContainer);

        const items = container.getItemsFrom({ x: 550, y: 550 });

        expect(items.map(i => i.node.attrs.fill)).to.deep.equal(['containerRect3']);
      });

      it('should ignore children with no collider', () => {
        container = createContainer({ collider: { type: 'frontChild' }, fill: 'container' });
        container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
        container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2', collider: { type: null } }));

        const items = container.getItemsFrom({ x: 550, y: 550 });

        expect(items.map(i => i.node.attrs.fill)).to.deep.equal(['containerRect1']);
      });

      it('should return empty result if there are no children', () => {
        container = createContainer({ collider: { type: 'frontChild' }, fill: 'container' });

        const items = container.getItemsFrom({ x: 550, y: 550 });

        expect(items).to.be.empty;
      });
    });

    describe('Default collider', () => {
      it('should return the all colliding child nodes', () => {
        container = createContainer({ fill: 'container' });
        container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
        container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2' }));
        container.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200, fill: 'containerRect3' }));

        const items = container.getItemsFrom({ x: 550, y: 550 });

        expect(items.map(i => i.node.attrs.fill)).to.deep.equal(['containerRect1', 'containerRect2']);
      });

      it('should include childrens children', () => {
        container = createContainer({ fill: 'container' });
        container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
        container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2' }));
        const childContainer = createContainer({ fill: 'childContainer' });
        childContainer.addChild(createRect({ x: 1500, y: 1500, width: 200, height: 200, fill: 'containerRect3' }));
        container.addChild(childContainer);

        const items = container.getItemsFrom({ x: 1550, y: 1550 });

        expect(items.map(i => i.node.attrs.fill)).to.deep.equal(['containerRect3']);
      });

      it('should return ignore children with no collider', () => {
        container = createContainer({ fill: 'container' });
        container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
        container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2', collider: { type: null } }));

        const items = container.getItemsFrom({ x: 550, y: 550 });

        expect(items.map(i => i.node.attrs.fill)).to.deep.equal(['containerRect1']);
      });

      it('should return empty result if there are no children', () => {
        container = createContainer({ fill: 'container' });

        const items = container.getItemsFrom({ x: 550, y: 550 });

        expect(items).to.be.empty;
      });

      it('should return empty result if there are no colliding children', () => {
        container = createContainer({ fill: 'container' });
        container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));
        container.addChild(createRect({ x: 500, y: 500, width: 200, height: 200, fill: 'containerRect2' }));

        const items = container.getItemsFrom({ x: 450, y: 450 });

        expect(items).to.be.empty;
      });
    });

    describe('Custom collider', () => {
      it('should return the colliding container', () => {
        container = createContainer({ collider: { type: 'rect', x: 500, y: 500, width: 100, height: 100 }, fill: 'container' });
        container.addChild(createRect({ x: 0, y: 0, width: 100, height: 100, fill: 'containerRect1' }));

        const items = container.getItemsFrom({ x: 550, y: 550 });

        expect(items.map(i => i.node.attrs.fill)).to.deep.equal(['container']);
      });

      it('should return the colliding container if child collider also matches', () => {
        container = createContainer({ collider: { type: 'rect', x: 500, y: 500, width: 100, height: 100 }, fill: 'container' });
        container.addChild(createRect({ x: 500, y: 500, width: 100, height: 100, fill: 'containerRect1' }));

        const items = container.getItemsFrom({ x: 550, y: 550 });

        expect(items.map(i => i.node.attrs.fill)).to.deep.equal(['container']);
      });

      it('should not collide if custom collider doesnt but child collider does', () => {
        container = createContainer({ collider: { type: 'rect', x: 500, y: 500, width: 100, height: 100 }, fill: 'container' });
        container.addChild(createRect({ x: 0, y: 0, width: 100, height: 100, fill: 'containerRect1' }));
        const childContainer = createContainer({ collider: { type: 'bounds' }, fill: 'childContainer' });
        childContainer.addChild(createRect({ x: 0, y: 0, width: 200, height: 200, fill: 'containerRect2' }));

        const items = container.getItemsFrom({ x: 10, y: 10 });

        expect(items).to.be.empty;
      });

      it('should return empty result if no collision is detected', () => {
        container = createContainer({ collider: { type: 'rect', x: 500, y: 500, width: 100, height: 100 }, fill: 'containerBounds' });

        const items = container.getItemsFrom({ x: 400, y: 450 });

        expect(items).to.be.empty;
      });
    });
  });
});
