import settingsResolver from '../../../../src/core/component/settings-resolver';

describe('', () => {
  let res;
  let normalizeSettings;
  let resolveForItem;
  let updateScaleSize;
  beforeEach(() => {
    normalizeSettings = (...args) => [...args].join('-');
    resolveForItem = (datum, norm) => ({ norm, datum });
    updateScaleSize = sinon.stub();
    res = settingsResolver({
      chart: 'c'
    }, {
      normalizeSettings,
      resolveForItem,
      updateScaleSize
    });
  });
  it('should call externals with proper arguments', () => {
    const resolved = res.resolve({
      settings: 's',
      defaults: 'd',
      data: {
        items: ['a']
      }
    });
    expect(resolved.items).to.eql([{
      norm: 's-d-c',
      datum: 'a',
      data: 'a'
    }]);
  });
});
