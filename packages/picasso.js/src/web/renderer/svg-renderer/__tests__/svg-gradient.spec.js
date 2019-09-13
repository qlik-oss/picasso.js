import gradienter from '../svg-gradient';

describe('svg-gradient', () => {
  let p;
  let bucket;
  let clock;
  let hasher;

  beforeEach(() => {
    bucket = [];
    clock = sinon.useFakeTimers(13);
    let i = 1;
    hasher = () => ++i;
    p = gradienter(bucket, hasher);
  });

  afterEach(() => {
    clock.restore();
  });

  describe('onCreate', () => {
    it('should set fillReference when fill is a gradient', () => {
      const state = {
        node: {
          fill: {
            type: 'gradient'
          }
        }
      };
      p.onCreate(state);

      expect(state.node.fillReference).to.equal('url(\'#picasso-gradient-13-2\')');
    });

    it('should set strokeReference when stroke is a gradient', () => {
      const state = {
        node: {
          stroke: {
            type: 'gradient'
          }
        }
      };
      p.onCreate(state);

      expect(state.node.strokeReference).to.equal('url(\'#picasso-gradient-13-2\')');
    });

    it('should create a radial gradient node', () => {
      const state = {
        node: {
          fill: {
            type: 'gradient',
            orientation: 'radial',
            // degree: 0,
            stops: [
              { offset: 0, color: 'red', opacity: 0 },
              { offset: 1, color: 'green' }
            ]
          }
        }
      };
      p.onCreate(state);

      expect(bucket[0]).to.eql({
        id: 'picasso-gradient-13-2',
        type: 'radialGradient',
        children: [
          { type: 'stop', offset: '0%', style: 'stop-color:red;stop-opacity:0' },
          { type: 'stop', offset: '100%', style: 'stop-color:green;stop-opacity:1' }
        ]
      });
    });

    it('should create a linear gradient node', () => {
      const state = {
        node: {
          fill: {
            type: 'gradient',
            degree: 0,
            stops: [
              { offset: 0, color: 'red', opacity: 0 },
              { offset: 1, color: 'green' }
            ]
          }
        }
      };
      p.onCreate(state);

      expect(bucket[0]).to.containSubset({
        id: 'picasso-gradient-13-2',
        type: 'linearGradient',
        x1: 1,
        y1: 0,
        y2: 0,
        children: [
          { type: 'stop', offset: '0%', style: 'stop-color:red;stop-opacity:0' },
          { type: 'stop', offset: '100%', style: 'stop-color:green;stop-opacity:1' }
        ]
      });
      expect(bucket[0].x2).be.closeTo(0, 1e-12);
    });

    it('should maintain cache', () => {
      const localBucket = [];
      const localP = gradienter(localBucket, (input) => input.key);
      localP.onCreate({ node: { fill: { type: 'gradient', key: 'a' } } });
      localP.onCreate({ node: { fill: { type: 'gradient', key: 'b' } } });
      localP.onCreate({ node: { stroke: { type: 'gradient', key: 'b' } } });
      localP.onCreate({ node: { stroke: { type: 'gradient', key: 'a' } } });

      expect(localBucket.length).to.equal(2);
    });
  });
});
