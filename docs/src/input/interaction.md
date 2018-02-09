---
id: interaction
title: Interaction
---

Interactions provide an API to bind events to a picasso chart in a declarative way.

## Using interactions in a chart

Each interaction has a `type` property that identifies the type of interaction to add to the chart.

To define an interaction, you need to add them in the `interactions` array:

```js
picasso.chart({
  settings: {
    interactions: [{
      type: 'native',
      key: 'someKey',
      enable: /* ... */,
      events: { /* ... */ }
    }, {
      type: 'hammer',
      key: 'anotherKey',
      enable: /* ... */,
      gestures: { /* ... */ }
    }]
  }
});
```

## Bundled interactions

picasso.js comes pre-bundled with a native interaction definition:

```js
interactions: [
  {
    type: 'native',
    key: 'here',
    enable: function() {  // bool or function
      this.chart /*...*/;
      return true;
    },
    events: {
      mousemove: function(e) { // key should point to a native event
        // handle event here
      },
      keydown: function(e) {
        // handle event here
      }
    }
  }
]
```

... and together with picasso the following interaction plugin is shipped:

- [hammer](plugin-hammer.md)

## Register a custom interaction

To register a new interaction, use the `picasso.interaction` registry.

**`picasso.interaction(name, definition)`**

- `name` *string*. Name of the interaction to register.
- `definition` *object*
  * `key` *getter* (optional) Returns the key identifier for this definition. Used for making updates with changes to the definition a smooth ride.
  * `set` *function* Set interaction settings and add/update event handlers to the chart element.
  * `off` *function* Turn off interactions.
  * `on` *function* Turn on interactions.
  * `destroy` *function* Remove all bound events.
