---
title: Text
---

A component that adds a descriptive text, commonly used as axis title or chart title.

## Data and scales

No data or scales required.

## Layout

The text component will automatically adjust to the `dock` property and rotate the text to perpendicular to the docking direction.

## Interaction

No interaction is supported.

## Usage

```js
{
  type: 'text',
  text: 'My title',
  dock: 'top'
}
```

## API Reference

```js
{
  paddingStart: 5, // Optional
  paddingEnd: 5, // Optional
  paddingLeft: 0, // Optional
  paddingRight: 0, // Optional
  anchor: 'center', // Where to v- or h-align the text. Supports `left`, `right`, `top`, `bottom` and `center` // Optional
  join: ', ', // String to add when joining titles from multiple sources // Optional
  maxLengthPx: /* number */, // Limit the text length to this value in pixels // Optional
}
```

