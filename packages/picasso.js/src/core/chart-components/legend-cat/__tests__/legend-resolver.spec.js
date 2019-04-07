import resolveSettings from '../legend-resolver';

describe('legend-resolver', () => {
  it('should resolve defaults', () => {
    const resolved = resolveSettings({
      scale: {
        data: () => ({ fields: [{}] }),
        domain: () => ['a', 'b'],
        labels: () => ['alpha', 'beta'],
        datum: () => ({ value: 'does not matter' }) // the value in datum is taken from domain
      },
      userSettings: {
        layout: {},
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
        data: () => ({
          fields: [{
            id: () => 'measure',
            formatter: () => (v => `$${v}`)
          }]
        }),
        domain: () => [2, 5, 7]
      },
      userSettings: {
        layout: {},
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
        { data: { label: '$5 - < $7', value: [5, 7], source: { field: 'measure' } } },
        { data: { label: '$2 - < $5', value: [2, 5], source: { field: 'measure' } } }
      ]
    });
  });

  it('should resolve correctly using a custom formatter', () => {
    const resolved = resolveSettings({
      scale: {
        type: 'threshold-color',
        data: () => ({
          fields: [{
            id: () => 'measure'
          }]
        }),
        domain: () => [2, 5, 7]
      },
      userSettings: {
        layout: {},
        formatter: v => `${v}kr`,
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
      },
      chart: {
        formatter: v => v
      }
    });
    expect(resolved.labels).to.eql({
      items: [
        { data: { label: '5kr - < 7kr', value: [5, 7], source: { field: 'measure' } } },
        { data: { label: '2kr - < 5kr', value: [2, 5], source: { field: 'measure' } } }
      ]
    });
  });

  describe('resolveSettings', () => {
    let resolved;
    let component;
    beforeEach(() => {
      component = {
        scale: {
          data: () => ({ fields: [{}] }),
          domain: () => ['a', 'b'],
          datum: d => ({ value: d })
        },
        userSettings: {
          layout: {},
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
      };

      resolved = resolveSettings(component);
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

    it('should resolve labels by `label` function if available', () => {
      component.scale.label = d => `label ${d}`;
      component.scale.domain = () => ['b', 'a'];
      resolved = resolveSettings(component);

      expect(resolved.labels.data.items[0]).to.eql({ value: 'b', label: 'label b' });
      expect(resolved.labels.data.items[1]).to.eql({ value: 'a', label: 'label a' });
    });

    it('should resolve labels by `labels` function if available', () => {
      component.scale.labels = () => ['1', '2']; // Resolved by index
      component.scale.domain = () => ['b', 'a'];
      resolved = resolveSettings(component);

      expect(resolved.labels.data.items[0]).to.eql({ value: 'b', label: '1' });
      expect(resolved.labels.data.items[1]).to.eql({ value: 'a', label: '2' });
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
          size: 1,
          scrollOffset: 0
        },
        settings: { whatevz: 'yes' }
      });
    });
  });
});
