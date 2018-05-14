---
title: Data
---

Data in picasso.js generally flows from top to bottom: one or more data sources of various types are provided to a chart instance; each component can then use those data sources or parts of them.

## Providing data to a chart instance

```js
picasso.chart({
  data: [{
    key: 'table 1',
    type: 'matrix',
    data: [/* */]
  }, {
    key: 'table2',
    type: 'matrix',
    data: [/* */]
  }]
});
```

The `key` is an identifier for the provided data sets and is used when specifying which set to use later on.

The `type` refers to one of the registered data parsers and ultimately decides how to interpret the provided data.

The default `type` is `'matrix'`, which can handle a few different common formats:

**2d array:**

A 2d array where the first row is assumed to contain the field values:

```js
type: 'matrix',
data: [
  ['Year', 'Sales'],
  ['2015', 56],
  ['2016', 49]
]
```

**Object array:**

An array of objects:

```js
type: 'matrix',
data: [
  { year: '2015', sales: 56 },
  { year: '2016', sales: 49 }
]
```

**DSV:**

A string of delimiter-separated values:

```js
type: 'matrix',
data: 'year,sales\n2015,56\n2016,49'
```

The delimiter is automatically detected if any of `,` (comma), `\t` (tab) or `;` (semicolon).

### Configuration

The provided data can be further configured to provide additional info about the fields and to properly parse values into numbers, dates and other types:

```js
type: 'matrix',
data: [
  { year: '2015', sales: 56 },
  { year: '2016', sales: 49 }
],
config: {
  parse: {
    delimiter: ':', // specify delimiter for dsv string
    fields(flds) { // provide more info about fields
      return [{
        key: 'year',
        title: 'Year'
      }, {
        key: 'sales',
        title: 'Sales',
        formatter: {
          type: 'd3-number',
          pattern: '$.2f'
        }
      }, {
        key: 'rand',
        title: 'Some random values'
      }]
    },
    row(d, i, flds) { // parse rows of data
      return {
        year: new Date(+d.year, 0, 1),
        sales: d.sales,
        rand: Math.random()
      };
    }
  }
}
```

## Providing data to components

You can provide data to a component in a few different ways, depending on how you want to visualize it. To ensure as little manipulation as possible of the data in the actual component, you should always strive to create a data structure that as closely as possible resembles the visual output of the component.

### Manual input

The simplest way to provide data to a component is an array of values:

```js
// input
data: [1, 2, 3]

// or
data: {
  items: [{ num: 1, text: 'one' }, { num: 2, text: 'two' }, { num: 3, text: 'three' }],
  value: v => v.num,
  label: v => v.text
}
```

The data input is then normalized to ensure that the structure consumed by a component is always the same, regardless of input. So both of the above configurations will result in the following output:

```js
data: {
  items: [{ value: 1, label: 'one' }, { value: 2, label: 'two' }, { value: 3, label: 'three' }]
}
```

### Extracting data from datasets

Assuming we have the following dataset input:

```js
picasso.chart({
  data: [{
    key: 'Products',
    type: 'matrix',
    data: [
      ['Product', 'Year', 'Sales', 'Margin'],
      [{ name: 'Boots', group: 'Shoes' }, 2015, 45, 0.23],
      [{ name: 'Sneakers', group: 'Shoes' }, 2016, 49, 0.21],
      [{ name: 'Sandals', group: 'Shoes' }, 2017, 42, 0.25],
      [{ name: 'White socks', group: 'Socks' }, 2016, 14, 0.42],
      [{ name: 'Blue socks', group: 'Socks' }, 2017, 15, 0.41]
    ]
  }]
});
```

and want to create a scatter plot where each bubble represents a _Product group_, and _Sales_ and _Margin_ are mapped to a bubble's `x` and `y` properties. Since there are only two product groups we want to **extract** those data points, aggregate the values for _Sales_ and _Margin_, and ignore the fields we are not interested in (_Year_).

How to extract data points and what the resulting data output looks like is determined by each dataset `type`. For the `matrix` type, we can do the following:

```js
data: {
  extract: [{
    source: 'Products',
    field: 'Product',
    trackBy: v => v.group, // collect products based on the 'group' property
    reduce: values => values[0].group, // use the group property as value for the group
    props: { // each property config is attached as a property to the main item
      x: { field: 'Sales', reduce: 'sum' },
      y: { field: 'Margin', reduce: 'avg' }
    }
  }]
}
```

which would result in the following data struct:

