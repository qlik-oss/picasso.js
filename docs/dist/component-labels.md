---
title: Labels
---

A component that renders labels based on the visual output of other components.

Since this component depends on other referenced components, it is important that the `displayOrder` of this component is set to a larger value than all of the referenced components.

## Strategies

### `bars`

A strategy used primarily for labeling the rectangles in a bar chart, histogram, waterfall or similar.

This strategy is based on the direction of a bar (`'up'`, `'down'`, `'right'`, `'left'`), which is used to find three possible positions for a label: `'inside'`, `'outside'`, `'opposite'`. Which position fits best for any given label depends on the measured size of the label, and the boundaries of the different positions.

![Bar labeling strategy](/img/bar-labels.png)

In the image above, the order of label placements is `['inside', 'outside', 'opposite'`], that is, the label is placed inside the bar if it fits, then outside and finally on the opposite side of the bar's direction. If the entire label doesn't fit in any of those places, it is placed inside the largest rectangle of the three.
The label is then justified, aligned and ellipsed if necessary.

#### Example

```js
components: [
  {
    type: 'box',
    key: 'bars',
    displayOrder: 1,
    /* ... */
  },
  {
    type: 'labels',
    displayOrder: 2 // must be larger than the displayOrder for the 'bars' component
    settings: {
      sources: [{
        component: 'bars',
        selector: 'rect', // select all 'rect' shapes from the 'bars' component
        strategy: {
          type: 'bar', // the strategy type
          settings: {
            direction: function({ data }) { // data argument is the data bound to the shape in the referenced component
              return data && data.end.value > data.start.value ? 'up' : 'down'
            },
            fontFamily: 'Helvetica',
            fontSize: 14,
            align: 0.5,
            justify: 1,
            labels: [{
              label({ data }) {
                return data ? data.end.label : '';
              },
              placements: [ // label placements in prio order. Label will be placed in the first place it fits into
                { position: 'inside', fill: '#fff' },
                { position: 'outside', fill: '#666' }
              ]
            }]
          }
        }
      }]
    }
  }
]
```

## API Reference

### Settings

```js
settings: {
  sources: [{ // components to use as input to a labeling strategy
    component: 'bar', // component key
    selector: 'rect', // component shape selector
    strategy: { /* strategy */ }, 
  }],
}
```

### Labels settings

```js
{
  type: 'labels', // Optional
  settings: { 
    sources: [ 
      { 
        component: /* string */,
        selector: /* string */,
        strategy: /* #/definitions/component--labels/definitions/label-strategy */,
      },
    ],
  },
}
```

**Definitions**

```js
label-strategy: { 
  settings: { 
    direction: 'up',  // Optional
    fontFamily: 'Arial', // Optional
    fontSize: 12, // Optional
    labels: [ 
      { 
        label: /* string | function */, 
        placements: [ 
          { 
            position: /* string */, // 'inside' | 'outside' | 'opposite'
            justify: 0, // Placement of the label along the direction of the bar // Optional
            align: 0.5, // Placement of the label along the perpendicular direction of the bar // Optional
            fill: '#333', // Color of the label // Optional
          },
        ],
      },
    ],
  },
},
```

#### Bar strategy

```js
{
  settings: { 
    direction: 'up',  // Optional
    fontFamily: 'Arial', // Optional
    fontSize: 12, // Optional
    labels: [ 
      { 
        label: /* string | function */, 
        placements: [ 
          { 
            position: /* string */, // 'inside' | 'outside' | 'opposite'
            justify: 0, // Placement of the label along the direction of the bar // Optional
            align: 0.5, // Placement of the label along the perpendicular direction of the bar // Optional
            fill: '#333', // Color of the label // Optional
          },
        ],
      },
    ],
  },
}
```

