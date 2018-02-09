---
title: Linear
---

## Usage

Here the domain is set using the `min`/`max` properties instead of binding it via data.

```js
picasso.chart({
  data,
  element,
  settings: {
    scales: {
      myScale: {
        type: 'linear',
        min: 0,
        max: 100
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

### Custom ticks with start, end and label

To have a tick representing a range, it is possible to define a set of custom ticks with a value (the tick) and its start and end values.

```js
{ // scale settings
  domain: [0, 10],
  ticks: {
    values: [
      { value: 3, start: 2, end: 4, label: '$3' },
      { value: 6, start: 5, end: 7, label: '$6' }
    ]
  }
}
```

## API Reference

### Settings

```js
{
  type: 'linear', // Optional
  expand: /* number */, // Expand the output range // Optional
  invert: false, // Invert the output range // Optional
  include: [  // Optional
    : /* number */,
  ],
  ticks: {  // Optional
    tight: false, // Optional
    forceBounds: false, // Optional
    distance: 100, // Approximate distance between each tick // Optional
    values: /* Array<number> | Array<object> */,  // Optional
    count: /* number */, // Optional
  },
  minorTicks: {  // Optional
    count: 3, // Optional
  },
  min: /* number */, // Set an explicit minimum value // Optional
  max: /* number */, // Set an explicit maximum value // Optional
}
```

