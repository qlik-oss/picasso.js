import create from '../scene-node';
import { create as createRect } from '../display-objects/rect';
import { create as createLine } from '../display-objects/line';
import { create as createCircle } from '../display-objects/circle';
import { create as createContainer } from '../display-objects/container';
import { create as createPath } from '../display-objects/path';

describe('Scene Node', () => {
  let sceneNode;
  let nodeMock;

  beforeEach(() => {
    nodeMock = {
      type: 'mock',
      attrs: {
        a1: 123
      },
      data: 11,
      desc: {
        myProp: 1337
      },
      tag: 'Hello world',
      children: [
        { type: 'child 1' },
        { type: 'child 2' }
      ],
      parent: { type: 'parent node' }
    };

    nodeMock.boundingRect = sinon.stub();
    nodeMock.boundingRect.returns({
      x: 0, y: 0, width: 0, height: 0
    });

    sceneNode = create(nodeMock);
  });

  it('should return child nodes', () => {
    const c = sceneNode.children;
    expect(c).to.be.of.length(2);
    expect(c).to.containSubset([
      { type: 'child 1' },
      { type: 'child 2' }
    ]);
  });

  it('should return parent node', () => {
    expect(sceneNode.parent).to.containSubset({ type: 'parent node' });
  });

  it('should null when there is no parent node', () => {
    nodeMock.parent = null;
    sceneNode = create(nodeMock);
    expect(sceneNode.parent).to.equal(null);
  });

  it('should expose node type', () => {
    expect(sceneNode.type).to.equal('mock');
  });

  it('should expose node data value', () => {
    expect(sceneNode.data).to.equal(11);
  });

  it('should expose node attributes', () => {
    expect(sceneNode.attrs).to.deep.equal({ a1: 123 });
  });

  it('should expose node desc', () => {
    expect(sceneNode.desc).to.deep.equal({
      myProp: 1337
    });
  });

  it('should expose node tag', () => {
    expect(sceneNode.tag).to.equal('Hello world');
  });

  it('should expose node bounds, after any transform', () => {
    const bounds = {
      x: 10, y: 20, width: 30, height: 40
    };
    const rect = createRect({ ...bounds, transform: 'translate(5, 15)' });
    rect.resolveLocalTransform();
    sceneNode = create(rect);

    expect(sceneNode.bounds).to.deep.equal({
      x: 15, y: 35, width: 30, height: 40
    });
  });

  it('should expose node bounds, exluding the dpi scale factor', () => {
    const bounds = {
      x: 10, y: 20, width: 30, height: 40
    };
    nodeMock.boundingRect.returns(bounds);
    nodeMock.stage = {
      dpi: 2
    };
    sceneNode = create(nodeMock);

    expect(sceneNode.bounds).to.deep.equal({
      x: 10 / 2,
      y: 20 / 2,
      width: 30 / 2,
      height: 40 / 2
    });
  });

  it('should handle when node doesnt expose a way to get the bounding rect', () => {
    nodeMock.boundingRect = undefined;
    sceneNode = create(nodeMock);

    expect(sceneNode.bounds).to.deep.equal({
      x: 0,
      y: 0,
      width: 0,
      height: 0
    });
  });

  describe('should expose node collider as a geometrical shape', () => {
    it('rect', () => {
      const rect = createRect({
        x: 10, y: 20, width: 30, height: 40
      });
      sceneNode = create(rect);
      expect(sceneNode.collider).to.deep.equal({
        type: 'rect',
        x: 10,
        y: 20,
        width: 30,
        height: 40
      });
    });

    it('line', () => {
      const line = createLine({
        x1: 10, y1: 20, x2: 30, y2: 40
      });
      sceneNode = create(line);
      expect(sceneNode.collider).to.deep.equal({
        type: 'line',
        x1: 10,
        y1: 20,
        x2: 30,
        y2: 40
      });
    });

    it('circle', () => {
      const circle = createCircle({ cx: 10, cy: 20, r: 30 });
      sceneNode = create(circle);
      expect(sceneNode.collider).to.deep.equal({
        type: 'circle',
        cx: 10,
        cy: 20,
        r: 30
      });
    });

    it('polygon', () => {
      const circle = createCircle({
        cx: 10,
        cy: 20,
        r: 30,
        collider: {
          type: 'polygon',
          vertices: [
            { x: 0, y: 25 },
            { x: 25, y: 0 },
            { x: 50, y: 25 }
          ]
        }
      });
      sceneNode = create(circle);
      expect(sceneNode.collider).to.deep.equal({
        type: 'path',
        d: 'M0 25 L25 0 L50 25 L0 25 Z'
      });
    });

    it('collection', () => {
      const circle = createPath({
        d: 'M0 1',
        collider: [
          {
            type: 'rect', x: 1, y: 2, width: 3, height: 4
          },
          {
            type: 'circle', cx: 1, cy: 2, r: 3
          }
        ]
      });
      sceneNode = create(circle);

      expect(sceneNode.collider).to.deep.equal({
        type: 'container',
        children: [
          {
            type: 'rect', x: 1, y: 2, width: 3, height: 4
          },
          {
            type: 'circle', cx: 1, cy: 2, r: 3
          }
        ]
      });
    });

    it('bounds', () => {
      const container = createContainer({ collider: { type: 'bounds' } });
      container.addChild(createRect({
        x: 10, y: 20, width: 30, height: 40
      }));
      sceneNode = create(container);
      expect(sceneNode.collider).to.deep.equal({
        type: 'rect',
        x: 10,
        y: 20,
        width: 30,
        height: 40
      });
    });

    it('and include any transform on the node', () => {
      const rect = createRect({
        x: 10, y: 20, width: 30, height: 40, transform: 'translate(5, 15)'
      });
      rect.resolveLocalTransform();
      sceneNode = create(rect);
      expect(sceneNode.collider).to.deep.equal({
        type: 'rect',
        x: 15,
        y: 35,
        width: 30,
        height: 40
      });
    });

    it('and handle if node doesnt have any collider', () => {
      const rect = createRect({
        x: 10, y: 20, width: 30, height: 40, collider: { type: null }
      });
      sceneNode = create(rect);
      expect(sceneNode.collider).to.equal(null);
    });
  });
});
