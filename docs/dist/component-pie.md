---
title: Pie
---

A component that renders pie slices in a designated area.

## Example

```js
{
  type: 'pie',
  data: {
    extract: {
      field: 'Products',
      props: {
        num: { field: 'Sales' }
      },
    }
  },
  settings: {
    //startAngle: Math.PI / 2,
    //endAngle: -Math.PI / 2,
    padAngle: 0.01,
    slice: {
      arc: { ref: 'num' },
      outerRadius: 0.8,
      innerRadius: 0.2,
      cornerRadius: 2,
      opacity: 0.8,
      offset: (e, ix) => {
        return ix === 2 ? 0.1 : 0;
      },
      fill: '#6a6',
      strokeWidth: (e, ix) => {
        return ix === 2 ? 2 : 0;
      },
      stroke: '#333'
    }
  }
}
```

![Pie](/img/pie.png)

## API Reference

### Settings

```js
{
  startAngle: 0, // Start angle of the pie, in radians // Optional
  endAngle: /* number */, // End angle of the pie, in radians // Optional
  slice: { 
    arc: 1, // Absolute value of the slice's arc length // Optional
    show: true, // Visibility of the slice // Optional
    fill: '#333', // Fill color of the slice // Optional
    stroke: '#ccc', // Stroke color of the slice // Optional
    strokeWidth: 1, // Stroke width of the slice // Optional
    opacity: 1, // Opacity of the slice // Optional
    innerRadius: 0, // Inner radius of the slice // Optional
    outerRadius: 0.8, // Outer radius of the slice // Optional
    cornerRadius: 0, // Corner radius of the slice, in pixels // Optional
    offset: 0, // Radial offset of the slice // Optional
  },
}
```

