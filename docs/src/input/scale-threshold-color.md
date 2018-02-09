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

{{>struct definitions.scale--threshold-color}}