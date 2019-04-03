---
title: Range
---

A component that renders active `brush` ranges.

## Component settings

{{>struct definitions.component--range}}

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
    layout: {
      dock: '@here' // dock to same area as component with key: 'here'
    },
    ...
  }
]
```
