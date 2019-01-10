import settingsResolver from '../settings-resolver';

describe('settings resolver', () => {
  let res;
  let normalizeSettings;
  let resolveForItem;
  let updateScaleSize;

  beforeEach(() => {
    normalizeSettings = (...args) => [...args].join('-');
    resolveForItem = ({ datum, data }, norm, idx) => ({
      norm,
      datum,
      data,
      idx
    });
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
      data: 'a',
      idx: 0
    }]);
  });

  it('should call externals with proper arguments when no dataset is provided', () => {
    const resolved = res.resolve({
      settings: 's',
      defaults: 'd',
      data: 'a'
    });

    expect(resolved).to.eql({
      settings: 's-d-c',
      item: {
        norm: 's-d-c',
        datum: undefined,
        data: 'a',
        idx: -1
      }
    });
  });
});
