---
title: Axis
---

## Data and scales

The axis component doesn't take any [data](data.md) as input directly, instead the data is implicitly fetched from the referenced [scale](scales.md).

From the scale, which is either discrete or continuous, an axis is constructed.

### Discrete

![Discrete axis](/img/axis-dis-h.png)

### Continuous

![Continuous axis](/img/axis-cont-h.png)

## Layout

There are two directions in which the axis can be laid out, either horizontal or vertical. Depending on direction, different labeling modes are available.

A vertical axis is limited to only horizontal labels. While a horizontal axis have the option to show horizontal labels on two rows or show vertical labels tilted at an angle.

### Tilted labels

Tilted labels are only supported on a discrete axis. When the `mode` property is set to `auto`, labels are tilted when there is not enough space available. 

```js
{
  type: 'axis',
  scale: 'myDiscreteScale',
  layout: {
    dock: 'bottom'
  },
  settings: {
    labels: {
      mode: 'tilted',
      tiltAngle: 35
    }
  }
}
```

![Tilted labels](/img/axis-tilted-labels.png)

### Layered labels

Layered labels are only supported on a discrete axis.

```js
{
  type: 'axis',
  scale: 'myDiscreteScale',
  layout: {
    dock: 'bottom'
  },
  settings: {
    labels: {
      mode: 'layered'
    }
  }
}
```

![Layered labels](/img/axis-layered-labels.png)

### Using maxGlyphCount

The `maxGlyphCount` property is used to measure the largest possible size of a label. The size of a label primarily affects two things: first, when we determine the required size to render an axis (this can also be limited via the `maxLengthPx` property), and second, when the `mode` is set to `auto`, it is used to calculate the threshold for switching between horizontal and tilted labels.

Under the hood, `maxGlyphCount` is a multiplier on the size of the character `M`, as measured using the `fontSize` and `fontFamily`.

```js
{
  type: 'axis',
  scale: 'myDiscreteScale',
  settings: {
    labels: {
      mode: 'auto',
      maxGlyphCount: 20
    }
  }
}
```

### Using paddingStart

The `paddingStart` property adds padding to the opposite side of where the axis is *docked* (or *aligned* when using `dock: center`). It can be specified as either a number or a function (does not receive any parameters).

Specified as a number, in this case `100px` padding will be added the right side of the axis:
```js
{
  type: 'axis',
  scale: 'myScale',
  dock: 'left',
  settings: {
    paddingStart: 100,
  }
}
```

In this example we use a function to move the axis next to a specific element (e.g. useful when adding one axis per bar in a bar chart):
```js
{
  type: 'axis',
  scale: 'myScale',
  dock: 'center',
  settings: {
    align: 'left',
    paddingStart: () => {
      // Move the axis next to a specific element
      const label = 'A value on the major axis';
      const majorScale = chart.scale('myMajorScale');
      return chartWidth * (majorScale(label) + majorScale.bandwidth());
    }
  }
}
```

### Using paddingEnd

The `paddingEnd` property can be used in the same way as `paddingStart`. If not specified it defaults to `10`. It will add padding to the same side as the axis is *docked* (or *aligned* when using `dock: center`).


## Formatting

Label formatting is derived from the scale and the data itself. But as with any component, it is possible to reference a [custom formatter](formatters.md) using the `formatter` property.

### Custom formatting

```js
{
  type: 'axis',
  formatter: {
    formatter: 'd3', // The type of formatter to use
    type: 'number', // The type of data to format
    format: '-1.0%' // Format pattern
  }
}
```

## Interaction

On a discrete axis it possible to configure the axis to consume and trigger [brush](brushing.md) events.

```js
{
  type: 'axis',
  scale: 'myDiscreteScale',
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

For a continuous axis there is no direct way to configure interactions, instead it is done via other components, such as the [brush-range](component-brush-range.md) or [brush-area](component-brush-area-dir.md) component.

## API Reference

### Discrete axis settings

{{>struct definitions.component--axis-discrete}}

### Continuous axis settings

{{>struct definitions.component--axis-continuous}}