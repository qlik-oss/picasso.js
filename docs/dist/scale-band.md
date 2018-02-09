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
        data: ['item1', 'item2', 'item3']
      }
    },
    components: [
      {
        type: 'some-component',
        scale: 'myScale'
      }
    ]
  }
});
```

## API Reference

### Settings

```js
{
  type: 'band', // Optional
  padding: /* number */, // {@link https://github.com/d3/d3-scale#band_padding} // Optional
  paddingInner: /* number */, // {@link https://github.com/d3/d3-scale#band_paddingInner} // Optional
  paddingOuter: /* number */, // {@link https://github.com/d3/d3-scale#band_paddingOuter} // Optional
  align: /* number */, // {@link https://github.com/d3/d3-scale#band_align} // Optional
  invert: false, // Invert the output range // Optional
  maxPxStep: /* number */, // Explicitly limit the bandwidth to a pixel value // Optional
}
```

