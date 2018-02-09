---
title: Brush lasso
---

The lasso components enables freehand brush and a default options to snap the brush area into a polygon.

Since this component depends on other referenced components, it's important that the `displayOrder` property is set to a larger value than all of the referenced components.

![Example](/img/brush-lasso.png)

## Events

There are four different types of listeners that can be utilized to visualize a lasso and brush on components.

* `lassoStart`: initializs the lasso. This will make the other listeners active. If a `lassoStart` has not been triggered, the other listeners have no effect.
* `lassoMove`: to create a lasso, at least one `lassoMove` has to be triggered. On each consecutive `lassoMove`, a brush event is triggered for the line segment between the previous `lassoMove` coordinate and the current coordinate.
* `lassoEnd`: if within snap threshold, the lasso is closed and a brush event is triggered on the area of the enclosed lasso; if not - no brush is triggered.
* `lassoCancel`: cancel the current lasso by removing the visual parts and trigger an `end` event for the brush contexts.

The events are triggered from the component instance and expect an event object as parameter with the following properties:

```js
const param = {
  center: {
    x: 1,
    y: 2
  }
};

compInstance.emit('lassoStart', param);
```

## Interaction

The interaction is setup by defining a gesture that then trigger the events available on the component.

In the example below the `hammerjs` plugin is used to detect panning movements.

```js
settings: {
  interactions: [{
    type: 'hammer',
    gestures: [{
      type: 'Pan',
      events: {
        panstart: function onPanStart(e) {
          // If it should trigger only on a specific component, use chartInstance.componentsFromPoint() to determine if start point is valid or not
          this.chart.component('lassoComp').emit('lassoStart', e);
        },
        pan: function onPan(e) {
          this.chart.component('lassoComp').emit('lassoMove', e);
        },
        panend: function onPanEnd(e) {
          this.chart.component('lassoComp').emit('lassoEnd', e);
        }
      }
    }]
  }],
  components: [
    {
      key: 'myPm',
      type: 'point',
      brush: {
        consume: [
          {
            context: 'myLassoContext',
            style: {
              inactive: {
                opacity: 0.3
              }
            }
          }
        ]
      },
      ...
    },
    {
      key: 'lassoComp',
      type: 'brush-lasso',
      brush: {
        components: [
          {
            key: 'myPm',
            contexts: ['myLassoContext']
          }
        ]
      }
    }
  ]
}
```

## API Reference

{{>struct definitions.component--brush-lasso-settings}}