import * as boxShapesHelper from '../box-shapes-helper';
import buildShapes from '../box-shapes';

describe('buildShapes', () => {
  let sandbox;
  let resolved;
  let keys;
  let boxWidth;

  beforeEach(() => {
    boxWidth = 10;
    sandbox = sinon.createSandbox();
    sandbox.stub(boxShapesHelper, 'oob').returns('oob');
    sandbox.stub(boxShapesHelper, 'box').returns('box');
    sandbox.stub(boxShapesHelper, 'verticalLine').returns('verticalLine');
    sandbox.stub(boxShapesHelper, 'horizontalLine').returns('horizontalLine');
    sandbox.stub(boxShapesHelper, 'getBoxWidth').returns(boxWidth);

    keys = ['box'];
    resolved = {
      major: {
        items: [
          {
            major: 'major value',
          },
        ],
        settings: {
          major: {
            scale: {},
          },
        },
      },
      minor: {
        items: [
          {
            start: 0,
            end: 0.5,
            min: 0,
            max: 1,
            median: 0.5,
            med: 0.5,
            whisker: {},
            oob: {},
          },
        ],
        settings: { start: 100, end: 200 },
      },
      box: {
        items: [1],
      },
      line: {
        items: [2],
      },
      median: {
        items: [3],
      },
      whisker: {
        items: [4],
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return box marker when keys contains only box and there is no out-of-bounds', () => {
    const shapes = buildShapes({ resolved, keys });
    expect(shapes[0].children).to.deep.equal(['box']);
  });

  it('should return line markers when keys contains only line and there is no out-of-bounds', () => {
    keys = ['line'];
    const shapes = buildShapes({ resolved, keys });
    expect(shapes[0].children).to.deep.equal(['verticalLine', 'verticalLine']);
  });

  it('should return median marker when keys contains only median and there is no out-of-bounds', () => {
    keys = ['median'];
    const shapes = buildShapes({ resolved, keys });
    expect(shapes[0].children).to.deep.equal(['horizontalLine']);
  });

  it('should return whisker marker when keys contains only whisker and there is no out-of-bounds', () => {
    keys = ['whisker'];
    const shapes = buildShapes({ resolved, keys });
    expect(shapes[0].children).to.deep.equal(['horizontalLine', 'horizontalLine']);
  });

  it('should return out-of-bounds marker there is out-of-bounds', () => {
    keys = ['box', 'line', 'median', 'whisker'];
    resolved.minor.items[0].start = -1;
    resolved.minor.items[0].end = -0.5;
    const shapes = buildShapes({ resolved, keys });
    expect(shapes[0].children).to.deep.equal(['oob']);
  });

  it('should not return shapes that have show === false', () => {
    resolved = {
      major: {
        items: [{ major: 'first' }, { major: 'second' }],
        settings: { major: { scale: {} } },
      },
      minor: {
        items: [
          {
            start: 0,
            end: 0.5,
            min: 0,
            max: 1,
            median: 0.5,
            med: 0.5,
          },
          {
            start: 0,
            end: 0.5,
            min: 0,
            max: 1,
            median: 0.5,
            med: 0.5,
          },
        ],
        settings: { start: 100, end: 200 },
      },
      box: {
        items: [1, { show: false }],
      },
      line: {
        items: [1, { show: false }],
      },
      median: {
        items: [1, { show: false }],
      },
      whisker: {
        items: [1, { show: false }],
      },
    };

    keys = ['box', 'line', 'median', 'whisker'];
    const shapes = buildShapes({ resolved, keys });
    expect(shapes[0].children).to.eql([
      'box',
      'verticalLine',
      'verticalLine',
      'horizontalLine',
      'horizontalLine',
      'horizontalLine',
    ]);
    expect(shapes[1].children).to.eql([]);
  });
});
