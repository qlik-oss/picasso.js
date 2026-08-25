import extractor from '../extractor';

describe('extractor', () => {
  let context;
  let extractStub;

  beforeEach(() => {
    extractStub = (ctx) => ctx.node;

    context = {
      chart: { scale: 0, formatter: 1 },
      scale: 2,
      h: 3,
      props: {
        extract: extractStub,
      },
    };
  });

  it('should return extracted items', () => {
    const nodes = [0, 1, 2];
    const items = extractor(nodes, context);

    expect(items).to.deep.equal(nodes);
  });
});
