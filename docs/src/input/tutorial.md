---
title: Tutorial
id: tutorial
---

## Overview

In this tutorial we will introduce some of the basic concepts in picasso.js by creating a bubble chart:

<iframe width="100%" height="400" src="//jsfiddle.net/nqo2dsrs/5/embedded/result,js/" allowpaymentrequest allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## How to follow along

The easiest way to follow along is to start with this [jsfiddle stub](https://jsfiddle.net/nqo2dsrs/1/). It contains the basic setup of HTML, CSS and and some data, and allows us to focus only on the JavaScript.

The result of each step is also embedded so that you can tweak each example.

## Instantiating a chart

In order to instantiate a chart, we need three things:

- An `HTMLElement` to place the chart in
- A simple data set
- Settings that define the visual components and data encodings

```js
picasso.chart({
  element: document.querySelector('#container'),
  data: [{
    type: 'matrix',
    data: [
      ['Year', 'Month', 'Sales', 'Margin'],
      ['2010', 'Jan', 1106, 7],
      ['2010', 'Feb', 5444, 53],
      ['2010', 'Mar', 147, 64],
      ['2010', 'Apr', 7499, 47],
      ['2010', 'May', 430, 62],
      ['2010', 'June', 9735, 13],
      ['2010', 'July', 7435, 15],
      ['2011', 'Jan', 1482, 45],
      ['2011', 'Feb', 2659, 76],
      ['2011', 'Mar', 1261, 73],
      ['2011', 'Apr', 3085, 56],
      ['2011', 'May', 3035, 91],
      ['2011', 'June', 7691, 88],
      ['2011', 'July', 3012, 81],
      ['2012', 'Jan', 7980, 61],
      ['2012', 'Feb', 2564, 22],
      ['2012', 'Mar', 7957, 98],
      ['2012', 'Apr', 5809, 1],
      ['2012', 'May', 429, 2],
      ['2012', 'June', 6757, 77],
      ['2012', 'July', 9415, 92]
    ]
  }],
  settings: {
    scales: {},
    components: []
  }
})
```

The target `element` needs to have a `width` and `height` defined, the chart will adapt itself to its size.

We define a `matrix` data set - a 2D-array containing the fields _Year_, _Month_, _Sales_ and _Margin_.

## Scales

Scales are essential in picasso.js as they are the key to mapping data to visual properties - they can be used to encode almost any visual property; position, size, color, stroke, opacity, shape etc.

Scales are defined as an object map where the key represents the scale's id:

```js
scales: {
  s: {
    data: {
      field: 'Sales'
    }
  },
  m: {
    data: {
      field: 'Margin'
    }
  }
}
```

Here we define scales _s_ and _m_ which take their data from the fields _Sales_ and _Margin_ respectively.

Which `type` of scale is created is usually detected automatically based on the meta information of the provided field(s) - if the field only constains strings, it will be a _band_ scale, otherwise a _linear_ scale is created by default.

[More on scales](/docs/scales.html)

## Components

Components are the visual parts of the chart, this is where we add axis, legends, grid-lines etc.

Which component to use is specified by its `type`, and each `type` usually has its own custom settings based on its purpose.

[More on components](/docs/components.html)

### Adding axes

Let's add an _x_ and _y_ axis:

```js
components: [{
  type: 'axis',
  scale: 's',
  layout: {
    dock: 'left'
  }
}, {
  type: 'axis',
  scale: 'm',
  layout: {
    dock: 'bottom'
  }
}]
```

An `axis` requires a `scale` value which references one of the `scales` defined earlier.

In addition, the axes are docked to the `left` and `bottom` respectively.

<iframe width="100%" height="400" src="//jsfiddle.net/nqo2dsrs/2/embedded/result,js/" allowpaymentrequest allowfullscreen="allowfullscreen" frameborder="0"></iframe>

[More on axis](/docs/component-axis.html)

[More on dock layout](/docs/dock-layout.html)

### Adding points

Now let's add the `point` component:

```js
components: [{
  type: 'point',
  data: {
    extract: {
      field: 'Month',
      props: {
        y: { field: 'Sales' },
        mar: { field: 'Margin' }
      }
    }
  }
}]
```

We want to use this component to draw a bubble for each row in the previously provided data set, and we want to map _Margin_ to the _x_ position while _Sales_ is mapped to _y_.

To do this, we first define a `data` object where we extract the _Month_ value for each row, and define that _Sales_ and _Margin_ should be mapped to the arbitrary properties `y` and `mar` for each data item.

Next we define the visual properties for this component through its `settings` object:

```js
components: [{
  type: 'point',
  data: { ... },
  settings: {
    x: { scale: 'm', ref: 'mar' },
    y: { scale: 's' },
    size: () => Math.random(),
    opacity: 0.8
  }
}]
```

There are three ways to define the value for a visual property:

- An object containing a reference to a `scale` and an extracted data value

  For the `x` position we use `m` as scale and reference the `mar` property in the extracted item. In cases when the visual property has the same name as the data property there is no need to set an explicit `ref`, as is the case with `y`.
- A function, which is executed once per data item

  The `size` of each bubble will be randomized between 0-1
- A constant

  The `opacity` for all bubbles is set to `0.8`

Most of the numerical properties in picasso are relative and defined as a value between 0-1, the primary reason for this is to ensure responsiveness as the chart is resized.

<iframe width="100%" height="400" src="//jsfiddle.net/nqo2dsrs/3/embedded/result,js/" allowpaymentrequest allowfullscreen="allowfullscreen" frameborder="0"></iframe>

[More on the point component](/docs/component-point.html)

[More on data](/docs/data.html)

### Coloring

Adding coloring based on data works very much the same way as the other encodings seen so far.

Let's first extract the _Year_ values to create a color scale:

```js
scales: {
  col: {
    data: { extract: { field: 'Year' } },
    type: 'color'
  }
}
```

Then attach a `fill` property to the data items in the `point` component:

```js
props: {
  fill: { field: 'Year' }
}
```

Define which scale to use for the `fill` property of the bubbles:

```js
settings: {
  fill: { scale: 'col' }
}
```

And finally add a legend component in order to see the _Year_ each color represents:

```js
components: [{
  type: 'legend-cat',
  scale: 'col',
  layout: {
    dock: 'top'
  }
}]
```

<iframe width="100%" height="400" src="//jsfiddle.net/nqo2dsrs/4/embedded/result,js/" allowpaymentrequest allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## Brushing and linking

_Brushing and linking_ is an old concept in interactive visualizations which, in its most basic form, allows a user to highlight data points in one chart, and automatically see linked and/or associated data points in another.

To enable brushing for a component we add a `brush` definition:

```js
components: [{
  type: 'point',
  brush: {
    trigger: [{
      contexts: ['highlight'],
      on: 'tap',
      action: 'toggle',
      data: ['fill']
    }],
    consume: [{
      context: 'highlight',
      style: {
        inactive: {
          opacity: 0.4
        }
      }
    }]
  },
  settings: {...},
  data: {...}
}]
```

`trigger`s define the type of interaction that modifies the brushed data values, while `consume` defines how to style the affected data points.

Since the `point` component contains data from multiple fields, we use the `data` property to limit what to brush on. So whenever we click on a bubble, whatever field was used to populate the `'fill'` property will also be the one we brush on.

Multiple brushes can be triggered and consumed, which ones is identified by providing the name of the `context` to use.

We can add almost the same definition to the legend:

```js
components: [{
  type: 'legend-cat',
  brush: {
    trigger: [{
      contexts: ['highlight'],
      on: 'tap',
      action: 'toggle'
    }],
    consume: [{
      context: 'highlight',
      style: {
        inactive: {
          opacity: 0.4
        }
      }
    }]
  }
}]
```

The only difference here is the missing `data` limitation, which is not needed since the legend only contains data from the _Year_ field.

Now clicking in either the legend or on the bubbles will highlight the brushed _Year_ in the legend, and the bubbles associated with the brushed _Year_.

<iframe width="100%" height="400" src="//jsfiddle.net/nqo2dsrs/5/embedded/result,js/" allowpaymentrequest allowfullscreen="allowfullscreen" frameborder="0"></iframe>

[More on brushing](/docs/brushing.html)

## What's next?

- You can continue fiddling with this example by e.g:
  - Replacing `fill` with a `stroke` and `strokeWidth`
  - Set the `shape` to something else than `'circle'`
  - Change which field to color by
    - by changing the `col` scale to use `'Month'` instead of `'Year'`
    - and `fill: { field: 'Month' }` to `fill: { field: 'Year' }`
- Play around with more [examples](/examples.html)
