import extend from 'extend';

export default function render(items, placement, {
  renderer,
  style,
  props,
  h
}) {
  const data = {
    style: extend({}, style.tooltip),
    class: props.tooltipClass
  };
  const content = props.content({
    h,
    style,
    items,
    props
  });
  const tooltip = h('div', data, content);

  const arrow = h(
    'div',
    {
      style: extend({}, style.arrow, placement.arrowStyle),
      class: typeof props.arrowClass === 'function' ? props.arrowClass({ dock: placement.dock }) : props.arrowClass
    },
    '' // TODO allow custom arrow content
  );

  const containerDefaultStyle = {
    position: 'relative',
    display: 'inline-block'
  };

  let element;
  const container = h(
    'div',
    {
      style: extend(containerDefaultStyle, placement.style),
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
    [tooltip, arrow]
  );

  renderer.render([container]);

  return element;
}
