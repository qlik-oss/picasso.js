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

```js
{
  scale: /* string */,
  type: 'legend-cat',
  settings: { 
    layout: {  // Optional
      size: 1, // Maximum number of columns (vertical) or rows (horizontal) // Optional
      direction: 'ltr', // Layout direction. Either `'ltr'` or `'rtl'` // Optional
    },
    item: {  // Optional
      // Settings applied per item
      show: true, // Whether to show the current item // Optional
      label: {  // Optional
        wordBreak: 'none', // Word break rule, how to apply line break if label text overflows its maxWidth property. Either `'break-word'` or `'break-all'` // Optional
        maxLines: 2, // Max number of lines allowed if label is broken into multiple lines (only applicable with wordBreak) // Optional
        maxWidth: 136, // Maximum width of label, in px // Optional
      },
      shape: {  // Optional
        type: 'square', // Optional
        size: 12, // Optional
      },
    },
    title: {  // Optional
      show: true, // Whether to show the title // Optional
      text: /* string */, // Title text. Defaults to the title of the provided data field // Optional
      anchor: 'start', // Horizontal alignment of the text. Allowed values are `'start'`, `'middle'` and `'end'`
      wordBreak: 'none', // Word break rule, how to apply line break if label text overflows its maxWidth property. Either `'break-word'` or `'break-all'` // Optional
      maxLines: 2, // Max number of lines allowed if label is broken into multiple lines, is only appled when `wordBreak` is not set to `'none'` // Optional
      maxWidth: 156, // Maximum width of title, in px // Optional
    },
    navigation: {  // Optional
      button: {  // Optional
        class: /* object<string, boolean> */, // Optional
        content: /* function */,
      },
    },
  },
}
```

