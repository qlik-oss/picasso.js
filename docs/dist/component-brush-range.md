---
title: Brush range
---

Brush range component enables [brushing](brushing.md) a range, or set of ranges, of continuous data.

Since this component depends on other referenced components, it's important that the `displayOrder` property is set to a larger value than all of the referenced components.

## Data and scales

No [data](data.md) is required as input directly, instead the data is implicitly fetched from the referenced [scale](scales.md). The scale must however be [linear](scales.md).

## Layout

There are two ways to set the layout, either by referencing a `target` component, in which case, the rendering area extends from the `target` component to the start of the opposite docking area. Ex. if `target` is docked to the `right`, then the rendering area includes the `right` area and the `center` area. The other option, which is default, is if no `target` component is configured, then the `center` area is used.

A `target` is configured in the `target` property:

```js
settings: {
  target: {
    component: 'my-target-component'
  }
}
```

## Events

There are four different types of listeners available.

* `rangeStart`: initialize the range selection
* `rangeMove`: change the size of the range or move the current active range
* `rangeEnd`: end the current active range
* `rangeClear`: cancel the active range

The events are triggered from the component instance and expect an event object as parameter with the following properties:

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
      component: 'target-this-component'
    }
  },
  ...
]
```

## API Reference

### Settings

```js
{
  brush: /* string */, // Brush context to apply changes to
  scale: /* string */, // Scale to extract data from
  direction: 'vertical', // Rendering direction [horizontal|vertical] // Optional
  bubbles: {  // Optional
    show: true, // True to show label bubble, false otherwise // Optional
    align: 'start', // Where to anchor bubble [start|end] // Optional
  },
  target: {  // Optional
    component: /* string */, // Render matching overlay on target component // Optional
    selector: /* string */, // Instead of targeting a component, target one or more shapes // Optional
    fillSelector: /* string */, // Target a subset of the selector as fill area. Only applicable if `selector` property is set // Optional
  },
}
```


### Style

```js
{
  bubble: {  // Optional
    fontSize: /* string */, // Optional
    fontFamily: /* string */, // Optional
    fill: /* string */, // Optional
    color: /* string */, // Optional
    stroke: /* string */, // Optional
    strokeWidth: /* number */, // Optional
    borderRadius: /* number */, // Optional
  },
  line: {  // Optional
    stroke: /* string */, // Optional
    strokeWidth: /* number */, // Optional
  },
  target: {  // Optional
    fill: /* string */, // Optional
    strokeWidth: /* number */, // Optional
    opacity: /* number */, // Optional
  },
}
```

