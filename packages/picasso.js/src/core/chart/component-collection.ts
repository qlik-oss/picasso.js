import createDockLayout from '../layout/dock/docker';

interface RendererSettings {
  transform?: () => unknown;
  [key: string]: unknown;
}

interface ComponentSettings {
  key?: string;
  components?: ComponentSettings[];
  rendererSettings?: RendererSettings;
  [key: string]: unknown;
}

interface DockConfig {
  computePreferredSize(opts: { inner: unknown; outer: unknown; dock: string; children?: unknown }): unknown;
}

interface Component {
  instance: {
    dockConfig(): DockConfig;
    resize: (r: unknown) => void;
    getRect(): unknown;
    renderer(): {
      settings(s: RendererSettings): void;
      [key: string]: unknown;
    };
    destroy(): void;
  };
  settings: ComponentSettings;
  key?: string;
  hasKey?: boolean;
  children?: Component[];
  updateWith?: {
    formatters: unknown;
    scales: unknown;
    data: unknown;
    settings: ComponentSettings;
  };
  applyTransform?: boolean;
}

interface VirtualComponent {
  index: number;
  key?: string;
  dockConfig: DockConfig;
  resize: (r: unknown) => void;
  preferredSize(opts: { inner: unknown; outer: unknown; dock: string; children?: unknown }): unknown;
}

interface LayoutResult {
  visible: unknown[];
  hidden: unknown[];
  ordered: unknown[];
}

type LayoutFn = (rect: unknown, components: unknown) => LayoutResult;

type LayoutStrategy = LayoutFn | Record<string, unknown>;

const findComponentByKeyInList = (list: Component[], key?: string): Component | null => {
  for (let i = 0; i < list.length; i++) {
    const currComp = list[i];
    if (currComp.hasKey && currComp.key === key) {
      return list[i];
    }
  }
  return null;
};

const wrapChildren = (children?: Component[]): unknown[] | undefined =>
  children?.map((c: Component) => {
    const dockConfig = c.instance.dockConfig();
    return {
      preferredSize(opts: { inner: unknown; outer: unknown; dock: string }): unknown {
        return dockConfig.computePreferredSize({ ...opts, children: wrapChildren(c.children) });
      },
    };
  });

const hideAll = (rect: unknown, components: Component[]): LayoutResult => ({ visible: [], hidden: components, ordered: [] });

const customLayout = (fn: LayoutFn): LayoutFn => (rect: unknown, components: Component[]): LayoutResult => {
  const vcomponents: VirtualComponent[] = components.map((c: Component, i: number) => {
    const dockConfig = c.instance.dockConfig();
    return {
      index: i,
      key: c.key,
      dockConfig,
      resize: c.instance.resize,
      preferredSize(opts: { inner: unknown; outer: unknown; dock: string }): unknown {
        return dockConfig.computePreferredSize({ ...opts, children: wrapChildren(c.children) });
      },
    };
  });
  const mapBack = (c: VirtualComponent): Component => components[c.index];
  const { visible = vcomponents, hidden = [], ordered = visible } = fn(rect, vcomponents as unknown) ?? {};
  return {
    visible: (visible as VirtualComponent[]).map(mapBack),
    hidden: (hidden as VirtualComponent[]).map(mapBack),
    ordered: (ordered as VirtualComponent[]).map(mapBack),
  };
};

const normalLayout = (layoutSettings: LayoutStrategy): LayoutFn => {
  const dockLayout = createDockLayout(layoutSettings);
  return customLayout((rect: unknown, vcomponents: unknown): LayoutResult =>
    (dockLayout.layout as (r: unknown, c: unknown) => LayoutResult)(rect, vcomponents)
  );
};

const getLayoutFn = (strategy: LayoutStrategy | Record<string, unknown>): LayoutFn => (typeof strategy === 'function' ? customLayout(strategy as LayoutFn) : normalLayout(strategy as LayoutStrategy));

interface CollectionFnOptions {
  createComponent: (settings: ComponentSettings) => Component | null;
}

