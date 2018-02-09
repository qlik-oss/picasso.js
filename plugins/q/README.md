# Picasso `q`-plugin

Adds support for handling Qlik data.

# `q` formatters

`q`-style number and time formatting can be used with the `q-number` and `q-time` types.

Use with:

```js
picasso.chart({
  formatters: {
    qTimeFormatter: {
      formatter: 'q-time'
    }
  },
  component: {
    type: 'axis',
    formatter: 'qTimeFormatter'
  }
})
```


# `q` data

Qlik data from hypercubes can be used with:

```js
picasso.chart({
  data: {
    type: 'q',
    data: { /* ... */ }
  }
})
```

# `q` qBrushHelper

To simplify brushing in `q`-data, you can use the provided brush helper:

```js
import { qBrushHelper } from 'picasso-q';

picasso.chart({
  /* ... */
})

const highlightBrush = chart.brush('highlight');
const selections = qBrushHelper(highlightBrush);
```
