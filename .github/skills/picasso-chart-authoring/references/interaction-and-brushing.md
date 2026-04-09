# Interaction And Brushing

Picasso distinguishes between general event bindings and brush-driven selection state.

## Use Brushing For Selection State

Brushing has two halves:

- `trigger`: observe user actions and add values to one or more brush contexts.
- `consume`: observe brush state and restyle or filter shapes accordingly.

Minimal highlight example:

```js
{
  type: 'point',
  data: {...},
  settings: {...},
  brush: {
    trigger: [{
      on: 'tap',
      contexts: ['highlight'],
    }],
    consume: [{
      context: 'highlight',
      style: {
        inactive: { opacity: 0.3 },
      },
    }],
  },
}
```

Useful trigger options:

- `action: 'toggle'` for repeated select and deselect behavior.
- `data: ['x']` or similar when only specific extracted props should be brushed.
- `propagation` and `globalPropagation` when overlapping shapes cause too many triggers.
- `touchRadius` and `mouseRadius` for easier interaction on dense marks.

## Use Interactions For Event Plumbing

Use `interactions` when the behavior is about chart-level DOM events or gesture recognizers.

Native example:

```js
interactions: [
  {
    type: 'native',
    key: 'hover-events',
    enable() {
      return true;
    },
    events: {
      mousemove(e) {
        // custom logic
      },
    },
  },
];
```

Hammer example:

```js
interactions: [
  {
    type: 'hammer',
    key: 'pan-zoom',
    gestures: [
      {
        type: 'Pan',
        options: { event: 'plotPan' },
        events: {
          plotPanstart(e) {},
          plotPan(e) {},
          plotPanend(e) {},
        },
      },
    ],
  },
];
```

## Programmatic Brush Control

Brushes are available from the chart instance.

```js
const chart = picasso.chart({...});
const highlight = chart.brush('highlight');
highlight.addValue('products', 'Bike');
```

Link brush contexts across charts:

```js
scatter.brush('select').link(bars.brush('highlight'));
```

## Q Plugin Selection Mapping

When using `picasso-plugin-q`, brush state can be translated into QIX selection calls. Use that when the user is building selections against a Qlik engine, not just visual highlighting.

## Practical Rules

- Use brushing first for mark selection and visual feedback.
- Use interactions when you need raw event control, gesture recognizers, or custom DOM handling.
- Keep brush context names stable and descriptive, such as `selection`, `highlight`, or `tooltip`.
