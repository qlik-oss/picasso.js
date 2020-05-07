---
title: Band
---

## Usage

```js
picasso.chart({
  data,
  element,
  settings: {
    scales: {
      myScale: {
        type: 'band',
        data: ['item1', 'item2', 'item3'],
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

{{>struct definitions.scale--band}}
