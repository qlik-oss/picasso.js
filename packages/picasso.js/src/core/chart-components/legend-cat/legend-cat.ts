import extend from 'extend';
import resolveSettings from './legend-resolver';
import itemRendererFactory from './item-renderer';
import navigationRendererFactory from './navigation-renderer';
import titleRendererFactory from './title-renderer';
import layout from './legend-layout';

interface ItemRenderer {
  itemize(config: Record<string, unknown>): void;
  getItemsToRender(config: Record<string, unknown>): unknown[];
  getContentOverflow(): boolean;
  orientation(): string;
  direction(): string;
  scroll(delta: number): void;
  next(): void;
  prev(): void;
  offset(): unknown;
}

interface NavigationRenderer {
  itemize(config: Record<string, unknown>): void;
  render(config: Record<string, unknown>): void;
  renderer: Renderer;
}

interface TitleRenderer {
  itemize(config: Record<string, unknown>): void;
  render(config: Record<string, unknown>): void;
  renderer: Renderer;
}

interface Renderer {
  appendTo(element: Element): void;
  element(): Element;
  clear(): void;
  destroy(): void;
  size(rect: Record<string, unknown>): void;
}

interface LegendComponentState {
  interaction: {
    started?: boolean;
    delta?: number;
  };
  display?: Record<string, unknown>;
  resolved?: unknown;
  views?: {
    layout: Record<string, unknown>;
  };
}

interface LegendComponent {
  state: LegendComponentState;
  settings: Record<string, unknown>;
  rect?: Record<string, unknown>;
  renderer?: {
    size(rect: Record<string, unknown>): void;
  };
  itemRenderer: ItemRenderer & Record<string, unknown>;
  navigationRenderer: NavigationRenderer & Record<string, unknown>;
  titleRenderer: TitleRenderer & Record<string, unknown>;
  registries: {
    renderer(type: string): () => Renderer;
  };
  update(items: unknown[]): void;
  onScroll?: () => void;
}

function update(comp: LegendComponent): void {
  comp.state.resolved = resolveSettings(comp);
  comp.titleRenderer.itemize({
    resolved: comp.state.resolved,
    dock: (comp.settings.layout as Record<string, unknown>)?.dock || 'center',
  });
  comp.itemRenderer.itemize({
    resolved: comp.state.resolved,
    dock: (comp.settings.layout as Record<string, unknown>)?.dock || 'center',
  });
  comp.navigationRenderer.itemize({
    resolved: comp.state.resolved,
    dock: (comp.settings.layout as Record<string, unknown>)?.dock || 'center',
    navigation: (comp.settings.settings as Record<string, unknown>)?.navigation,
  });

  comp.state.display = {
    spacing: 8,
  };
}

function preferredSize(comp: LegendComponent, size: Record<string, unknown>): number {
  let s = 0;
  const dock = (comp.settings.layout as Record<string, unknown>)?.dock || 'center';
  const orientation = dock === 'top' || dock === 'bottom' ? 'horizontal' : 'vertical';
  const d = comp.state.display as Record<string, unknown>;
  const tempLayout = layout(
    (size.inner as Record<string, unknown>) || {},
    d,
    orientation,
    {
      itemRenderer: comp.itemRenderer,
      navigationRenderer: comp.navigationRenderer,
      titleRenderer: comp.titleRenderer,
      isPreliminary: true,
    }
  );
  s += (d.spacing as number) || 0;
  s += (tempLayout.preferredSize as number) || 0;
  s += (d.spacing as number) || 0;
  return s;
}

function render(legend: LegendComponent): unknown[] {
  const { rect, settings, state, itemRenderer, navigationRenderer, titleRenderer } = legend;
  const dock = (settings.layout as Record<string, unknown>)?.dock;
  const orientation = dock === 'top' || dock === 'bottom' ? 'horizontal' : 'vertical';
  const l = layout(
    (rect as Record<string, unknown>) || {},
    (state.display as Record<string, unknown>) || {},
    orientation,
    {
      itemRenderer,
      navigationRenderer,
      titleRenderer,
    }
  );

  legend.renderer?.size((l.content as Record<string, unknown>) || {});

  const contentItems = itemRenderer.getItemsToRender({
    viewRect: extend({}, l.content, { x: 0, y: 0 }),
  });

  navigationRenderer.render({
    rect: l.navigation,
    itemRenderer,
  });

  titleRenderer.render({
    rect: l.title,
  });

  legend.state.views = {
    layout: l,
  };

  return contentItems;
}

