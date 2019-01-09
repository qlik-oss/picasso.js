import patternizer from '../svg-pattern';

describe('svg-pattern', () => {
  let p;
  let bucket;
  let clock;
  let hasher;

  beforeEach(() => {
    bucket = [];
    clock = sinon.useFakeTimers(13);
    let i = 1;
    hasher = () => ++i;
    p = patternizer(bucket, hasher);
  });

  afterEach(() => {
    clock.restore();
  });

  describe('onCreate', () => {
    it('should set fillReference when fill is a pattern', () => {
      const state = {
        node: {
          fill: {
            type: 'pattern',
            shapes: []
          }
        }
      };
      p.onCreate(state);

      expect(state.node.fillReference).to.equal('url(\'#picasso-pattern-13-2\')');
    });

    it('should set strokeReference when stroke is a pattern', () => {
      const state = {
        node: {
          stroke: {
            type: 'pattern',
            shapes: []
          }
        }
      };
      p.onCreate(state);

      expect(state.node.strokeReference).to.equal('url(\'#picasso-pattern-13-2\')');
    });

    it('should create a pattern node', () => {
      const state = {
        node: {
          stroke: {
            type: 'pattern',
            width: 5,
            height: 6,
            fill: 'red',
            shapes: [
              { type: 'rect' }
            ]
          }
        }
      };
      p.onCreate(state);

      expect(bucket[0]).to.eql({
        patternUnits: 'userSpaceOnUse',
        x: 0,
        y: 0,
        width: 5,
        height: 6,
        fill: 'red',
        type: 'pattern',
        children: [{ type: 'rect' }],
        id: 'picasso-pattern-13-2'
      });
    });

    it('should maintain cache', () => {
      const localBucket = [];
      const localP = patternizer(localBucket, input => input.key);
      localP.onCreate({ node: { fill: { type: 'pattern', shapes: [], key: 'a' } } });
      localP.onCreate({ node: { fill: { type: 'pattern', shapes: [], key: 'b' } } });
      localP.onCreate({ node: { stroke: { type: 'pattern', shapes: [], key: 'b' } } });
      localP.onCreate({ node: { stroke: { type: 'pattern', shapes: [], key: 'a' } } });

      expect(localBucket.length).to.equal(2);
    });
  });
});
