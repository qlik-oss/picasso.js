import extend from 'extend';
import classString from '../../utils/class-string';

const DIR = {
  up: '\u25B2',
  right: '\u25B6',
  down: '\u25BC',
  left: '\u25C0'
};

function itemize({
  // resolved,
  dock,
  navigation
}) {
  return {
    layout: {
      orientation: dock === 'top' || dock === 'bottom' ? 'vertical' : 'horizontal'
    },
    navigation
  };
}

function btn(h, {
  size,
  isActive,
  direction,
  nav,
  attrs
}) {
  let c = {};
  let content = '';
  if (nav && nav.button) {
    if (typeof nav.button.class === 'function') {
      c = nav.button.class({ direction });
    } else if (nav.button.class) {
      c = nav.button.class;
    }
    if (typeof nav.button.content === 'function') {
      content = nav.button.content(h, { direction });
    }
  }
  const style = {
    width: `${size}px`,
    minWidth: `${size}px`,
    height: `${size}px`
  };

  if (!Object.keys(c).length) { // if no classes are set, add some basic styling
    style.border = '0';
    style.background = 'none';
  }
  const attrsMerged = attrs;
  if (!isActive) {
    attrsMerged.disabled = 'disabled';
  }

  return h('button', extend({
    class: classString(c),
    style
  }, attrsMerged), [content || h('span', {
    style: {
      pointerEvents: 'none'
    }
  }, [DIR[direction]])]);
}

function render(renderer, {
  rect,
  itemRenderer
}, itemized, legend) {
  if (!renderer || !renderer.renderArgs) {
    return;
  }
  renderer.size(rect);
  const h = renderer.renderArgs[0];

  const isVertical = itemized.layout.orientation === 'vertical'; // orientation of the navigation (not the legend)
  const isRtl = itemRenderer.direction() === 'rtl';

  const hasNext = itemRenderer.hasNext();
  const hasPrev = itemRenderer.hasPrev();

  if (!hasPrev && !hasNext) {
    renderer.render([]);
    return;
  }

  const buttonSize = 32;

  const order = isVertical ? ['right', 'left'] : ['down', 'up'];

  if (isRtl && isVertical) {
    order.reverse();
  }

  const nodes = [h('div', {
    style: {
      position: 'relative',
      display: 'flex',
      'flex-direction': isVertical ? 'column' : 'row',
      'justify-content': 'center',
      height: '100%',
      pointerEvents: 'auto'
    },
    dir: isRtl && !isVertical ? 'rtl' : 'ltr'
  }, [btn(h, {
    size: buttonSize,
    isActive: hasNext,
    direction: order[0],
    attrs: {
      'data-action': 'next',
      'data-component-key': legend.settings.key
    },
    nav: itemized.navigation
  }), btn(h, {
    size: buttonSize,
    isActive: hasPrev,
    direction: order[1],
    attrs: {
      'data-action': 'prev',
      'data-component-key': legend.settings.key
    },
    nav: itemized.navigation
  })])];
  renderer.render(nodes);
}

export default function (legend) {
  let itemized;

  const nav = {
    itemize: (obj) => {
      itemized = itemize(obj);
    },
    render: obj => render(nav.renderer, obj, itemized, legend),
    extent: () => 32,
    spread: () => 64
  };

  return nav;
}
