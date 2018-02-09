---
title: Reference lines
---

A component that renders reference line(s) according to configuration

## Component settings

```js
{
  style: {  // Optional
    // x coordinate
    oob: {  // Optional
      // Style for out of bounds object (oob)
      show: true, // Show out of bounds items // Optional
      type: /* string */, // EXPERIMENTAL:  Set this to 'arc' for an experimental out of bounds shape (only works with SVG) // Optional
      width: 10, // Width of the out of bounds object // Optional
      fill: '#1A1A1A', // Fill color of the OOB object // Optional
      stroke: 'transparent', // Stroke of the OOB object // Optional
      strokeWidth: 0, // Stroke width of the OOB object // Optional
      opacity: 1, // Opacity of the OOB object // Optional
      text: 'refline-generic-text', // Text configuration for out of bounds // Optional
      triangle: 'refline-generic-object', // The triangle in OOB // Optional
      padding: {  // Optional
        // Padding on X
        x: 28, // Padding on X // Optional
        y: 5, // Padding on X // Optional
      },
    },
    line: 'refline-line', // Generic style for lines // Optional
    label: 'refline-line-label', // Generic style for labels // Optional
  },
  lines: { 
    // X & Y Lines
    x: [  // Optional
      : /* reflines-x */,
    ],
    y: [  // Optional
      : /* reflines-y */,
    ],
  },
  generic-text: { 
    text: '', // Text (if applicable) // Optional
    fontSize: '12px', // Font size (if applicable) // Optional
    fontFamily: 'Arial', // Font family // Optional
    fill: '#fff', // Fill color // Optional
    stroke: 'transparent', // Stroke // Optional
    strokeWidth: 0, // Stroke width // Optional
    opacity: 1, // Opacity // Optional
  },
  line: { 
    value: /* number */, // The value of the reference line. If a scale is specified, it is applied.
    scale: /* Scale */, // Scale to use (if undefined will use normalized value 0-1) // Optional
    line: 'refline-generic-object', // The style of the line // Optional
    label: 'refline-line-label', // The label style of the line // Optional
  },
  line-label: { 
    padding: 5, // Padding inside the label
    text: '', // Text // Optional
    fontSize: '12px', // Font size // Optional
    fontFamily: 'Arial', // Font family // Optional
    stroke: 'transparent', // Stroke // Optional
    strokeWidth: 0, // Stroke width // Optional
    opacity: 1, // Opacity // Optional
    align: 0,  // Optional
    vAlign: 0,  // Optional
    maxWidth: 1, // The maximum relative width to the width of the rendering area (see maxWidthPx below aswell) // Optional
    maxWidthPx: 9999, // The maximum width in pixels. // Optional
    background: 'refline-line-label-background', // The background style (rect behind text) // Optional
  },
  line-label-background: { 
    fill: '#fff', // Fill color // Optional
    stroke: 'transparent', // Stroke // Optional
    strokeWidth: 0, // Stroke width // Optional
    opacity: 0.5, // Opacity // Optional
  },
  generic-object: { 
    fill: '#fff', // Fill color // Optional
    stroke: 'transparent', // Stroke // Optional
    strokeWidth: 0, // Stroke width // Optional
    opacity: 1, // Opacity // Optional
  },
}
```


