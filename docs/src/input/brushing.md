---
title: Brushing in components
---

Brushing in a component is handled in two ways: _trigger_ and _consume_.

## Observe actions on the component

`trigger` controls how the component reacts to various user actions like 'tapping on a shape':

- `on`: type of interaction to react to
- `action`: type of action to respond with. _Optional_
- `contexts`: name of the brushing contexts to affect
- `data`: the mapped data properties to add to the brush. _Optional_
- `propagation`: control the event propagation when multiple shapes are tapped. Disabled by default. _Optional_
- `globalPropagation`: control the event propagation between components. Disabled by default. _Optional_
- `touchRadius`: extend contact area for touch events. Disabled by default. _Optional_

```js
trigger: [{
  on: 'tap',
  action: 'toggle',
  contexts: ['selection', 'tooltip'],
  data: ['x'],
  propagation: 'stop', // 'stop' => prevent trigger from propagating further than the first shape
  globalPropagation: 'stop', // 'stop' => prevent trigger of same type to be triggered on other components
  touchRadius: 24
}],
```

## Observe changes of a brush context

`consume` controls how the component uses active brushes.

- `context`: name of the brush context to observe
- `data`: the mapped data properties to observe. _Optional_
- `mode`: data properties operator: `and`, `or`, `xor`. _Optional_
- `filter`: a filtering function. _Optional_
- `style`: the style to apply to the shapes of the component
  - `active`: the style of _active_ data points
  - `inactive`: the style of _inactive_ data points

```js
consume: [
  {
    context: 'selection',
    data: ['x'],
    filter: shape => shape.type === 'circle',
    style: {
      active: {
        fill: 'red',
        stroke: '#333',
        strokeWidth: shape => shape.strokeWidth * 2,
      },
      inactive: {},
    },
  },
];
```

## Programmatic changes

Brushes can be controlled programatically by accessing a certain brush from the picasso instance:

```js
const pic = picasso.chart(...);
const highlighter = pic.brush('highlight'); // get brush instance
highlighter.addValue('products', 'Bike'); // highlight 'Bike'
```

when `addValue` is called, components that are _consuming_ the _highlight_ brushing context will react automatically and apply the specified style.

## Brushing and linking

All components using a _trigger_ or _consume_ configuration will automatically be linked within the same chart. To link brushes from two different chart instances, use `link`:

```js
const scatter = picasso.chart(/* */);
const bars = picasso.chart(/* */);
scatter.brush('select').link(bars.brush('highlight'));
```

Now, whenever a value is brushed in the `scatter` instance, the same values will also be brushed in the `bars` instance:

![Brushing and linking](/img/brush-link.gif)

## Examples

**Scenario**: Tapping on a data point in a component should activate a brush called _highlight_, add the relevant data to the brush, and finally highlight the point in the component.

```js
{
  type: 'point',
  data: {...},
  settings: {...},
  brush: {
    trigger: [{
      on: 'tap',
      contexts: ['highlight']
    }],
    consume: [{
      context: 'highlight',
      style: {
        inactive: {
          opacity: 0.3
        }
      }
    }]
  }
}

```

To make the component react to a _tap_, a `trigger` is added with an `on` of type `'tap'`, and `'highlight'` as brush `contexts` that should be affected.

To have the component listen to brush changes and update itself, a `consume` object is added with the name of the `context` to observe.