```js
data: {
  items: [
    {
      value: 'Shoes', label: 'Shoes', source: { key: 'Products', field: 'Product' },
      x: { value: 136, label: '136', source: { key: 'Products', field: 'Sales' } },
      y: { value: 0.23, label: '0.23', source: { key: 'Products', field: 'Margin' } }
    },
    {
      value: 'Socks', label: 'Socks', source: { key: 'Products', field: 'Product' },
      x: { value: 29, label: '29', source: { key: 'Products', field: 'Sales' } },
      y: { value: 0.415, label: '0.415', source: { key: 'Products', field: 'Margin' } }
    }
  ],
  fields: [{/* a 'field' instance */}]
}
```

> Notice that the data `source` for each value is stored in the output; this plays a key part in enabling _brushing_.

### Filtering

A `filter` function can be used to exclude certain values in the data source:

```js
data: {
  extract: [{
    source: 'Products',
    field: 'Product',
    filter: d => d.name !== 'Sandals' // exclude 'Sandals'
  }]
}
```

### Sorting

A `sort` function can be used to sort the _extracted_ data items:

```js
data: {
  extract: [{
    source: 'Products',
    field: 'Product',
  }],
  sort: (a, b) => a.label > b.label ? -1 : 1 // sort descending
}
```

### Stacking

Extracted items can be stacked using a `stack` configuration:

```js
data: {
  extract: [{
    source: 'Products',
    field: 'Product',
    value: d => d.name,
    label: d => `<${d.name}>`
    props: {
      year: { field: 'Year' }
      num: { field: 'Sales' }
    }
  }],
  stack: {
    stackKey: d =>  d.year.value, // stack by year
    value: d => d.num.value // stack using the num value for each product
  }
}

// output
[
  {
    value: 'Boots', label: '<Boots>', source: {}
    year: { value: 2015, source: {} },
    num: { value: 45, source: {} },
    start: { value: 0, source: {} },
    end: { value: 45, source: {} },
  },
  {
    value: 'Sneakers', label: '<Sneakers>', source: {}
    year: { value: 2016, source: {} },
    num: { value: 49, source: {} },
    start: { value: 0, source: {} },
    end: { value: 49, source: {} },
  },
  {
    value: 'Sandals', label: '<Sandals>', source: {}
    year: { value: 2017, source: {} },
    num: { value: 42, source: {} },
    start: { value: 0, source: {} },
    end: { value: 42, source: {} },
  },
  {
    value: 'White socks', label: '<White socks>', source: {}
    year: { value: 2016, source: {} },
    num: { value: 14, source: {} },
    start: { value: 49, source: {} },
    end: { value: 63, source: {} },
  },
  {
    value: 'Blue socks', label: '<Blue socks>', source: {}
    year: { value: 2015, source: {} },
    num: { value: 15, source: {} },
    start: { value: 42, source: {} },
    end: { value: 67, source: {} },
  }
]
```

## Mapping extracted data to visual properties

Once a component has been provided with some data, it can be used to encode the visual properties of a component. Which properties depends on the component, but usually most of them support setting the position, size, color, shape, stroke etc.

There are three ways to define the value for a visual property:

- A constant
- A function, which is executed once per data item
- An object containing a reference to a `scale`, a `ref`erence to an extracted data value, and an optional callback function `fn`

### Using the extracted data

Assuming a `data` extraction configuration of:

```js
extract: {
  field: 'Product',
  props: {
    x: { field: 'Sales' }
  }
}
```

the following definitions in a components settings will all result in the same `x` value:

```js
{
  x: { ref: "x" } // reference the 'x' value in the mapped data
  x: { fn: d => d.datum.x.value }, // the mapped data can be accessed through 'd.datum'
  x: d => d.datum.x.value
}
```

### Scale usage

If a reference to a `scale` is defined, the mapped data value will go through the scale, returning a new value.

Assuming a scale 'linX' is defined as:

```js
scales: {
  linX: { data: { field: "Sales" }, expand: 0.2 }
}
```

the following definitions will all result in the same `x` value:

```js
{
  x: { ref: "x", scale: "linX" }, // automatically sends value 'x' through the scale and returns the scaled value
  x: { scale: "linX", fn: d => d.scale(d.datum.x.value) } // the referenced 'scale' is accessible through 'd.scale'
}
```

### More expressiveness

Since all mapped data is accessible in property callbacks, the values can be used for more expressive representation of properties:

```js
{
  fill: {
    scale: "linX",
    fn: d => (b.scale.max() >= d.datum.x.value ? "red" : "grey") // color the maximum value red
  }
}
```

### Example

```js
components: [{
  type: "point",
  data: {
    extract: {
      field: "Products",
      props: {
        size: { field: "margin" }
      }
    },
  },
  settings: {
    x: 0.2, // constant, places all points at the same position along the x-axis
    y: () => Math.random(), // function is called for each product
    fill: 'red', // constant
    size: {
      scale: 's', // reference to a scale 's', data property 'size' is used automatically
    },
    shape: (d, i) => ["rect", "circle", "star"][i % 3]
  }
}]
```
