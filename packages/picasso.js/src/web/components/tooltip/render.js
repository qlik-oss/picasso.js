import extend from 'extend';
import classString from '../../../core/utils/class-string';

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

  const tooltipDefaultStyle = {
    position: 'relative',
    display: 'inline-block'
  };

  const tooltipNode = (
    <div dir={props.direction} class={classString(extend({ 'pic-tooltip': true }, classes.tooltip))} style={extend(tooltipDefaultStyle, placement.computedTooltipStyle)}>
      <div style={style.content} class={classString(extend({ 'pic-tooltip-content': true }, classes.content))}>
        {content}
      </div>
      <div class={classString(extend({ 'pic-tooltip-arrow': true }, classes.arrow))} style={extend({}, style.arrow, style[`arrow-${placement.dock}`], placement.computedArrowStyle)}></div>
    </div>
  );

  renderer.render(tooltipNode);

  return renderer.element().children[0];
}
