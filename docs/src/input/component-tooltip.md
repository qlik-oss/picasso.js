---
title: Tooltip
---

A component that renders a tooltip.

## Events

The tooltip component is a reactive component that depend on events to render something.

### `show` event

The event takes two parameters, the first is the pointer event and the second is an optional object which may contain specific nodes to use when rendering the tooltip. If the second parameter is omitted, the pointer event will be used to perform a node lookup on the chart instance.

With a single event parameter:
```js
picassoInstance.component('<key value of tooltip>').emit('show', event);
```

With optional parameters:
```js
const nodes = picassoInstance.shapesAt({ x: 1, y: 2, width: 3, height: 4}); // An array of nodes
picassoInstance.component('<key value of tooltip>').emit('show', event, {
  nodes,
  delay: 50, // Optional, the component setting value is used as default
  duration: 2000 // Optional, the component setting value is used as default
}); // The event is dispatched and if no new events are triggered until the delay has passed, a tooltip is displayed
```

### `hide` event

Hide the tooltip. Will hide the tooltip if it's currently is displayed, if not the event is ignored.

```js
picassoInstance.component('<key value of tooltip>').emit('hide');
```

## Extracting data and generating custom content

As the main purpose of a tooltip often is to displayed additonal data when hovering or selecting a node, controlling which data to displayed is crucial.

Luckily there are two settings available to ensure that correct data is displayed in the tooltip.

### Extracting data

The `extract` setting is function that is executed for each node and is expected to return a data representation. By default the extracted data is a string with the value of the node. But could be any data structure, such as an object or an array of objects.

#### Default

```js
const extract = ({ node }) => node.data.value;
```

### Generating content

The `content setting` is a function responsible for generating virtual nodes using the HyperScript API. The output is used for the content area of the tooltip.

#### Default

```js
const content = ({ h, data }) => data.map(datum => h('div', {}, datum));
```

### Example - Formatting values

Here we format the value using a formatter and return the output as extracted data.
```js
const extract = ({ node, resources }) => resources.formatter('<name-of-a-formatter>')(node.data.value);
```

But sometimes we want to give the value some context, for example by labeling it. As such we change the data structure to an  object instead to make it more clear what the data represent. As we do, the default `content` generator function will complain because it doesn't understand our new data structure, so we must also update the `content` setting.
```js
const extract = ({ node, resources }) => ({
  label: node.data.label,
  value: resources.formatter('<name-of-a-formatter>')(node.data.value)
});

// We go from a basic content generator
let content = ({ h, data }) => data.map(datum => h('div', {}, datum))
// To one that understand our new data structure
content = ({ h, data }) => data.map(datum => h('div', {}, `${datum.label}: ${datum.value}`))
```

## Placement strategy

### Example - As a string

```js
{
  placement: 'pointer'
}
```

### Example - As an object

```js
{
  placement: {
    type: 'pointer',
    dock: 'top',
    offset: 8,
    area: 'target'
  }
}
```

### Example - As a function

```js
{
  placement: () => ({
    type: 'pointer',
    dock: 'top',
    offset: 8,
    area: 'target'
  })
}
```

### Example - Custom placement function

```js
{
  placement: {
    fn: () => ({
      computedTooltipStyle: {
        left: '10px',
        top: '20px',
        color: 'red'
      },
      computedArrowStyle: {
        left: '0px',
        top: '0px',
        color: 'red'
      },
      dock: 'top'
    })
  }
}
```

## API Reference

{{>struct definitions.component--tooltip}}
