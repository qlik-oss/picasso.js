---
title: Sequential legend
---

The Sequential legend can represent sequential data mapped to a color range.

## Data and scales

The legend component doesn't take any [data](data.md) as input directly, instead the data is implicitly fetched from the referenced [scales](scales.md).

There are two required scales, a `fill` scale and a `major` scale. The `fill` scale represent the color range, via a sequential color scale, and `major` is the numerical representation, via a linear scale.

## Layout

The legend can be laid out in two directions, horizontal and vertical. The direction is dependent on the docking area, `top` and `bottom` are horizontal and `left` and `right` are vertical.

Horizontal layout:
![Horizontal layout](/img/legend-seq-h.png)

Vertical layout:
![Vertical layout](/img/legend-seq-v.png)

### Custom labels

Custom labels can be configured using a ticks function. The ticks function is evaluated for each tick (start and stop) and expects a string value to be returned.

```js
{
  type: 'legend-seq',
  settings: {
    fill: 'sequential-color-scale',
    major: 'linear-scale',
    tick: {
      label: (tickValue, index) => {
        const temp = ['Hot', 'Cold'];
        return temp[index % 2];
      },
    }
  }
}
```

![Custom labels](/img/legend-seq-custom-ticks.png)

## Formatting

Label formatting is derived from the `major` scale and the data itself. But as with any component, it is possible to reference a [custom formatter](formatters.md) using the `formatter` property.

```js
{
  type: 'legend-seq',
  formatter: {
    formatter: 'd3', // The type of formatter to use
    type: 'number', // The type of data to format
    format: '-1.0%' // Format pattern
  }
}
```

## Interaction

There is no direct way to configure interactions, instead it is done via other components, such as the [brush-range](component-brush-range.md).

### Enable range selection

To enable range selelection, two scene nodes are exposed that can be referenced, via a CSS selector, by the [brush-range](component-brush-range.md) component as a target.
This reference enables the [brush-range](component-brush-range.md) component to limit the target area to a sub-area of the legends dock area.

```js
chartSettings = {
  interactions: [
    ... // Setup required brush-range interactions here.
  ],
  scales: {
    'sequential-color-scale': { source: '0/1', type: 'color' },
    'linear-scale': { source: '0/1', type: 'linear' },
  },
  components: [
    {
      type: 'legend-seq',
      layout: {
        dock: 'right',
      },
      key: 'myLegend' // Reference by the brush-range component,
      settings: {
        fill: 'sequential-color-scale',
        major: 'linear-scale'
      }
    },
    {
      type: 'brush-range',
      key: 'myBrushRange',
      layout: {
        dock: '@myLegend', // Legend reference
      },
      settings: {
        brush: 'highlight',
        scale: 'linear-scale',
        direction: 'vertical',
        bubbles: {
          align: 'start',
          placement: 'outside' // Render bubbles outside the legends dock area
        },
        target: {
          selector: '[id="legend-seq-target"]', // Define the target area. Must reference a node from @myLegend
          fillSelector: '[id="legend-seq-ticks"]', // Define the target fill area. Must reference a node from @myLegend
          fill: 'rgba(82,204,82,0.3)',
        }
      },
  }]
}
```

## API Reference

{{>struct definitions.component--legend-seq}}