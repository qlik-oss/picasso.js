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

{{>struct definitions.component--pie-settings}}
