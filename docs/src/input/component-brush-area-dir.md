---
title: Brush area
---

Brush area direction component enables brushing on shapes over an rectangular area. the area is locked in the perpendicular docking direction, such that if docked at the `top` or `bottom`, only the width of the area is allowed to change size or be moved.

## Data and scales

No [data](data.md) is required as input directly, instead the data is implicitly fetched from the shapes.

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

The bubble labels are derived from the brush `data` property. If omitted the `self` data value is used.
```js
settings: {
  brush: [
    {
      key: 'brush-this-component',
      data: ['some data property on brush-this-component']
    }
  ]
}
```

## Events

There are four different types of listeners available.

* `areaStart`: initialize the brush
* `areaMove`: change the size of the area or move the current active area
* `areaEnd`: end the current active area
* `areaClear`: cancel the active area

The events are triggered from the component instance and expect an event object as parameter with the following properties:

```js
const param = {
  center: {
    x: 1,
    y: 2
  }
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
        direction: Hammer.DIRECTION_VERTICAL
      },
      events: {
        panstart: function(e) {
          this.chart.component('my-brush-area-component').emit('areaStart', e);
        },
        panmove: function(e) {
          this.chart.component('my-brush-area-component').emit('areaMove', e);
        },
        panend: function(e) {
          this.chart.component('my-brush-area-component').emit('areaEnd', e);
        }
      }
    }
  }
],
```

... and configure the component.

```js
components: [
  {
    type: 'brush-area-dir',
    key: 'my-brush-area-component',
    settings: {
      brush: {
        components: [{
          key: 'target-this-component',
          contexts: ['some-context']
        }]
      },
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

{{>struct definitions.component--brush-area-dir-settings}}

### Style

{{>struct definitions.component--brush-area-dir-style}}