---
title: Scales
---

Scales are an essential part of most vizualizations and picasso.js comes bundled with a couple of them.

The scales in picasso.js are augmented [d3 scales](https://github.com/d3/d3-scale), where the main difference is tigher integration with [data](data.md).

## Using scales

Scales are used indirectly via the `picasso.chart` API. Where the `chart` API instantiate the scales. This approach allows [components](components.md) to use a scale instances by reference. It also possible to access via the chart instance API.

```js
const chartInstance = picasso.chart({
  data,
  element,
  settings: {
    scales: {
      nameOfMyScale: {
        type: 'type-of-scale',
        data,
        aScaleProperty: true // Add scale setting properties here
      }
    },
    components: [
      {
        type: 'some-component',
        scale: 'nameOfMyScale' // Pass the scale instance to the component
      }
    ]
  }
});

chartInstance.scales('nameOfMyScale'); // Returns a scale instance
```
