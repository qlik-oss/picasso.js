import extend from 'extend';

function resolveClasses(props, opts) {
  return {
    tooltip: typeof props.tooltipClass === 'function' ? props.tooltipClass({ dock: opts.dock }) : props.tooltipClass,
    content: typeof props.contentClass === 'function' ? props.contentClass({ dock: opts.dock }) : props.contentClass,
    arrow: typeof props.arrowClass === 'function' ? props.arrowClass({ dock: opts.dock }) : props.arrowClass
  };
}

function resolveContent(h, data, style, props) {
  return props.content({
    h,
    style,
    data
  });
}

export default function render(data, placement, {
  renderer,
  style,
  props,
  h
}) {
  const classes = resolveClasses(props, placement);
  const content = resolveContent(h, data, style, props);

  const contentNode = h('div', {
    style: extend({}, style.content),
    class: extend({ 'pic-tooltip-content': true }, classes.content)
  }, content);

  const arrowNode = h(
    'div',
    {
      style: extend({}, style.arrow, style[`arrow-${placement.dock}`], placement.computedArrowStyle),
      class: extend({ 'pic-tooltip-arrow': true }, classes.arrow)
    },
    '' // TODO allow custom arrow content
  );

  const tooltipDefaultStyle = {
    position: 'relative',
    display: 'inline-block'
  };

  const tooltipNode = h(
    'div',
    {
      style: extend(tooltipDefaultStyle, placement.computedTooltipStyle),
      class: extend({ 'pic-tooltip': true }, classes.tooltip),
      attrs: {
        dir: props.direction
      }
    },
    [contentNode, arrowNode]
  );

  renderer.render([tooltipNode]);

  return renderer.element().children[0];
}
