---
title: q
---

The `q` plugin registers a `q` dataset type that makes it a bit easier to extract data from a QIX hypercube. It also contains a brush helper that can be used to find appropriate selections in the underlying data engine.

## Installation

```sh
npm install picasso-plugin-q
```

### Register plugin

```js
import picasso from 'picasso.js';
import picassoQ from 'picasso-plugin-q';

picasso.use(picassoQ); // register
```

## `q` dataset

This dataset type understands the QIX hypercube format and its internals, making it a bit easier to traverse and extract values from an otherwise complex structure.

### Usage

```js
const ds = picasso.data('q')({
  key: 'qHyperCube', // path to the hypercube from the layout
  data: layout.qHyperCube,
  config: {
    /* ... */
  },
});
```

Dimensions, measures, attribute expressions and attribute dimensions are all recognized as fields and can be found using either the path or the title of the field:

```js
const f = ds.field('Sales');
const ff = ds.field('qDimensionInfo/1/qAttrDimInfo/2');
```

#### Config

The `config` object allows for further configuration:

- `config`: `<object>`
  - `localeInfo`: <[LocaleInfo]> - App locale info used for formatting.
  - `virtualFields`: `<Array<object>>` - Convenience config to alias fields. _Experimental_.
    - `key`: `<string>` - Identifier for the field.
    - `from`: `<string>` - Source field identifier.
    - `override`: `<object>` - Override accessor inherited from source field.
      - `value`: `<function>` - Value accessor.
      - `label`: `<function>` - Label accessor.

```js
const ds = picasso.data('q')({
  key: 'qHyperCube',
  data: layout.qHyperCube,
  config: {
    virtualFields: [
      {
        key: 'surpriseMe',
        from: 'qMeasureInfo/0',
        override: {
          value: v => v.qValue * Math.random(),
        },
      },
    ],
  },
});

ds.field('surpriseMe').items(); // -> array of random numbers multiplied with the value from first measure
```

### Extracting data values

Assuming we have a hypercube containing dimensions _Year_ and _Month_, a measure _Sales_ and an attribute expression on the first dimension containing color values:

```js
// hypercube stub
{
  qDimensionInfo: [
    { qFallbackTitle: 'Year', qAttrDimInfo: [{ qFallbackTitle: 'color' }, /* ... */], /* ... */ },
    { qFallbackTitle: 'Month', /* ... */  }
  ],
  qMeasureInfo: [
    { qFallbackTitle: '# products', /* ... */  }
  ]
}
```

In a _straight_ hypercube the `qMatrix` might look like this:

```js
[
  [
    { "qText": "2011", "qNum": 2011, "qElemNumber": 0, "qState": "O", "qAttrExps": { "qValues": [{"qText": "red", "qNum": "NaN" }] } },
    { "qText": "Jan", "qNum": 1, "qElemNumber": 0, "qState": "S",  "qAttrDims": { "qValues": [{ "qText": "Jan", "qElemNo": 0 }] } },
    { "qText": "61", "qNum": 61, "qElemNumber": 0, "qState": "L" }
  ],
  [
    { "qText": "2011", "qNum": 2011, "qElemNumber": 0, "qState": "O", "qAttrExps": { "qValues": [{"qText": "blue", "qNum": "NaN" }] } },
    { "qText": "Feb", "qNum": 2, "qElemNumber": 1, "qState": "S", "qAttrDims": { "qValues": [{"qText": "Feb", "qElemNo": 1 }] } },
    { "qText": "62", "qNum": 62, "qElemNumber": 0, "qState": "L" }
  ],
  [
    { "qText": "2012","qNum": 2012, "qElemNumber": 1, "qState": "O", "qAttrExps": { "qValues": [{"qText": "red", "qNum": "NaN" }] } },
    { "qText": "Jan", "qNum": 1, "qElemNumber": 0, "qState": "S", "qAttrDims": { "qValues": [{"qText": "Jan", "qElemNo": 0}] } },
    { "qText": "88", "qNum": 88, "qElemNumber": 0, "qState": "L" }
  ],
  [
    { "qText": "2012", "qNum": 2012, "qElemNumber": 1, "qState": "O", "qAttrExps": { "qValues": [{"qText": "blue", "qNum": "NaN" }] } },
    { "qText": "Feb", "qNum": 2, "qElemNumber": 1, "qState": "S", "qAttrDims": { "qValues": [{"qText": "Feb","qElemNo": 1}] } },
    { "qText": "76", "qNum": 76, "qElemNumber": 0, "qState": "L" }
  ]
```

