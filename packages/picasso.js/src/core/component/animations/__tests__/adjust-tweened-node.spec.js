import adjustTweenedNodes from '../adjust-tweened-nodes';

describe('adjustTweenedNodes', () => {
  const formatter = sinon.stub();
  formatter.withArgs('si').returns((value) => `${value / 1000000}M`);

  it('should format text nodes correctly', () => {
    const tweenedNodes = [
      { type: 'text', data: { value: '1234000', formatterKey: 'si' } },
      { type: 'circle', data: { value: '56780', formatterKey: 'si' } },
    ];

    adjustTweenedNodes({ tweenedNodes, formatter });

    expect(tweenedNodes[0].text).to.equal('1.234M');
    expect(tweenedNodes[1].text).to.equal(undefined);
  });

  it('should not modify nodes without data or value or formatterKey', () => {
    const tweenedNodes = [
      { type: 'text', data: null },
      { type: 'text', data: { value: '1234000' } },
      { type: 'text', data: { formatterKey: 'si' } },
    ];

    adjustTweenedNodes({ tweenedNodes, formatter });

    expect(tweenedNodes[0].text).to.equal(undefined);
    expect(tweenedNodes[1].text).to.equal(undefined);
    expect(tweenedNodes[2].text).to.equal(undefined);
  });
});
