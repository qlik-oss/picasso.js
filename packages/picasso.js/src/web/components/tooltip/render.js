import extend from 'extend';

function resolveClasses(props, opts) {
  return {
    tooltip: typeof props.tooltipClass === 'function' ? props.tooltipClass({ dock: opts.dock }) : props.tooltipClass,
    content: typeof props.contentClass === 'function' ? props.contentClass({ dock: opts.dock }) : props.contentClass,
    arrow: typeof props.arrowClass === 'function' ? props.arrowClass({ dock: opts.dock }) : props.arrowClass
  };
}

export default function render(items, placement, {
  renderer,
  style,
  props,
  h
}) {
  const classes = resolveClasses(props, placement);
  const data = {
    style: extend({}, style.content),
    class: classes.content
  };
  const content = props.content({
    h,
    style,
    items,
    props
  });
  const contentNode = h('div', data, content);

  const arrowNode = h(
    'div',
    {
      style: extend({}, style.arrow, style[`arrow-${placement.dock}`], placement.computedArrowStyle),
      class: classes.arrow
    },
    '' // TODO allow custom arrow content
  );

  const tooltipDefaultStyle = {
    position: 'relative',
    display: 'inline-block'
  };

  let element;
  const tooltipNode = h(
    'div',
    {
      style: extend(tooltipDefaultStyle, placement.computedTooltipStyle),
      class: classes.tooltip,
      hook: {
        insert: (vnode) => {
          element = vnode.elm;
        },
        postpatch: (oldNode, vnode) => {
          element = vnode.elm;
        }
      },
      attrs: {
        dir: props.direction
      }
    },
    [contentNode, arrowNode]
  );

  renderer.render([tooltipNode]);

  return element;
}
