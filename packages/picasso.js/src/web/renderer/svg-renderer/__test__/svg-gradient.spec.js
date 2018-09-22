import {
  resetGradients,
  onGradient,
  createDefsNode
} from '../svg-gradient';

/* eslint no-unused-expressions: 0 */

describe('svg-gradient', () => {
  let state;

  const dummyGradientObject = (secondOffset = 0.5) => ({
    type: 'rect',
    width: 500,
    height: 500,
    x: 50,
    y: 100,
    fill: {
      type: 'gradient',
      degree: 90,
      orientation: 'radial',
      stops: [
        {
          offset: 0,
          color: 'blue'
        },
        {
          offset: secondOffset,
          color: 'green'
        }
      ]
    }
  });

  const dummyNonGradientObject = () => ({
    type: 'rect',
    width: 500,
    height: 500,
    x: 50,
    y: 100,
    fill: 'red'
  });

  beforeEach(() => {
    resetGradients();
    state = {};
  });

  describe('onGradient', () => {
    it('should resolve gradients defintion for fill', () => {
      state.node = dummyGradientObject();
      onGradient(state);

      expect(state.node.type).to.be.equal('rect');
      expect(state.node.children).to.be.undefined;
      expect(state.node.fill).to.include('url(\'#');
    });

    it('should resolve gradients defintion for stroke', () => {
      state.node = dummyGradientObject();
      state.node.stroke = state.node.fill;
      delete state.node.fill;
      onGradient(state);

      expect(state.node.type).to.be.equal('rect');
      expect(state.node.children).to.be.undefined;
      expect(state.node.stroke).to.include('url(\'#');
    });
  });

  describe('createDefsNode', () => {
    it('should cache gradients of the same type', () => {
      const gradients = [dummyGradientObject(), dummyGradientObject()];
      gradients.forEach((g) => {
        state.node = g;
        onGradient(state);
      });
      const defs = createDefsNode();

      expect(defs.type).to.be.equal('defs');
      expect(defs.children).to.be.an('array');
      expect(defs.children).to.have.length(1);

      expect(gradients[0].type).to.be.equal('rect');
      expect(gradients[0].fill).to.include(defs.children[0].id);

      expect(gradients[1].type).to.be.equal('rect');
      expect(gradients[1].fill).to.include(defs.children[0].id);
    });

    it('should not cache non-similar gradients', () => {
      const gradients = [dummyGradientObject(0.2), dummyGradientObject(0.7)];
      gradients.forEach((g) => {
        state.node = g;
        onGradient(state);
      });
      const defs = createDefsNode();

      expect(defs.type).to.be.equal('defs');
      expect(defs.children).to.be.an('array');
      expect(defs.children).to.have.length(2);

      expect(gradients[0].type).to.be.equal('rect');
      expect(gradients[0].fill).to.include(defs.children[0].id);

      expect(gradients[1].type).to.be.equal('rect');
      expect(gradients[1].fill).to.include(defs.children[1].id);
    });

    it('should be disabled if no gradients', () => {
      const gradients = [dummyNonGradientObject(), dummyNonGradientObject()];
      gradients.forEach((g) => {
        state.node = g;
        onGradient(state);
      });
      const defs = createDefsNode();

      expect(defs.disabled()).to.be.true;
    });
  });
});
