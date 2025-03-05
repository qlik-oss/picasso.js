import adjustTweenedNodes from '../adjust-tweened-nodes';

describe('adjustTweenedNodes', () => {
  const formatter = sinon.stub();
  formatter.withArgs('si').returns((value) => `${value / 1000000}M`);

  it('should format text nodes correctly', () => {
    const tweenedNodes = [
      { type: 'text', data: { value: '1234000', formatter: 'si' } },
      { type: 'circle', data: { value: '56780', formatter: 'si' } },
    ];

    adjustTweenedNodes({ tweenedNodes, formatter });

    expect(tweenedNodes[0].text).to.equal('1.234M');
    expect(tweenedNodes[1].text).to.equal(undefined);
  });

  it('should not modify nodes without data or value or formatter', () => {
    const tweenedNodes = [
      { type: 'text', data: null },
      { type: 'text', data: { value: '1234000' } },
      { type: 'text', data: { formatter: 'si' } },
    ];

    adjustTweenedNodes({ tweenedNodes, formatter });

    expect(tweenedNodes[0].text).to.equal(undefined);
    expect(tweenedNodes[1].text).to.equal(undefined);
    expect(tweenedNodes[2].text).to.equal(undefined);
  });
});
