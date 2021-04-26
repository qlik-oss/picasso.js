[![CircleCI](https://circleci.com/gh/qlik-oss/picasso.js.svg?style=shield)](https://circleci.com/gh/qlik-oss/picasso.js)
[![Coverage Status](https://coveralls.io/repos/github/qlik-oss/picasso.js/badge.svg)](https://coveralls.io/github/qlik-oss/picasso.js)

![picasso.js](docs/assets/picassojs.png)

A charting library streamlined for building interactive visualizations for the Qlik product suites.

[![Examples](docs/assets/examples.png)](https://picassojs.com/examples.html)

## Getting started

### Installing

```sh
npm install picasso.js
```

### Usage

```js
import picasso from 'picasso.js';

picasso.chart({
  element: document.querySelector('#container'), // container must have a width and height specified
  settings: {
    scales: {
      budget: { max: 5000, min: 0 },
      sales: { max: 11000, min: 3000, invert: true },
    },
    components: [
      {
        type: 'axis',
        scale: 'budget',
        layout: {
          dock: 'bottom',
        },
      },
      {
        type: 'axis',
        scale: 'sales',
        layout: {
          dock: 'left',
        },
      },
      {
        type: 'point',
        data: [
          { sales: 7456, margin: 0.3, budget: 4557 },
          { sales: 5603, margin: 0.7, budget: 2234 },
          { sales: 8603, margin: 0.6, budget: 4121 },
          { sales: 4562, margin: 0.4, budget: 1234 },
          { sales: 9873, margin: 0.9, budget: 3453 },
        ],
        settings: {
          x: { scale: 'budget', fn: (d) => d.scale(d.datum.value.budget) },
          y: { scale: 'sales', fn: (d) => d.scale(d.datum.value.sales) },
          size: (d) => d.datum.value.margin,
        },
      },
    ],
  },
});
```

More examples and documentation can be found at [qlik.dev](https://qlik.dev)

## Run examples locally

See and try out picasso features by starting the development studio by running:

`yarn start`

## Contributing

Please follow the instructions in our [contributing guide](./.github/CONTRIBUTING.md).
