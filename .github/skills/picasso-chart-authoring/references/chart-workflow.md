# Chart Workflow

Use this sequence when generating or reviewing a picasso chart.

## 1. Frame The Visual Encoding

Write down:

- Which field defines the primary categories or items.
- Which fields map to x, y, width, height, size, or color.
- Whether the view is ordinal, continuous, stacked, grouped, or hierarchical.
- Whether the user needs hover, tap, linked selection, tooltips, or panning.

## 2. Pick The Dataset Type

- `matrix`: use for 2D arrays, arrays of objects, and delimiter-separated text.
- `q`: use for QIX hypercubes when field access, selections, and attribute dimensions matter.

Use keyed datasets when multiple sources feed one chart.

```js
data: [
  { key: 'products', type: 'matrix', data: [...] },
  { key: 'targets', type: 'matrix', data: [...] },
]
```

## 3. Shape Data For The Component

Prefer extraction that already matches the mark structure.

```js
data: {
  extract: {
    field: 'Product',
    props: {
      x: { field: 'Margin' },
      y: { field: 'Sales' },
      size: { field: '# Customers' },
    },
  },
}
```

Use these extraction tools deliberately:

- `props` to attach the measure values a component needs.
- `trackBy` when grouping repeated dimension values into one item.
- `reduce` to aggregate grouped values.
- `sort` and `filter` to shape extracted items.
- `stack` when building stacked bars or stacked areas.

## 4. Define Scales

Start with named scales and reuse them.

```js
scales: {
  x: { data: { field: 'Margin' }, expand: 0.1 },
  y: { data: { field: 'Sales' }, invert: true, expand: 0.1 },
  color: { data: { extract: { field: 'Category' } }, type: 'categorical-color' },
}
```

Rules of thumb:

- Let discrete dimensions drive `band` scales.
- Let numeric measures drive `linear` scales.
- Use explicit color scales when color is not a simple constant.
- Invert the y scale for Cartesian charts when increasing values should move upward.

## 5. Build The Layout

For Cartesian charts, add axes first.

```js
components: [
  { type: 'axis', scale: 'y', layout: { dock: 'left' } },
  { type: 'axis', scale: 'x', layout: { dock: 'bottom' } },
];
```

Then add legends, labels, and selection tools. Docking matters more than display styling when a chart is not laying out as expected.

## 6. Add The Main Component

- `point`: use `x`, `y`, optional `size`, `fill`, and `stroke`.
- `box`: use `major` and `minor` scales plus `start` and `end` props at minimum.
- `line`: use `coordinates.major` and `coordinates.minor`.
- `pie`: provide extracted slice values and a suitable color mapping.

## 7. Add Interaction And Brushing

Use `brush.trigger` to create state and `brush.consume` to react to that state.

```js
brush: {
  trigger: [{ on: 'tap', contexts: ['selection'] }],
  consume: [{
    context: 'selection',
    style: { inactive: { opacity: 0.3 } },
  }],
}
```

Use `interactions` when you need event handlers that are not mark-level brush triggers.

## 8. Validate Against The Runtime Model

Check:

1. The scale names referenced by components exist.
2. Each `ref` points to an extracted prop that actually exists.
3. Docked components have enough space.
4. The component type matches the structure of the extracted data.
5. Lifecycle hooks use standard functions if they depend on `this`.
