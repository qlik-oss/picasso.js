---
title: Threshold color
---

## Usage

```js
picasso.chart({
  data,
  element,
  settings: {
    scales: {
      myScale: {
        type: 'threshold-color',
        domain: [25,50,75],
        range: ['red', 'blue'],
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

## API Referance

### Settings

```js
{
  type: 'threshold-color', // Optional
  domain: [  // Optional
    : /* number */,
  ],
  range: [  // Optional
    : /* string */,
  ],
  invert: false, // Invert range // Optional
  min: /* number */, // Set an explicit minimum value // Optional
  max: /* number */, // Set an explicit maximum value // Optional
  nice: false, // If set to true, will generate 'nice' domain values. Ignored if domain is set. // Optional
}
```

