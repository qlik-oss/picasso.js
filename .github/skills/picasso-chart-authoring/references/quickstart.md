# Quickstart

Start from this minimal scatter plot when the user needs a concrete working baseline.

```js
picasso.chart({
  element: document.querySelector('#container'),
  data: [
    {
      type: 'matrix',
      data: [
        ['Month', 'Sales', 'Margin'],
        ['Jan', 1106, 7],
        ['Feb', 5444, 53],
        ['Mar', 147, 64],
        ['Apr', 7499, 47],
      ],
    },
  ],
  settings: {
    scales: {
      x: { data: { field: 'Margin' }, expand: 0.1 },
      y: { data: { field: 'Sales' }, expand: 0.1 },
    },
    components: [
      {
        type: 'axis',
        scale: 'y',
        layout: { dock: 'left' },
      },
      {
        type: 'axis',
        scale: 'x',
        layout: { dock: 'bottom' },
      },
      {
        type: 'point',
        data: {
          extract: {
            field: 'Month',
            props: {
              x: { field: 'Margin' },
              y: { field: 'Sales' },
            },
          },
        },
        settings: {
          x: { scale: 'x' },
          y: { scale: 'y' },
          size: () => 0.4,
          opacity: 0.8,
        },
      },
    ],
  },
});
```

Use this checklist before extending it:

1. Confirm the field names match the actual dataset headers.
2. Confirm the extracted props match the refs used in component settings.
3. Add `expand` on positional scales before adjusting padding elsewhere.
4. Only add color, brushing, or labels after the base chart renders correctly.

Common upgrades:

- Bubble chart: map `size` to an extracted prop or a dedicated size scale.
- Distribution plot: use a categorical band scale on one axis and a continuous scale on the other.
- Highlighting: add a `brush` block to the `point` component.
