import extend from 'extend';
import resolveSettings from './legend-resolver';
import itemRendererFactory from './item-renderer';
import navigationRendererFactory from './navigation-renderer';
import titleRendererFactory from './title-renderer';
import layout from './legend-layout';

function update(comp) {
  comp.state.resolved = resolveSettings(comp);
  comp.titleRenderer.itemize({
    resolved: comp.state.resolved,
    dock: comp.settings.layout.dock || 'center',
  });
  comp.itemRenderer.itemize({
    resolved: comp.state.resolved,
    dock: comp.settings.layout.dock || 'center',
  });
  comp.navigationRenderer.itemize({
    resolved: comp.state.resolved,
    dock: comp.settings.layout.dock || 'center',
    navigation: comp.settings.settings.navigation,
  });

  comp.state.display = {
    spacing: 8,
  };
}

function preferredSize(comp, size) {
  let s = 0;
  const dock = comp.settings.layout.dock || 'center';
  const orientation = dock === 'top' || dock === 'bottom' ? 'horizontal' : 'vertical';
  const d = comp.state.display;
  const tempLayout = layout(size.inner, d, orientation, {
    itemRenderer: comp.itemRenderer,
    navigationRenderer: comp.navigationRenderer,
    titleRenderer: comp.titleRenderer,
    isPreliminary: true,
  });
  s += d.spacing; // start padding in both vertical and horizontal mode
  s += tempLayout.preferredSize;
  s += d.spacing; // end padding in both vertical and horizontal mode
  return s;
}

function render(legend) {
  const { rect, settings, state, itemRenderer, navigationRenderer, titleRenderer } = legend;
  const dock = settings.layout.dock;
  const orientation = dock === 'top' || dock === 'bottom' ? 'horizontal' : 'vertical';
  const l = layout(rect, state.display, orientation, {
    itemRenderer,
    navigationRenderer,
    titleRenderer,
  });

  legend.renderer.size(l.content);

  // l.content.x = 0;
  // l.content.y = 0;

  // l.navigation.x += rect.x;
  // l.navigation.y += rect.y;

  // l.title.x += rect.x;
  // l.title.y += rect.y;

  let contentItems = itemRenderer.getItemsToRender({
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

const component = {
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
  mounted(renderElement) {
    if (renderElement && renderElement.parentNode) {
      this.navigationRenderer.renderer.appendTo(renderElement.parentNode);
      this.titleRenderer.renderer.appendTo(renderElement.parentNode);

      renderElement.parentNode.insertBefore(this.navigationRenderer.renderer.element(), renderElement);
      renderElement.parentNode.insertBefore(this.titleRenderer.renderer.element(), renderElement);
    }
    this.navigationRenderer.render({
      rect: this.state.views.layout.navigation,
      itemRenderer: this.itemRenderer,
    });

    this.titleRenderer.render({
      rect: this.state.views.layout.title,
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
    panmove(e) {
      if (!this.state.interaction.started) {
        return;
      }
      const delta =
        this.itemRenderer.orientation() === 'horizontal'
          ? (this.itemRenderer.direction() === 'rtl' ? -1 : 1) * e.deltaX
          : e.deltaY;
      this.itemRenderer.scroll(delta - this.state.interaction.delta);
      this.state.interaction.delta = delta;
    },
    panend() {
      this.state.interaction.started = false;
    },
    scroll(delta) {
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
    this.itemRenderer = itemRendererFactory(this, {
      onScroll: this.onScroll,
    });
    this.navigationRenderer = navigationRendererFactory(this);
    this.titleRenderer = titleRendererFactory(this);
    this.navigationRenderer.renderer = this.registries.renderer('dom')();
    this.titleRenderer.renderer = this.registries.renderer(this.settings.renderer)();
    update(this);
  },
  preferredSize(obj) {
    return preferredSize(this, obj);
  },
  beforeUpdate() {
    update(this);
  },
  render() {
    return render(this);
  },
  beforeDestroy() {
    this.navigationRenderer.renderer.destroy();
    this.titleRenderer.renderer.destroy();
  },
  additionalElements() {
    return [this.titleRenderer.renderer.element(), this.navigationRenderer.renderer.element()];
  },
  _DO_NOT_USE_getInfo() {
    return {
      offset: this.itemRenderer.offset(),
    };
  },
};

export default component;
