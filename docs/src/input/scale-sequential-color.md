---
title: Sequential color
---

## Usage

```js
picasso.chart({
  data,
  element,
  settings: {
    scales: {
      myScale: {
        type: 'sequential-color',
        min: 0,
        max: 100,
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

{{>struct definitions.scale--sequential-color}}
