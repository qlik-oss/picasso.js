import createDockLayout from '../layout/dock/docker';

const findComponentByKeyInList = (list, key) => {
  for (let i = 0; i < list.length; i++) {
    const currComp = list[i];
    if (currComp.hasKey && currComp.key === key) {
      return list[i];
    }
  }
  return null;
};
const findComponentByInstanceInList = (list, componentInstance) => {
  for (let i = 0; i < list.length; i++) {
    if (list[i].instance === componentInstance) {
      return list[i];
    }
  }
  return null;
};

const wrapChildren = (children) =>
  children?.map((c) => {
    const dockConfig = c.instance.dockConfig();
    return {
      preferredSize(opts) {
        return dockConfig.computePreferredSize({ ...opts, children: wrapChildren(c.children) });
      },
    };
  });
const hideAll = (rect, components) => ({ visible: [], hidden: components, order: components });
const normalLayout = (layoutSettings) => (rect, components) => {
  const vcomponents = components.map((c) => {
    const dockConfig = c.instance.dockConfig();
    return {
      instance: c.instance,
      resize: c.instance.resize,
      preferredSize(opts) {
        return dockConfig.computePreferredSize({ ...opts, children: wrapChildren(c.children) });
      },
      settings: c.settings,
    };
  });

  const dockLayout = createDockLayout(layoutSettings);

  const { visible, hidden, order } = dockLayout.layout(rect, vcomponents);
  return {
    visible: visible.map((v) => findComponentByInstanceInList(components, v.instance)),
    hidden: hidden.map((h) => findComponentByInstanceInList(components, h.instance)),
    order,
  };
};
const customLayout = (fn) => (rect, components) => {
  const vcomponents = components.map((c, i) => {
    const dockConfig = c.instance.dockConfig();
    return {
      index: i,
      key: c.settings.key,
      dockConfig,
      resize: c.instance.resize,
      preferredSize(opts) {
        return dockConfig.computePreferredSize({ ...opts, children: wrapChildren(c.children) });
      },
    };
  });
  const mapBack = (c) => components[c.index];
  const { visible, hidden, order } = fn(rect, vcomponents);
  return {
    visible: visible.map(mapBack),
    hidden: hidden.map(mapBack),
    order: order.map(mapBack),
  };
};

const getLayoutFn = (strategy) => {
  return typeof strategy === 'function' ? customLayout(strategy) : normalLayout(strategy);
};

function collectionFn({ createComponent }) {
  const instance = {};
  let allComponents = [];
  let topComponents = [];

  const createComp = (compSettings) => {
    const component = createComponent(compSettings);
    if (component) {
      allComponents.push(component);
      if (compSettings.components) {
        component.children = compSettings.components
          .map((childSettings) => createComp(childSettings))
          .filter((c) => !!c);
      }
    }
    return component;
  };
  const removeFromAllComponents = (component) => {
    const index = allComponents.indexOf(component);
    if (index !== -1) {
      allComponents.splice(index, 1);
    }
  };
  const removeDeleted = (compList, settingsList) => {
    for (let i = compList.length - 1; i >= 0; i--) {
      const currComp = compList[i];
      // TODO warn when there is no key
      const currSettings = settingsList.find((c) => currComp.hasKey && currComp.key === c.key);
      if (!currSettings) {
        // Component is removed
        compList.splice(i, 1);
        removeFromAllComponents(currComp);
        if (currComp.children) {
          removeDeleted(currComp.children, []);
        }
        currComp.instance.destroy();
      } else if (currComp.children && currSettings.components) {
        removeDeleted(currComp.children, currSettings.components);
      }
    }
  };
  const addAndUpdate = ({ compList, data, excludeFromUpdate, formatters, scales, settingsList }) => {
    // Let the "components" array determine order of components
    return settingsList
      .map((comp) => {
        const component = findComponentByKeyInList(compList, comp.key);

        // Component should not be updated
        if (excludeFromUpdate.indexOf(comp.key) > -1) {
          // TODO: decide if to skip children
          return component;
        }

        if (!component) {
          // Component is added
          return createComp(comp);
        }
        // Component is (potentially) updated
        component.updateWith = {
          formatters,
          scales,
          data,
          settings: comp,
        };

        if (comp.components) {
          component.children = addAndUpdate({
            compList: component.children || [],
            data,
            excludeFromUpdate,
            formatters,
            scales,
            settingsList: comp.components,
          });
        }

        return component;
      })
      .filter((c) => !!c);
  };
  const recLayout = ({ components, hidden, layoutFn, order, rect, visible }) => {
    const { visible: v, hidden: h, order: o } = layoutFn(rect, components);
    visible.push(...v);
    hidden.push(...h);
    order.push(...o);
    v.forEach((c) => {
      if (c.children) {
        const lFn = getLayoutFn(c.settings?.strategy ?? {});
        recLayout({ components: c.children, hidden, layoutFn: lFn, order, rect: c.instance.getRect(), visible });
      }
    });
    h.forEach((c) => {
      if (c.children) {
        recLayout({ components: c.children, hidden, layoutFn: hideAll, order, rect: null, visible });
      }
    });
  };

  instance.destroy = () => {
    allComponents.forEach((comp) => comp.instance.destroy());
    allComponents = [];
    topComponents = [];
  };

  instance.findComponentByKey = (key) => findComponentByKeyInList(allComponents, key);

  instance.forEach = (fn) => {
    allComponents.forEach(fn);
  };

  instance.layout = ({ layoutSettings, rect }) => {
    const visible = [];
    const hidden = [];
    const order = [];
    const layoutFn = getLayoutFn(layoutSettings);
    recLayout({ components: topComponents, hidden, layoutFn, order, rect, visible });
    return { visible, hidden, order };
  };

  instance.set = ({ components }) => {
    topComponents = components.map((compSettings) => createComp(compSettings)).filter((c) => !!c);
  };

  instance.update = ({ components, data, excludeFromUpdate, formatters, scales }) => {
    // remove deleted
    removeDeleted(topComponents, components);

    // Update and add new
    topComponents = addAndUpdate({
      compList: topComponents,
      data,
      excludeFromUpdate,
      formatters,
      scales,
      settingsList: components,
    });
  };

  return instance;
}

export default collectionFn;
