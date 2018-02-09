---
title: Grid
---


![Grid line component](/img/grid-line-comp.png)

## Basic grid

The grid as a component is easy to set up. To get started, the following will suffice:

```js
{
  type: 'grid-line',
  x: {
    scale: 'x'
  },
  y: {
    scale: 'y'
  }
}
```

As long as you specify the same scales for the `axis` and `grid-line` components, the ticks and minorTicks will be synced with the axis.

This will work fine for a scatter plot or other chart with two linear scales.
You do not have to specify both the X and Y axis in case you are drawing a box plot or distribution chart.

## Ticks configuration example

```js
{
  type: 'grid-line',
  x: {
    scale: 'x'
  },
  y: {
    scale: 'y'
  },
  ticks: {
    show: true,
    stroke: 'red',
    strokeWidth: 5,
  },
  minorTicks: {
    show: false,
    stroke: 'blue',
    strokeWidth: 1
  }
}
```

In this example, we are using both X and Y scales. We are showing major ticks as a red, 5px line. The settings for minor ticks are a blue, 1px line.
However, since the minor ticks have the variable *show* set to false, they will not be rendered. They may still be rendered on the axis if you have enabled them there.

## API Reference

{{>struct definitions.component--grid-line-settings name='settings'}}
