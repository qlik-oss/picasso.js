import extend from 'extend';

function itemize({
  resolved
}, legend) {
  if (resolved.title.item.show === false) {
    return null;
  }
  const t = extend({}, resolved.title.item, {
    type: 'text'
  });

  if (resolved.layout.item.direction === 'rtl') {
    if (!t.anchor || t.anchor === 'start') {
      t.anchor = 'end';
    } else if (t.anchor === 'end') {
      t.anchor = 'start';
    }
  }

  if (typeof resolved.title.settings.text === 'undefined') {
    const fields = legend.scale.data().fields;
    t.text = fields && fields[0] ? fields[0].title() : '';
  }

  return {
    displayObject: t,
    bounds: legend.renderer.textBounds(t)
  };
}

function render({
  rect
}, renderer, itemized) {
  if (!renderer) {
    return;
  }
  const nodes = [];
  renderer.size(rect);
  if (itemized) {
    const align = {
      start: 0,
      end: rect.width,
      middle: rect.width / 2
    };
    nodes.push(extend({}, itemized.displayObject, {
      x: align[itemized.displayObject.anchor] || 0,
      y: 0,
      baseline: 'hanging'
    }));
  }
  renderer.render(nodes);
}

export default function (legend) {
  let itemized;

  const api = {
    itemize: (obj) => {
      itemized = itemize(obj, legend);
    },
    render: (obj) => {
      render(obj, api.renderer, itemized);
    },
    spread: () => (itemized ? itemized.bounds.height * 1.25 : 0),
    extent: () => (itemized ? itemized.bounds.width : 0)
  };

  return api;
}