We can extract the unique _Month_ values using:

```js
ds.extract({
  field: 'Month',
  trackBy: v => v.qElemNumber,
});

// output
[
  { value: 0, label: 'Jan', source: { key: 'qHyperCube', field: 'qDimensionInfo/1' } },
  { value: 1, label: 'Feb', source: { key: 'qHyperCube', field: 'qDimensionInfo/1' } },
];
```

and attach aggregated properties on each item using `props`:

```js
ds.extract({
  field: 'Month',
  trackBy: v => v.qElemNumber
  props: {
    years: { field: 'Year', value: v => v.qText, reduce: values => values.join(' - ') },
    color: { field: 'color', value: v => v.qText },
    products: { field: '# products', reduce: 'sum' }
  }
});

// output
[
  {
    value: 0, label: 'Jan', source: { key: 'qHyperCube', field: 'qDimensionInfo/1' },
    years: { value: '2011 - 2012', source: { key: 'qHyperCube', field: 'qDimensionInfo/0' } }
    color: { value: 'red', source: { key: 'qHyperCube', field: 'qDimensionInfo/0/qAttrExprInfo/0' } }
    products: { value: 149, source: { key: 'qHyperCube', field: 'qMeasureInfo/0' } }
  },
  {
    value: 1, label: 'Feb', source: { key: 'qHyperCube', field: 'qDimensionInfo/1' },
    years: { value: '2011 - 2012', source: { key: 'qHyperCube', field: 'qDimensionInfo/0' } }
    color: { value: 'blue', source: { key: 'qHyperCube', field: 'qDimensionInfo/0/qAttrExprInfo/0' } }
    products: { value: 138, source: { key: 'qHyperCube', field: 'qMeasureInfo/0' } }
  }
]
```

The default `value` accessor for a field depends on the field type and the `qMode`property of the hypercube:

- For measures and attribute expressions: `cell => cell.qNum` or `cell => cell.qValue`
- For dimensions and attribute dimensions: `cell => cell.qElemNumber` or `cell => cell.qElemNo`

The default `reduce` function is `avg` for measures and `first` for dimensions.

## QIX selections helper

The QIX selections helper provides a mapping from brushed data points to suitable QIX selections.

### By dimension value

Brushing dimension values is done by adding the value of `qElemNumber` to the brush, and providing the path to the relevant dimension:

```js
const b = chart.brush('selection');
b.addValue('qHyperCube/qDimensionInfo/2', 4);
b.addValue('qHyperCube/qDimensionInfo/2', 7);
```

Calling `picassoQ.selections` with the above instance generates relevant QIX methods and parameters to apply a selection to:

```js
const selection = picassoQ.selections(b)[0];
// {
//   method: 'selectHyperCubeValues',
//   params: [
//     '/qHyperCubeDef', // path to hypercube to apply selection to
//     2, // dimension column
//     [4, 7], // qElemNumbers
//     false
//   ]
// }
```

The selection can then be applied to a QIX model:

```js
model[selection.method](...selection.params);
```

### By measure range

Brushing measure ranges:

```js
const b = chart.brush('selection');
b.addRange('qHyperCube/qMeasureInfo/2', { min: 13, max: 35 });

const selection = picassoQ.selections(b)[0];
// {
//   method: 'rangeSelectHyperCubeValues',
//   params: ['/qHyperCubeDef', [
//     {
//       qMeasureIx: 2,
//       qRange: { qMin: 13, qMax: 35, qMinIncEq: true, qMaxInclEq: true }
//     }
//   ]]
// }
```

### By dimension range

Brushing dimension ranges:

```js
const b = chart.brush('selection');
b.addRange('qHyperCube/qDimensionInfo/1', { min: 13, max: 35 });

const selection = picassoQ.selections(b)[0];
// {
//   method: 'selectHyperCubeContinuousRange',
//   params: ['/qHyperCubeDef', [
//     {
//       qDimIx: 1,
//       qRange: { qMin: 13, qMax: 35, qMinIncEq: true, qMaxInclEq: false }
//     }
//   ]]
// }
```

### By row indices

Brushing by table row index and column:

