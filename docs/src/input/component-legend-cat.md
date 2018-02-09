---
title: Categorical legend
---

A component that renders a static categorical color legend

## Overflow

When all the items in the legend don't fit in the designated space, a navigation component will be added to the legend, which will make it possible to navigate to items currently not in view.

The navigation contains two &lt;button&gt; elements whose content can be modified through the `navigation` setting.

```js
navigation: {
  class: {
    'my-button': true
  },
  content: function(h, state) {
    return h('span', {
      class: {
        [`arrow-${state.direction`}]: true
      }
    })
  }
}
```

## Events

When the legend overflows, it is also possible to navigate by emitting events on the legend:

### `next` event

Scroll to the next item.

```js
picassoInstance.component('<key value of legend-cat>').emit('next');
```

### `prev` event

Scroll to the previous item.

```js
picassoInstance.component('<key value of legend-cat>').emit('prev');
```

### `scroll` event

Trigger a manual scroll by passing the amount of pixels as a parameter.

This event is to allow mousewheel scroll and scroll on panning.

```js
picassoInstance.component('<key value of legend-cat>').emit('scroll', 20);
```

## API Reference

{{>struct definitions.component--legend-cat}}
