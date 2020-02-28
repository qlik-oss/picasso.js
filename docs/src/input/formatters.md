---
title: Formatting
---

The Formatting API allows formatters to be bound in two ways, either implicitly from the data field or expliciltly by referencing a formatter in a component.

> Note: Whether formatting is applied or not is up to each component.

## Using the built in formatter

picasso comes bundled with the [d3-format](https://github.com/d3/d3-format) and [d3-time-format](https://github.com/d3/d3-time-format) module. To use them in a component simple create a new formatter object in the chart `settings` and reference the formatter in the component definition:

```js
settings: {
  formatters: {
    myFormatter: {
      formatter: 'd3'
      type: 'number', // number or time
      format: '0.1%'
    },
    anotherFormatter: {
      type: 'd3-number', // This declaration is equal to the one above
      format: '0.1%'
    }
  },
  components: [
    {
      type: 'some component',
      formatter: 'myFormatter'
    }
  ]
}
```

## Register a new formatter

Create and register a new formatter module. The module must be a function that takes a single argument and return another function, the returned function must also take a single argument and return a formatted value.

```js
function formatter(format = '$') {
  return value => `${value}${format}`;
}

picasso.formatter('appendToken', formatter);
```

...it's then available for consumption in the chart.

```js
picasso.chart({
  settings: {
    formatters: {
      myFormatter: {
        type: 'appendToken', // Reference the new formatter module
        format: '$$$' // Input parameter to formatter function
      }
    },
    components: [
      {
        type: 'axis',
        formatter: 'myFormatter',
        ...
      }
    ]
  }
})
```

## Creating a formatter from data

The following configuration will use the formatter defined on the _Sales_ `field` instance.

```js
{
  myFormatter: {
    data: {
      fields: ['Sales'];
    }
  }
}
```
