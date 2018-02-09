---
title: Point
---

A component that renders points in a designated area.

Typically used to create:

- Scatter plot (bubble chart)
- Distribution plot
- Heat maps

## Example

```js
{
  type: "point",
  data: {
    extract: {
      field: "Area",
      props: {
        x: { field: "S" },
        y: { field: "City" }
      }
    },
  },
  settings: {
    x: {
      scale: { data: { field: "S" } }
    },
    y: {
      scale: { data: { extract: { field: "City" } } }
    },
    fill: {
      scale: {
        data: { extract: { field: "City" } },
        type: 'color'
      },
      ref: 'y'
    },
    opacity: 0.8,
    size: () => Math.random(),
    strokeWidth: 2,
    stroke: "#fff"
  }
}
```

![Point distribution](/img/point-distribution.png)