const component: {
  require: string[];
  defaultSettings: Record<string, unknown>;
  mounted(this: LegendComponent, renderElement: Element): void;
  beforeUnmount(this: LegendComponent): void;
  on: {
    panstart(this: LegendComponent): void;
    panmove(this: LegendComponent, e: Record<string, unknown>): void;
    panend(this: LegendComponent): void;
    scroll(this: LegendComponent, delta: number): void;
    next(this: LegendComponent): void;
    prev(this: LegendComponent): void;
  };
  created(this: LegendComponent): void;
  preferredSize(this: LegendComponent, obj: Record<string, unknown>): number;
  beforeUpdate(this: LegendComponent): void;
  render(this: LegendComponent): unknown[];
  beforeDestroy(this: LegendComponent): void;
  additionalElements(this: LegendComponent): Element[];
  _DO_NOT_USE_getInfo(this: LegendComponent): Record<string, unknown>;
} = {
  require: ['chart', 'settings', 'renderer', 'update', 'resolver', 'registries', 'symbol'],
  defaultSettings: {
    settings: {},
    style: {
      item: {
        label: '$label',
        shape: '$shape',
      },
      title: '$title',
    },
  },
  mounted(renderElement: Element) {
    const parentNode = renderElement.parentNode as Element | null;
    if (renderElement && parentNode) {
      this.navigationRenderer.renderer.appendTo(parentNode);
      this.titleRenderer.renderer.appendTo(parentNode);

      parentNode.insertBefore(this.navigationRenderer.renderer.element(), renderElement);
      parentNode.insertBefore(this.titleRenderer.renderer.element(), renderElement);
    }
    this.navigationRenderer.render({
      rect: (this.state.views?.layout as Record<string, unknown>)?.navigation,
      itemRenderer: this.itemRenderer,
    });

    this.titleRenderer.render({
      rect: (this.state.views?.layout as Record<string, unknown>)?.title,
    });
  },
  beforeUnmount() {
    this.navigationRenderer.renderer.clear();
    this.titleRenderer.renderer.clear();
  },
  on: {
    panstart() {
      if (this.state.interaction.started) {
        return;
      }
      const contentOverflow = this.itemRenderer.getContentOverflow();
      if (!contentOverflow) {
        return;
      }
      this.state.interaction.started = true;
      this.state.interaction.delta = 0;
    },
    panmove(e: Record<string, unknown>) {
      if (!this.state.interaction.started) {
        return;
      }
      const delta =
        this.itemRenderer.orientation() === 'horizontal'
          ? (this.itemRenderer.direction() === 'rtl' ? -1 : 1) * (e.deltaX as number)
          : (e.deltaY as number);
      this.itemRenderer.scroll(delta - (this.state.interaction.delta || 0));
      this.state.interaction.delta = delta;
    },
    panend() {
      this.state.interaction.started = false;
    },
    scroll(delta: number) {
      this.itemRenderer.scroll(-delta);
    },
    next() {
      this.itemRenderer.next();
    },
    prev() {
      this.itemRenderer.prev();
    },
  },
  created() {
    this.state = {
      interaction: {},
    };
    this.onScroll = () => {
      const items = render(this);
      this.update(items);
    };
    this.itemRenderer = itemRendererFactory(this as unknown as Record<string, unknown>, {
      onScroll: this.onScroll,
    }) as ItemRenderer & Record<string, unknown>;
    this.navigationRenderer = navigationRendererFactory(
      this as unknown as Record<string, unknown>
    ) as NavigationRenderer & Record<string, unknown>;
    this.titleRenderer = titleRendererFactory(
      this as unknown as Record<string, unknown>
    ) as TitleRenderer & Record<string, unknown>;
    this.navigationRenderer.renderer = this.registries.renderer('dom')();
    this.titleRenderer.renderer = this.registries.renderer(
      (this.settings.renderer as string) || 'svg'
    )();
    update(this);
  },
  preferredSize(obj: Record<string, unknown>): number {
    return preferredSize(this, obj);
  },
  beforeUpdate() {
    update(this);
  },
  render(): unknown[] {
    return render(this);
  },
  beforeDestroy() {
    this.navigationRenderer.renderer.destroy();
    this.titleRenderer.renderer.destroy();
  },
  additionalElements(): Element[] {
    return [
      this.titleRenderer.renderer.element(),
      this.navigationRenderer.renderer.element(),
    ];
  },
  _DO_NOT_USE_getInfo(): Record<string, unknown> {
    return {
      offset: this.itemRenderer.offset(),
    };
  },
};

export default component;
