[![Build status](https://circleci.com/gh/qlik-trial/picasso.js.svg?style=shield&circle-token=b2d43b9cac73c7cad1637e2c2e435d7786b3ae8f)](https://circleci.com/gh/qlik-trial/picasso.js)
[![Test Coverage](https://codeclimate.com/repos/59a6c382541122029c0011ce/badges/1283e4d0c3b6981599f2/coverage.svg)](https://codeclimate.com/repos/59a6c382541122029c0011ce/coverage)

![picasso.js](docs/assets/picassojs.png)

A charting library streamlined for building visualizations for the Qlik Sense Analytics platform.

## Getting started

### Installing

```sh
npm install picasso.js
```

### Usage

```js
import picasso from 'picasso.js';

picasso.chart({
  element: document.querySelector('#container'),
  settings: {
    scales: {
      budget: { max: 5000, min: 0 },
      sales: { max: 11000, min: 3000, invert: true }
    },
    components: [
      {
        type: 'axis',
        scale: 'budget',
        dock: 'bottom'
      },
      {
        type: 'axis',
        scale: 'sales',
        dock: 'left'
      },
      {
        type: 'point',
        data: [
          {sales: 7456, margin: 0.3, budget: 4557},
          {sales: 5603, margin: 0.7, budget: 2234},
          {sales: 8603, margin: 0.6, budget: 4121},
          {sales: 4562, margin: 0.4, budget: 1234},
          {sales: 9873, margin: 0.9, budget: 3453},
        ],
        settings: {
          x: { scale: 'budget', fn() { return this.scale(this.data.value.budget); } },
          y: { scale: 'sales', fn() { return this.scale(this.data.value.sales); } },
          size() { return this.data.value.margin; },
        }
      }
    ]
  }
});
```

![Bubbles](website/static/img/bubbles.png)

* See more [examples](./examples/).

## Contributing

Please follow the instructions in our [contributing guide](./.github/CONTRIBUTING.md).
