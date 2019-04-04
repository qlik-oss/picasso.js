---
title: Brush range
---

Brush range component enables [brushing](brushing.md) a range, or set of ranges, of continuous data.

Since this component depends on other referenced components, it's important that the `displayOrder` property is set to a larger value than all of the referenced components.

## Data and scales

No [data](data.md) is required as input directly, instead the data is implicitly fetched from the referenced [scale](scales.md). The scale must however be [linear](scales.md).

## Layout

There are two ways to set the layout, either by referencing a `target` components, in which case, the rendering area extends from the `target` components to the start of the opposite docking area. Ex. if `target` is docked to the `right`, then the rendering area includes the `right` area and the `center` area. The other option, which is default, is if no `target` component is configured, then the `center` area is used.

A `target` is configured in the `target` property:

```js
settings: {
  target: {
    components: ['my-target-component']
  }
}
```

## Events

* `rangeStart`: initialize the range selection
* `rangeMove`: change the size of the range or move the current active range
* `rangeEnd`: end the current active range
* `rangeClear`: cancel the active range
* `bubbleStart`: start editing a bubble in the active range
* `bubbleEnd`: end bubble edit

The events are triggered from the component instance.

`range` events expects an event object as parameter with the following properties:

```js
const param = {
  center: {
    x: 1,
    y: 2
  },
  deltaX: 0,
  deltaY: 0
};

compInstance.emit('rangeStart', param);
```

`bubbleStart` expects an event object as parameter with the following properties:

```js
const param = {
  target: <DOMElement>
};

compInstance.emit('bubbleStart', param);
```

## Usage

Set up the required interaction events.

```js
interactions: [
  {
    type: 'hammer',
    gestures: [{
      type: 'Pan',
      options: {
        event: 'range',
        direction: Hammer.DIRECTION_VERTICAL,
      },
      events: {
        rangestart: function(e) {
          this.component('my-brush-range-component').emit('rangeStart', e);
        },
        rangemove: function(e) {
          this.component('my-brush-range-component').emit('rangeMove', e);
        },
        rangend: function(e) {
          this.component('my-brush-range-component').emit('rangeEnd', e);
        }
      }
    }]
  }
],
```

... and configure the component.

```js
components: [
  {
    type: 'brush-range',
    key: 'my-brush-range-component',
    settings: {
      brush: 'some-brush-context',
      scale: 'some-linear-scale'
    },
    target: {
      components: ['target-this-component']
    }
  },
  ...
]
```

### Observe brush change

It is possible to observe brush changes and render a range/s upon change.

```js
{
  type: 'brush-range',
  settings: {
    brush: {
      context: '<some-context>',
      observe: true // The brush range is than rendererd every time the brush context changes
    },
    scale: '<some-linear-scale>'
  }
}

// The following code will trigger the brush-range to render
chartInstance.brush('<some-context>').toggleRange('<key>', { min: 1, max: 2 });
```

## API Reference

### Settings

{{>struct definitions.component--brush-range-settings}}

### Style

{{>struct definitions.component--brush-range-style}}