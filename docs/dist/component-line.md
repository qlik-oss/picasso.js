---
title: Line area
---

A component that renders lines and areas.

![Line component](/img/line.png)

## Example

```js
{
  type: 'line',
  data: {
    extract: {
      field: 'Month',
      props: {
        minor: { field: 'Sales' },
        year: { field: 'Year' }
      }
    }
  },
  settings: {
    coordinates: {
      minor: { scale: 'y' },
      major: { scale: 'x' },
      layerId: { ref: 'year' } 
    },
    orientation: 'horizontal',
    layers: {
      curve: 'monotone',
      show: true,
      line: {
        strokeWidth: 2,
        stroke: {
          scale: 'color',
          ref: 'id' 
        },
        opacity: 1,
        show: (a, i) => i >= 1
      },
      area: {
        fill: {
          scale: 'color',
          ref: 'id'
        },
        opacity: 0.9,
        show: (a, i) => i < 2
      }
    }
  }
```

## API Reference

### Settings

```js
{
  coordinates: { 
    minor: 0.5,
    major: 0.5,
    layerId: 0, // Optional
  },
  orientation: 'horizontal', // Optional
  layers: { 
    curve: 'linear', // Optional
    show: true, // Optional
    line: { 
      stroke: '#ccc', // Optional
      strokeWidth: 1, // Optional
      opacity: 1, // Optional
      show: true, // Optional
    },
    area: { 
      fill: '#ccc', // Optional
      opacity: 0.8, // Optional
      show: true, // Optional
    },
  },
}
```

