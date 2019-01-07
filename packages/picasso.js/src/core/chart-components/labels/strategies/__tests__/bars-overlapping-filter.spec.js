import create, { binaryLeftSearch } from '../bars-overlapping-filter';

describe('binaryLeftSearch', () => {
  let ary;

  beforeEach(() => {
    ary = [
      { rect: { x: 0, width: 10 } },
      { rect: { x: 20, width: 10 } },
      { rect: { x: 40, width: 10 } }, // 2
      { rect: { x: 70, width: 10 } }
    ];
  });

  it('should find the first node that may intersect the label', () => {
    const left = binaryLeftSearch({ x: 50 }, ary, 'x', 'width', 'rect');
    expect(left).to.equal(2); // x: 40, width: 10 may intersect x: 50
  });

  it('should find the first node that may intersect the label when there are duplicate nodes', () => {
    ary = [
      { rect: { x: 0, width: 10 } },
      { rect: { x: 20, width: 10 } },
      { rect: { x: 39, width: 10 } },
      { rect: { x: 40, width: 10 } }, // 3
      { rect: { x: 40, width: 10 } },
      { rect: { x: 40, width: 10 } },
      { rect: { x: 40, width: 10 } },
      { rect: { x: 70, width: 10 } },
      { rect: { x: 80, width: 10 } }
    ];
    const left = binaryLeftSearch({ x: 50 }, ary, 'x', 'width', 'rect');
    expect(left).to.equal(3); // x: 40, width: 10 may intersect x: 50
  });

  it('should handle no possible intersections', () => {
    let left = binaryLeftSearch({ x: -999 }, ary, 'x', 'width', 'rect');
    expect(left).to.equal(0); // Return first index

    left = binaryLeftSearch({ x: 999 }, ary, 'x', 'width', 'rect');
    expect(left).to.equal(3); // Return last index
  });
});

describe('filter overlapping labels', () => {
  let context;
  function createBounds(x, y, width, height) {
    return {
      x,
      y,
      width,
      height
    };
  }

  beforeEach(() => {
    context = {
      orientation: 'v',
      container: {
        x: 0,
        y: 0,
        width: 100,
        height: 100
      }
    };
  });

  it('should not filter if collision with self', () => {
    const node = { localBounds: createBounds(10, 10, 20, 20) };
    const labelMeta = { node, textBounds: node.localBounds };
    context.nodes = [node];
    context.labels = [labelMeta];
    const filter = create(context);
    const labels = [0];
    expect(labels.filter(filter)).to.eql(labels);
  });

  it('should not filter by text to text collision if label already have been removed', () => {
    const node0 = { localBounds: createBounds(-1, 0, 20, 1) };
    const node1 = { localBounds: createBounds(10, 0, 20, 2) };
    const labelMeta0 = { node: node0, textBounds: createBounds(-1, 1, 20, 20) }; // Removed beccause its partially outside the containr
    const labelMeta1 = { node: node1, textBounds: createBounds(10, 2, 20, 20) };
    context.nodes = [node0, node1];
    context.labels = [labelMeta0, labelMeta1];
    const filter = create(context);
    const labels = [0, 1];
    expect(labels.filter(filter)).to.eql([1]);
  });

  it('should filter if not fully inside the container', () => {
    const node0 = { localBounds: createBounds(-1, 0, 20, 1) };
    const labelMeta0 = { node: node0, textBounds: createBounds(-1, 1, 20, 20) }; // Removed beccause its partially outside the containr
    context.nodes = [node0];
    context.labels = [labelMeta0];
    const filter = create(context);
    const labels = [0];
    expect(labels.filter(filter)).to.eql([]);
  });

  it('should filter by text to text collision', () => {
    const node0 = { localBounds: createBounds(0, 0, 5, 1) };
    const node1 = { localBounds: createBounds(10, 0, 10, 2) };
    const labelMeta0 = { node: node0, textBounds: createBounds(0, 10, 20, 20) };
    const labelMeta1 = { node: node1, textBounds: createBounds(10, 10, 20, 20) };
    context.nodes = [node0, node1];
    context.labels = [labelMeta0, labelMeta1];
    const filter = create(context);
    const labels = [0, 1];
    expect(labels.filter(filter)).to.eql([0]);
  });

  it('should filter by text to node collision', () => {
    const node0 = { localBounds: createBounds(0, 0, 5, 20) };
    const node1 = { localBounds: createBounds(10, 0, 10, 2) };
    const labelMeta0 = { node: node0, textBounds: createBounds(0, 1, 20, 1) };
    const labelMeta1 = { node: node1, textBounds: createBounds(10, 2, 20, 20) };
    context.nodes = [node0, node1];
    context.labels = [labelMeta0, labelMeta1];
    const filter = create(context);
    const labels = [0, 1];
    expect(labels.filter(filter)).to.eql([1]);
  });
});
