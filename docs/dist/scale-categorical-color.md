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
        range: ['red', 'blue']
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
  type: 'categorical-color', // Optional
  range: [  // Optional
    : /* string */,
  ],
  unknown: /* string */, // {@link https://github.com/d3/d3-scale#ordinal_unknown} // Optional
  explicit: {  // Optional
    // Explicitly bind values to an output
    domain[]: [  // Optional
      : /* object */,
    ],
    range[]: [  // Optional
      : /* string */,
    ],
  },
}
```

