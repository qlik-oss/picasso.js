---
title: Range
---

A component that renders active `brush` ranges.

## Component settings

```js
{
  settings: { 
    brush: /* string */, // Name of brush instance
    scale: /* string */, // Name of a scale
    direction: 'horizontal', // Direction of the brush // Optional
    fill: '#ccc', // Fill color // Optional
    opacity: 1, // Layer opacity // Optional
  },
}
```


The component can be docked to the same area as another component by referencing the `key` value:

```js
components: [
  {
    type: 'some-component',
    key: 'here',
    ...
  },
  {
    type: 'range',
    dock: '@here', // dock to same area as component with key: 'here'
    ...
  }
]
```
