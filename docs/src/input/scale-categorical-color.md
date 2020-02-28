---
title: Categorical color
---

## Usage

```js
picasso.chart({
  data,
  element,
  settings: {
    scales: {
      myScale: {
        type: 'categorical-color',
        data: ['d1', 'd2'],
        range: ['red', 'blue'],
      },
    },
    components: [
      {
        type: 'some-component',
        scale: 'myScale',
      },
    ],
  },
});
```

## API Reference

### Settings

{{>struct definitions.scale--categorical-color}}