```js
const b = chart.brush('selection');
b.addValue('qHyperCube/qDimensionInfo/1', 10);
b.addValue('qHyperCube/qDimensionInfo/1', 13);
b.addValue('qHyperCube/qDimensionInfo/0', 11);
b.addValue('qHyperCube/qDimensionInfo/0', 17);
```

In the above case, rows `10` and `13` have been brushed on dimension `1`, and rows `11` and `17` on dimension `0`.
To extract the relevant information, `byCells` is enabled:

```js
const selection = picassoQ.selections(b, { byCells: true })[0];
// {
//   method: 'selectHyperCubeCells',
//   params: [
//     '/qHyperCubeDef',
//     [10, 13], // row indices in hypercube
//     [1, 0] // column indices in hypercube
//   ]
// }
```

Row indices are used from the first dimension that adds a value to a brush, `qDimensionInfo/1`, in the case above.
To use values from another dimension, `primarySource` should be set:

```js
const selection = picassoQ.selections(b, {
  byCells: true,
  primarySource: 'qHyperCube/qDimensionInfo/0',
})[0];
// {
//   method: 'selectHyperCubeCells',
//   params: [
//     '/qHyperCubeDef',
//     [11, 17], // row indices in hypercube
//     [1, 0] // column indices in hypercube
//   ]
// }
```

It is also possible to get a selectPivotCells call by providing the layout:

```js
const selection = picassoQ.selections(b, { byCells: true }, layout)[0];
// {
//   method: 'selectPivotCells',
//   params: [
//     '/qHyperCubeDef',
//     [{qType: 'L', qCol: 1, qRow: 10}, {qType: 'L', qCol: 1, qRow: 13}], // Array of NxSelectionCell for pivot data
//
//   ]
// }
```

### By attribute dimension

Brush on attribute dimension values:

```js
const b = chart.brush('selection');
b.addValue('qHyperCube/qDimensionInfo/2/qAttrDimInfo/3', 6);
b.addValue('qHyperCube/qDimensionInfo/2/qAttrDimInfo/3', 9);

const selection = picassoQ.selections(b)[0];
// {
//   method: 'selectHyperCubeValues',
//   params: [
//     '/qHyperCubeDef/qDimensions/2/qAttributeDimensions/3', // path to hypercube to apply selection to
//     0, // dimension column in attribute dimension table
//     [6, 9], // qElemNumbers
//     false
//   ]
// }
```

### By attribute expression range

Brush on attribute expression range:

```js
const b = chart.brush('selection');
b.addRange('qHyperCube/qMeasureInfo/1/qAttrExprInfo/2', { min: 11, max: 21 });
```

QIX selections on attribute expressions are similar to selections on measure ranges. In this case however, the index of the measure
is derived from the number of measures and attribute expressions that exist in the hypercube. Therefore, to calculate
the index, `layout` containing the hypercube needs to be provided as a parameter:

```js
const selection = picassoQ.selections(b, {}, layout)[0];
// {
//   method: 'rangeSelectHyperCubeValues',
//   params: ['/qHyperCubeDef', [
//     {
//       qMeasureIx: 7,
//       qRange: { qMin: 11, qMax: 21, qMinIncEq: true, qMaxInclEq: true }
//     }
//   ]]
// }
```

Assuming a `layout` of:

```js
{
  qHyperCube: {
    qDimensionInfo: [
      { qAttrExprInfo: [{}] }
    ],
    qMeasureInfo: [
      { qAttrExprInfo: [{}, {}] },
      { qAttrExprInfo: [{}, {}, {/* this is the one */ }] }
    ]
  }
}
```

then `qMeasureIx` is calculated as follows:

- number of measures: `2`
- total number of attribute expressions in all dimensions: `1`
- total number of attribute expressions in measures preceding the one specified: `2` (from first measure)
- the actual index of the specified attribute expression: `2`

which results in `2 + 1 + 2 + 2 = 7`

## Formatting

The `q` plugin comes bundled with a [formatter](formatters.md) attached the to data `field`. To use it, no configuration other then using the [q-dataset](plugin-q.md#q-dataset) is required.

[localeinfo]: https://core.qlik.com/services/qix-engine/apis/qix/definitions/#localeinfo
[object]: https://core.qlik.com/services/qix-engine/apis/qix/definitions/#localeinfo
[string]: https://core.qlik.com/services/qix-engine/apis/qix/definitions/#localeinfo
[function]: https://core.qlik.com/services/qix-engine/apis/qix/definitions/#localeinfo
