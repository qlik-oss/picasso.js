import componentCollectionFn from '../component-collection';

function createComponent(settings) {
  let rect;
  return {
    instance: {
      type: settings.type,
      dockConfig() {},
      resize: (r) => {
        rect = r;
      },
      getRect: () => rect,
    },
    settings,
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
});
