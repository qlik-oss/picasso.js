import themeFn from '..';

describe('Theme', () => {
  it('should find a palette', () => {
    const t = themeFn({}, [
      { key: 'pal', colors: [['a', 'b']] }
    ]);
    expect(t.palette('pal')).to.eql(['a', 'b']);
  });

  it('should find a palette with a minimum number of colors', () => {
    const t = themeFn({}, [
      {
        key: 'pal',
        colors: [
          ['a', 'b'],
          ['a', 'b', 'c', 'd'],
          ['a', 'b', 'c', 'd', 'e']
        ]
      }
    ]);
    expect(t.palette('pal', 4)).to.eql(['a', 'b', 'c', 'd']);
  });

  it('should resolve a style', () => {
    const t = themeFn({
      $font: 'Sans nonsense',
      $label: {
        fontFamily: '$font'
      }
    }, []);
    expect(t.style({ title: '$label' })).to.eql({ title: { fontFamily: 'Sans nonsense' } });
  });
});
