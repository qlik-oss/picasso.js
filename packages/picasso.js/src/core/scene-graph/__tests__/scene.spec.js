import scene from '../scene';
import { create as createStage } from '../display-objects/stage';

describe('Scene', () => {
  let stage,
    rect,
    container;

  beforeEach(() => {
    rect = {
      type: 'rect'
    };
    container = {
      type: 'container'
    };
  });

  it('should accept a custom stage', () => {
    const myStage = createStage();
    myStage.test = true;
    stage = scene({ items: [], stage: myStage });
    expect(stage.test).to.equal(true);
  });

  describe('Disabled nodes', () => {
    it('should resolve as a function', () => {
      const spy = sinon.spy();
      rect.disabled = spy;
      stage = scene({ items: [rect] });
      expect(spy).to.have.been.calledOnce;
    });

    it('should not parse node if disabled', () => {
      rect.disabled = true;
      const enabled = { type: 'circle' };
      stage = scene({ items: [rect, enabled] });
      expect(stage.children).to.be.of.length(1);
      expect(stage.children[0].type).to.equal('circle');
    });
  });

  describe('Events', () => {
    it('should accept create events', () => {
      let spy = sinon.spy();
      stage = scene({
        items: [rect, rect],
        on: {
          create: [spy]
        }
      });

      expect(spy.callCount).to.equal(2); // should be evaluated for every item
      const args = spy.args[0][0];
      expect(args.siblings).to.be.of.length(2);
      expect(args.index).to.be.equal(1);
      expect(args.node).to.be.deep.equal(rect);
    });
  });

  describe('Transform', () => {
    it('should handle transform on a flat structure', () => {
      const r1 = rect;
      const r2 = { ...rect };
      const r3 = { ...rect };
      r1.transform = 'translate(50, 50)';
      r2.transform = 'translate(20, 20)';
      stage = scene({ items: [r1, r2, r3] });
      const r1do = stage.children[0];
      const r2do = stage.children[1];
      const r3do = stage.children[2];
      expect(r1do.modelViewMatrix.elements).to.deep.equal([
        [1, 0, 50],
        [0, 1, 50],
        [0, 0, 1]
      ]);
      expect(r2do.modelViewMatrix.elements).to.deep.equal([
        [1, 0, 20],
        [0, 1, 20],
        [0, 0, 1]
      ]);
      expect(r3do.modelViewMatrix).to.equal(undefined);
    });

    it('should handle transform on a hierarchical structure', () => {
      const r1 = rect;
      const c1 = { ...container };
      const c2 = { ...container };
      c1.transform = 'translate(50, 50)';
      c2.transform = 'translate(20, 20)';
      container.children = [c1];
      c1.children = [c2];
      c2.children = [r1];
      stage = scene({ items: [container] });
      const c1do = stage.children[0].children[0];
      const c2do = c1do.children[0];
      const r1do = c2do.children[0];
      expect(c1do.modelViewMatrix.elements).to.deep.equal([
        [1, 0, 50],
        [0, 1, 50],
        [0, 0, 1]
      ]);
      expect(c2do.modelViewMatrix.elements).to.deep.equal([
        [1, 0, 70],
        [0, 1, 70],
        [0, 0, 1]
      ]);
      expect(r1do.modelViewMatrix.elements).to.deep.equal([
        [1, 0, 70],
        [0, 1, 70],
        [0, 0, 1]
      ]);
    });

    it('should handle transform on a complex hierarchical structure', () => {
      container.transform = 'translate(100, 100)';
      const r1 = rect;
      const r2 = { ...rect };
      const r3 = { ...rect };
      const r0 = { ...rect };
      r0.transform = 'translate(3, 3)';
      r2.transform = 'translate(50, 50)';
      container.children = [r1, r2];
      stage = scene({ items: [r0, container, r3] });
      const r0do = stage.children[0];
      const c1do = stage.children[1];
      const r1do = c1do.children[0];
      const r2do = c1do.children[1];
      const r3do = stage.children[2];
      expect(r0do.modelViewMatrix.elements).to.deep.equal([
        [1, 0, 3],
        [0, 1, 3],
        [0, 0, 1]
      ], 'r0do');
      expect(c1do.modelViewMatrix.elements).to.deep.equal([
        [1, 0, 100],
        [0, 1, 100],
        [0, 0, 1]
      ], 'c1do');
      expect(r1do.modelViewMatrix.elements).to.deep.equal([
        [1, 0, 100],
        [0, 1, 100],
        [0, 0, 1]
      ], 'r1do');
      expect(r2do.modelViewMatrix.elements).to.deep.equal([
        [1, 0, 150],
        [0, 1, 150],
        [0, 0, 1]
      ], 'r2do');
      expect(r3do.modelViewMatrix).to.equal(undefined, 'r3do');
    });
  });
});
