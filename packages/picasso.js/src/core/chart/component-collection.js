import createDockLayout from '../layout/dock/docker';

function collectionFn({ createComponent }) {
  const instance = {};
  let currentComponents = [];

  const findComponentByKey = (key) => {
    for (let i = 0; i < currentComponents.length; i++) {
      const currComp = currentComponents[i];
      if (currComp.hasKey && currComp.key === key) {
        return currentComponents[i];
      }
    }
    return null;
  };
  const findComponentByInstance = (componentInstance) => {
    for (let i = 0; i < currentComponents.length; i++) {
      if (currentComponents[i].instance === componentInstance) {
        return currentComponents[i];
      }
    }
    return null;
  };

  instance.destroy = () => {
    currentComponents.forEach((comp) => comp.instance.destroy());
    currentComponents = [];
  };

  instance.findComponentByInstance = findComponentByInstance;
  instance.findComponentByKey = findComponentByKey;

  instance.forEach = (fn) => {
    currentComponents.forEach(fn);
  };

  instance.layout = ({ layoutSettings, rect }) => {
    const vcomponents = currentComponents.map((c) => {
      const dockConfig = c.instance.dockConfig();
      return {
        instance: c.instance,
        resize: c.instance.resize,
        preferredSize: dockConfig.computePreferredSize.bind(dockConfig),
        settings: c.settings,
        layoutComponents: () => {},
      };
    });

    const dockLayout = createDockLayout(layoutSettings);

    const { visible, hidden, order } = dockLayout.layout(rect, vcomponents);
    return {
      visible: visible.map((v) => findComponentByInstance(v.instance)),
      hidden: hidden.map((h) => findComponentByInstance(h.instance)),
      order,
    };
  };

  instance.set = ({ components }) => {
    currentComponents = components.map((compSettings) => createComponent(compSettings)).filter((c) => !!c);
  };

  instance.update = ({ components, data, excludeFromUpdate, formatters, scales }) => {
    // remove deleted
    for (let i = currentComponents.length - 1; i >= 0; i--) {
      const currComp = currentComponents[i];
      // TODO warn when there is no key
      if (!components.some((c) => currComp.hasKey && currComp.key === c.key)) {
        // Component is removed
        currentComponents.splice(i, 1);
        currComp.instance.destroy();
      }
    }

    // Update and add new
    // Let the "components" array determine order of components
    currentComponents = components
      .map((comp) => {
        const component = findComponentByKey(comp.key);

        // Component should not be updated
        if (excludeFromUpdate.indexOf(comp.key) > -1) {
          return component;
        }

        if (!component) {
          // Component is added
          return createComponent(comp);
        }
        // Component is (potentially) updated
        component.updateWith = {
          formatters,
          scales,
          data,
          settings: comp,
        };
        return component;
      })
      .filter((c) => !!c);
  };

  return instance;
}

export default collectionFn;
