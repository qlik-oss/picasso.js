import componentCollectionFn from '../component-collection';

function createComponent(settings) {
  let rect;
  const rend = {
    settings() {
      this.myRendererSettings = 'new settings';
    },
    myRendererSettings: 'old settings',
  };
  return {
    instance: {
      type: settings.type,
      dockConfig() {},
      resize: (r) => {
        rect = r;
      },
      getRect: () => rect,
      renderer: () => rend,
    },
    settings,
    key: settings.key,
    hasKey: typeof settings.key !== 'undefined',
  };
}

describe('component-collection', () => {
  describe('layout', () => {
    const simpleLayoutFn = (r, children) => {
      children.forEach((c) => c.resize(r));
    };
    const hideLayoutFn = (r, children) => ({ visible: [], hidden: children });

    it('should layout components', () => {
      const collection = componentCollectionFn({ createComponent });
      const components = [
        {
          type: 'container',
          key: 'parent',
          strategy: simpleLayoutFn,
          components: [
            {
              type: 'box',
              key: 'child',
            },
          ],
        },
      ];
      collection.set({ components });

      const rect = { x: 0, y: 0, width: 100, height: 100 };

      const { visible, hidden } = collection.layout({ layoutSettings: simpleLayoutFn, rect });
      expect(hidden).to.eql([]);
      expect(visible).to.have.length(2);
    });

    it('should hide children of hidden components', () => {
      const collection = componentCollectionFn({ createComponent });
      const components = [
        {
          type: 'container',
          key: 'parent',
          strategy: simpleLayoutFn,
          components: [
            {
              type: 'box',
              key: 'child',
            },
          ],
        },
      ];
      collection.set({ components });

      const rect = { x: 0, y: 0, width: 100, height: 100 };

      const { visible, hidden } = collection.layout({ layoutSettings: hideLayoutFn, rect });
      expect(visible).to.eql([]);
      expect(hidden).to.have.length(2);
    });
  });

  describe('update', () => {
    it('should apply transform when transform function is available', () => {
      const collection = componentCollectionFn({ createComponent });
      const components = [
        {
          type: 'box',
          key: 'no-transform',
        },
        {
          type: 'point',
          key: 'with-transform',
          rendererSettings: {
            transform: () => ({ a: 0, b: 1, c: 0, d: 1, e: 100, f: 100 }),
          },
        },
      ];
      collection.set({ components });
      collection.update({ components, excludeFromUpdate: [] });
      const comp1 = collection.findComponentByKey('no-transform');
      const comp2 = collection.findComponentByKey('with-transform');

      expect(comp1.applyTransform).to.be.undefined;
      expect(comp2.applyTransform).to.be.true;
      expect(comp2.instance.renderer().myRendererSettings).to.equal('new settings');
    });

    it('should not update settings if there is no component with rendererSettings', () => {
      const collection = componentCollectionFn({ createComponent });
      const components = [
        {
          type: 'box',
          key: 'no-renderSettings',
        },
      ];
      collection.set({ components });
      collection.update({ components, excludeFromUpdate: [] });
      const comp1 = collection.findComponentByKey('no-renderSettings');

      expect(comp1.instance.renderer().myRendererSettings).to.equal('old settings');
    });

    it('should not update settings if there is no component with rendererSettings', () => {
      const collection = componentCollectionFn({ createComponent });
      const components = [
        {
          type: 'box',
          key: 'with-renderSettings',
          rendererSettings: {},
        },
      ];
      collection.set({ components });
      collection.update({ components, excludeFromUpdate: [] });
      const comp1 = collection.findComponentByKey('with-renderSettings');

      expect(comp1.instance.renderer().myRendererSettings).to.equal('new settings');
    });
  });
});
