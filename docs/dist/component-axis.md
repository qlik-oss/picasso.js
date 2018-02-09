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
  dock: 'bottom'
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
  dock: 'bottom'
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

```js
{
  labels: { 
    show: true, // Toggle labels on/off // Optional
    tiltAngle: 40, // Tilting angle in degrees. Capped between -90 and 90. Only applicable when labels are in `tilted` mode. // Optional
    maxEdgeBleed: /* number */, // Control the amount of space (in pixels) that labes can occupy outside their docking area. Only applicable when labels are in `tilted` mode. // Optional
    margin: 4, // Space in pixels between the tick and label. // Optional
    maxLengthPx: 150, // Max length of labels in pixels // Optional
    minLengthPx: 0, // Min length of labels in pixels. Labels will always at least require this much space // Optional
    mode: 'auto', // Control how labels arrange themself. Availabe modes are `auto`, `horizontal`, `layered` and `tilted`. When set to `auto` the axis determines the best possible layout in the current context. // Optional
    maxGlyphCount: /* number */, // When only a sub-set of data is available, ex. when paging. This property can be used to let the axis estimate how much space the labels will consume, allowing it to give a consistent space estimate over the entire dataset when paging. // Optional
    align: 0.5, // Align act as a slider for the text bounding rect over the item bandwidth, given that the item have a bandwidth. Except when labels are tilted, then the align is a pure align that shifts the position of the label anchoring point. // Optional
    offset: 0, // Offset in pixels along the axis direction. // Optional
  },
  ticks: { 
    show: false, // Toggle ticks on/off // Optional
    margin: 0, // Space in pixels between the ticks and the line. // Optional
    tickSize: 4, // Size of the ticks in pixels. // Optional
  },
  line: { 
    show: false, // Toggle line on/off // Optional
  },
  paddingStart: 0, // Padding in direction perpendicular to the axis // Optional
  paddingEnd: 10, // Padding in direction perpendicular to the axis // Optional
  align: 'auto', // Set the anchoring point of the axis. Avaialable options are `auto/left/right/bottom/top`. In `auto` the axis determines the best option. The options are restricted based on the axis orientation, a vertical axis may only anchor on `left` or `right` // Optional
}
```


### Continuous axis settings

```js
{
  labels: { 
    show: true, // Toggle labels on/off // Optional
    margin: 4, // Space in pixels between the tick and label. // Optional
    maxLengthPx: 150, // Max length of labels in pixels // Optional
    minLengthPx: 0, // Min length of labels in pixels. Labels will always at least require this much space // Optional
    align: 0.5, // Align act as a slider for the text bounding rect over the item bandwidth, given that the item have a bandwidth. // Optional
    offset: 0, // Offset in pixels along the axis direction. // Optional
  },
  ticks: { 
    show: true, // Toggle ticks on/off // Optional
    margin: 0, // Space in pixels between the ticks and the line. // Optional
    tickSize: 8, // Size of the ticks in pixels. // Optional
  },
  minorTicks: { 
    show: false, // Toggle minor-ticks on/off // Optional
    tickSize: 3, // Size of the ticks in pixels. // Optional
    margin: 0, // Space in pixels between the ticks and the line. // Optional
  },
  line: { 
    show: true, // Toggle line on/off // Optional
  },
  paddingStart: 0, // Padding in direction perpendicular to the axis // Optional
  paddingEnd: 10, // Padding in direction perpendicular to the axis // Optional
  align: 'auto', // Set the anchoring point of the axis. Avaialable options are `auto/left/right/bottom/top`. In `auto` the axis determines the best option. The options are restricted based on the axis orientation, a vertical axis may only anchor on `left` or `right` // Optional
}
```

