---
title: Components
---

Components make up the visual parts of a chart and typically include axis, grid-lines and data points encoded in various ways.

## Using components in a chart

Each component has a `type` property which identifies the type of component to create.

To use components, add them in the `components` array:

```js
picasso.chart({
  settings: {
    components: [{
      type: 'point',
      data: { /* ... */ },
      settings: { /* ... */ }
    }, {
      type: 'axis',
      layout: {
        dock: 'bottom'
      }
      scale: 'x'
    }]
  }
});
```

Some properties are general and can be used on all components:

* `show` *boolean*. True if component should be rendered.
* `layout` *object*. Layout settings
* `layout.dock` *string*. Dock setting. Any of `top` | `right` | `bottom` | `left`
* `layout.displayOrder` *number*. The order in which components are rendered (similar to css z-index).
* `layout.prioOrder` *number*. The order in which components are docked from the center area,
* `layout.minimumLayoutMode` *string*. 
* `data` *object*. See [data section](./data.md).
* `settings` *object*.
* `created` *function*. Lifecycle hook.
* `beforeMount` *function*. Lifecycle hook.
* `mounted` *function*. Lifecycle hook.
* `beforeRender` *function*. Lifecycle hook.
* `beforeUpdate` *function*. Lifecycle hook.
* `updated` *function*. Lifecycle hook.
* `beforeDestroy` *function*. Lifecycle hook.
* `destroyed` *function*. Lifecycle hook.

**`settings`**

Most components use a `settings` object that is specific to the component itself.

## Registering a custom component

A custom component can be registered using the `picasso.component` registry:

**`picasso.component(name, definition)`**

- `name` *string*. Name of the component to register.
- `definition` *object*
  * `created` *function* (optional). Lifecycle hook.
  * `beforeMount` *function* (optional). Lifecycle hook.
  * `mounted` *function* (optional). Lifecycle hook.
  * `beforeRender` *function* (optional). Lifecycle hook.
  * `render` *function* (optional). Lifecycle hook.
  * `beforeUpdate` *function* (optional). Lifecycle hook.
  * `updated` *function* (optional). Lifecycle hook.
  * `beforeDestroy` *function* (optional). Lifecycle hook.
  * `destroyed` *function* (optional). Lifecycle hook.

### A draw line component

Let's make a component that draws a red line across its entire display area:

```js
picasso.component('drawLine', {
  render() {
    return [{
      type: 'line',
      stroke: 'red',
      strokeWidth: 4,
      x1: this.rect.x,
      y1: this.rect.y,
      x2: this.rect.width,
      y2: this.rect.height
    }];
  }
});
```

It can then be used like any other component:

```js
picasso.chart({
  element,
  settings: {
    components: [{
      type: 'drawLine'
    }]
  }
});
```

## Visibility of a component
It is possible to get the visibility of a component when it is mounted/unmounted. This can be done in the following example.

Assume a custom component of type foo: 

```js

const foo = {
  type: 'foo',
  key: 'myComponent'
};

const chart = picasso.chart({
  element,
  settings: {
    components: [foo]
  }
});

chart.component('myComponent').isVisible(); // returns a boolean determining if the component is visible or not
```

## Component lifecycle hooks

__TODO__

(Note that the lifecycle hooks in the component definition __do not__ share the same context as hooks used in the component settings of a chart).

