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

- `show` _boolean_. True if component should be rendered.
- `layout` _object_. Layout settings
- `layout.dock` _string_. Dock setting. Any of `top` | `right` | `bottom` | `left`
- `layout.displayOrder` _number_. The order in which components are rendered (similar to css z-index).
- `layout.prioOrder` _number_. The order in which components are docked from the center area,
- `layout.minimumLayoutMode` _string_.
- `data` _object_. See [data section](./data.md).
- `settings` _object_.
- `created` _function_. Lifecycle hook.
- `beforeMount` _function_. Lifecycle hook.
- `mounted` _function_. Lifecycle hook.
- `beforeRender` _function_. Lifecycle hook.
- `beforeUpdate` _function_. Lifecycle hook.
- `updated` _function_. Lifecycle hook.
- `beforeDestroy` _function_. Lifecycle hook.
- `destroyed` _function_. Lifecycle hook.

**`settings`**

Most components use a `settings` object that is specific to the component itself.

## Registering a custom component

A custom component can be registered using the `picasso.component` registry:

**`picasso.component(name, definition)`**

- `name` _string_. Name of the component to register.
- `definition` _object_
  - `created` _function_ (optional). Lifecycle hook.
  - `beforeMount` _function_ (optional). Lifecycle hook.
  - `mounted` _function_ (optional). Lifecycle hook.
  - `beforeRender` _function_ (optional). Lifecycle hook.
  - `render` _function_ (optional). Lifecycle hook.
  - `beforeUpdate` _function_ (optional). Lifecycle hook.
  - `updated` _function_ (optional). Lifecycle hook.
  - `beforeDestroy` _function_ (optional). Lifecycle hook.
  - `destroyed` _function_ (optional). Lifecycle hook.

### A draw line component

Let's make a component that draws a red line across its entire display area:

```js
picasso.component('drawLine', {
  render() {
    return [
      {
        type: 'line',
        stroke: 'red',
        strokeWidth: 4,
        x1: this.rect.x,
        y1: this.rect.y,
        x2: this.rect.width,
        y2: this.rect.height,
      },
    ];
  },
});
```

It can then be used like any other component:

```js
picasso.chart({
  element,
  settings: {
    components: [
      {
        type: 'drawLine',
      },
    ],
  },
});
```

## Visibility of a component

It is possible to get the visibility of a component when it is mounted/unmounted. This can be done in the following example.

Assume a custom component of type foo:

```js
const foo = {
  type: 'foo',
  key: 'myComponent',
};

const chart = picasso.chart({
  element,
  settings: {
    components: [foo],
  },
});

chart.component('myComponent').isVisible(); // returns a boolean determining if the component is visible or not
```

## Component lifecycle hooks

**TODO**

(Note that the lifecycle hooks in the component definition **do not** share the same context as hooks used in the component settings of a chart).