function collectionFn({ createComponent }: CollectionFnOptions): Record<string, unknown> {
  const instance: Record<string, unknown> = {};
  let allComponents: Component[] = [];
  let topComponents: Component[] = [];

  const createComp = (compSettings: ComponentSettings): Component | null => {
    const component = createComponent(compSettings);
    if (component) {
      allComponents.push(component);
      if (compSettings.components) {
        component.children = compSettings.components
          .map((childSettings: ComponentSettings) => createComp(childSettings))
          .filter((c: Component | null): c is Component => !!c);
      }
    }
    return component;
  };

  const removeFromAllComponents = (component: Component): void => {
    const index = allComponents.indexOf(component);
    if (index !== -1) {
      allComponents.splice(index, 1);
    }
  };

  const removeDeleted = (compList: Component[], settingsList: ComponentSettings[]): void => {
    for (let i = compList.length - 1; i >= 0; i--) {
      const currComp = compList[i];
      // TODO warn when there is no key
      const currSettings = settingsList.find((c: ComponentSettings) => currComp.hasKey && currComp.key === c.key);
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

  interface AddAndUpdateOptions {
    compList: Component[];
    data: unknown;
    excludeFromUpdate: string[];
    formatters: unknown;
    scales: unknown;
    settingsList: ComponentSettings[];
  }

  const addAndUpdate = ({
    compList,
    data,
    excludeFromUpdate,
    formatters,
    scales,
    settingsList,
  }: AddAndUpdateOptions): Component[] =>
    // Let the "components" array determine order of components
    settingsList
      .map((comp: ComponentSettings) => {
        const component = findComponentByKeyInList(compList, comp.key);

        // Component should not be updated
        if (excludeFromUpdate.indexOf(comp.key ?? '') > -1) {
          // TODO: decide if to skip children
          if (component) {
            delete component.updateWith;
          }
          return component;
        }

        if (!component) {
          // Component is added
          return createComp(comp);
        }
        if (comp.rendererSettings && typeof component.instance.renderer().settings === 'function') {
          component.instance.renderer().settings(comp.rendererSettings);
        }
        // Only apply transform, no need for an update
        if (
          comp.rendererSettings &&
          typeof comp.rendererSettings.transform === 'function' &&
          comp.rendererSettings.transform()
        ) {
          component.applyTransform = true;
          return component;
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
      .filter((c: Component | null): c is Component => !!c);

  interface RecLayoutOptions {
    components: Component[];
    hidden: Component[];
    layoutFn: LayoutFn;
    ordered: Component[];
    rect: unknown;
    visible: Component[];
  }

  const recLayout = ({ components, hidden, layoutFn, ordered, rect, visible }: RecLayoutOptions): void => {
    const result = layoutFn(rect, components);
    const v = result.visible as Component[];
    const h = result.hidden as Component[];
    const o = result.ordered as Component[];
    visible.push(...v);
    hidden.push(...h);
    ordered.push(...o);
    v.forEach((c: Component) => {
      if (c.children) {
        const lFn = getLayoutFn(c.settings?.strategy ?? {});
        recLayout({ components: c.children, hidden, layoutFn: lFn, ordered, rect: c.instance.getRect(), visible });
      }
    });
    h.forEach((c: Component) => {
      if (c.children) {
        recLayout({ components: c.children, hidden, layoutFn: hideAll, ordered, rect: null, visible });
      }
    });
  };

  instance.destroy = (): void => {
    allComponents.forEach((comp: Component) => comp.instance.destroy());
    allComponents = [];
    topComponents = [];
  };

  instance.findComponentByKey = (key: string): Component | null => findComponentByKeyInList(allComponents, key);

  instance.forEach = (fn: (comp: Component) => void): void => {
    allComponents.forEach(fn);
  };

  interface LayoutOptions {
    layoutSettings: LayoutStrategy;
    rect: unknown;
  }

  instance.layout = ({ layoutSettings, rect }: LayoutOptions): LayoutResult => {
    const visible: Component[] = [];
    const hidden: Component[] = [];
    const ordered: Component[] = [];
    const layoutFn = getLayoutFn(layoutSettings);
    recLayout({ components: topComponents, hidden, layoutFn, ordered, rect, visible });
    return { visible, hidden, ordered };
  };

  interface SetOptions {
    components: ComponentSettings[];
  }

  instance.set = ({ components }: SetOptions): void => {
    topComponents = components.map((compSettings: ComponentSettings) => createComp(compSettings)).filter((c: Component | null): c is Component => !!c);
  };

  interface UpdateOptions {
    components: ComponentSettings[];
    data: unknown;
    excludeFromUpdate: string[];
    formatters: unknown;
    scales: unknown;
  }

  instance.update = ({ components, data, excludeFromUpdate, formatters, scales }: UpdateOptions): void => {
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
