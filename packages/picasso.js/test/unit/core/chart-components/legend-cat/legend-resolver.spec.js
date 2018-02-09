import resolveSettings from '../../../../../src/core/chart-components/legend-cat/legend-resolver';

describe('legend-resolver', () => {
  it('should resolve defaults', () => {
    const resolved = resolveSettings({
      scale: {
        data: () => ({ fields: [{}] }),
        domain: () => ['a', 'b'],
        labels: () => ['alpha', 'beta'],
        datum: () => ({ value: 'does not matter' }) // the value in datum is taken from domain
      },
      settings: {
        settings: {}
      },
      style: {
        item: {}
      },
      resolver: {
        resolve: x => x // return param - a simple way to test what params are passed in (and avoid spies)
      }
    });
    expect(resolved.labels).to.eql({
      data: { items: [{ value: 'a', label: 'alpha' }, { value: 'b', label: 'beta' }] },
      defaults: {
        fontSize: '12px',
        fontFamily: 'Arial',
        fill: '#595959',
        wordBreak: 'none',
        maxLines: 2,
        maxWidth: 136,
        lineHeight: 1.2
      },
      settings: undefined
    });
  });

  it('should resolve for threshold scale', () => {
    const resolved = resolveSettings({
      scale: {
        type: 'threshold-color',
        data: () => ({ fields: [{
          key: () => 'measure',
          formatter: () => (v => `$${v}`)
        }] }),
        domain: () => [2, 5, 7]
      },
      settings: {
        settings: {}
      },
      style: {
        item: {}
      },
      resolver: {
        resolve: x => (!x.data.items ? {} : {
          items: x.data.items.map(d => ({
            data: d
          }))
        })
      }
    });
    expect(resolved.labels).to.eql({
      items: [
        { data: { label: '$2 - < $5', value: [2, 5], source: { key: 'measure' } } },
        { data: { label: '$5 - < $7', value: [5, 7], source: { key: 'measure' } } }
      ]
    });
  });

  describe('resolveSettings', () => {
    let resolved;
    beforeEach(() => {
      resolved = resolveSettings({
        scale: {
          data: () => ({ fields: [{}] }),
          domain: () => ['a', 'b'],
          datum: d => ({ value: d })
        },
        settings: {
          settings: {
            item: {
              show: false,
              label: { font: 'Arial' },
              shape: { size: 17 }
            },
            title: {
              font: 'red'
            },
            layout: {
              whatevz: 'yes'
            }
          }
        },
        style: {
          item: {}
        },
        resolver: {
          resolve: x => x // return param - a simple way to test what params are passed in (and avoid spies)
        }
      });
    });
    it('should resolve labels per datum', () => {
      expect(resolved.labels).to.eql({
        data: { items: [{ value: 'a' }, { value: 'b' }] },
        defaults: {
          fontSize: '12px',
          fontFamily: 'Arial',
          fill: '#595959',
          wordBreak: 'none',
          maxLines: 2,
          maxWidth: 136,
          lineHeight: 1.2
        },
        settings: { font: 'Arial' }
      });
    });

    it('should resolve items per datum', () => {
      expect(resolved.items).to.eql({
        data: { items: [{ value: 'a' }, { value: 'b' }] },
        defaults: {
          show: true
        },
        settings: { show: false }
      });
    });

    it('should resolve symbols per datum', () => {
      expect(resolved.symbols).to.eql({
        data: { items: [{ value: 'a' }, { value: 'b' }] },
        defaults: {
          type: 'square',
          size: 12
        },
        settings: { size: 17 }
      });
    });

    it('should resolve title', () => {
      expect(resolved.title).to.eql({
        data: { fields: [{}] },
        defaults: {
          anchor: 'start',
          show: true,
          fontSize: '16px',
          fontFamily: 'Arial',
          fill: '#595959',
          wordBreak: 'none',
          maxLines: 2,
          maxWidth: 156,
          lineHeight: 1.25
        },
        settings: { font: 'red' }
      });
    });

    it('should resolve layout', () => {
      expect(resolved.layout).to.eql({
        data: { fields: [{}] },
        defaults: {
          direction: 'ltr',
          size: 1
        },
        settings: { whatevz: 'yes' }
      });
    });
  });
});
