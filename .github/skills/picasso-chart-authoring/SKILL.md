---
name: picasso-chart-authoring
description: 'Build, extend, debug, or refactor picasso.js visualizations. Use when creating scatter, bubble, bar, line, area, pie, box, gantt, legend, axis, brushing, interaction, custom component, or QIX hypercube charts in picasso. Useful for turning requirements into chart definitions, choosing components and scales, wiring matrix or q data, adding brushing, and tracing relevant picasso source files.'
argument-hint: 'Describe the chart type, available fields, dataset shape, and any interaction or brushing requirements.'
user-invocable: true
---

# Picasso Chart Authoring

Use this skill when working in picasso.js or when generating picasso chart definitions from prose requirements.

## What This Skill Covers

- Translating chart requirements into `picasso.chart` definitions.
- Choosing the right dataset shape, extraction config, scales, components, and layout.
- Building common chart types with reusable patterns.
- Adding brushing, native interactions, Hammer gestures, and Q plugin integration.
- Debugging where a chart definition maps into the picasso.js source tree.

## Working Model

Picasso is a declarative chart system built from:

1. Data sources, usually `matrix` or `q`.
2. Data extraction that shapes component input.
3. Scales that map data domains to positions, size, or color.
4. Components that render marks, axes, legends, and selection tools.
5. Layout docking that positions components around the center plot area.
6. Interactions and brushes that make charts reactive.

When authoring a chart, work in that order. Avoid starting from component styling before the data extraction and scales are correct.

## Default Procedure

1. Identify the chart goal.
   Capture the mark type, dimensional fields, measure fields, color encoding, and whether the chart needs brushing or linked selections.
2. Choose the dataset type.
   Use `matrix` for arrays, arrays of objects, or CSV-like data. Use `q` when the input is a QIX hypercube.
3. Shape component data.
   Prefer `data.extract` so the extracted structure mirrors the visual output. Use `props`, `reduce`, `trackBy`, `sort`, `filter`, and `stack` instead of pushing logic into component settings.
4. Define scales early.
   Add positional scales first, then size or color scales. Let type deduction work when it is obvious; set `type` explicitly when it is not.
5. Add layout scaffolding.
   Axes, legends, and range tools usually need `layout.dock`. Start with left and bottom axes for Cartesian charts.
6. Add the main component.
   Use `point`, `line`, `box`, `pie`, `labels`, and related components based on the visual form.
7. Add interaction only after the static chart is correct.
   Use `brush.trigger` and `brush.consume` for selection behavior. Use `interactions` for native or Hammer events.
8. Validate against the source and examples.
   Cross-check the generated config with the built-in examples and the implementation entry points in the references below.

## Decision Guide

- Use `point` for scatter, bubble, distribution, and many heatmap-like dot views.
- Use `box` for bars, box plots, candlesticks, gantt-like bars, and range boxes.
- Use `line` for line and area charts where the order along a major axis matters.
- Use `pie` only when angle is the primary encoding and the category count is modest.
- Use `axis` with discrete or continuous scales; use `brush-range` or `brush-area-dir` for continuous selection.
- Use `legend-cat` for categorical color scales and `legend-seq` for continuous color ramps.
- Use a custom component when the desired mark cannot be expressed cleanly with built-ins.

## References

- [Quickstart](./references/quickstart.md)
- [Chart Workflow](./references/chart-workflow.md)
- [Components And Scales](./references/components-and-scales.md)
- [Interaction And Brushing](./references/interaction-and-brushing.md)
- [Chart Recipes](./references/chart-recipes.md)
- [Debugging Playbook](./references/debugging-playbook.md)
- [Source Map](./references/source-map.md)

## Starter Assets

- [Scatter Plot Template](./assets/scatter-plot.js)
- [Bar Chart Template](./assets/bar-chart.js)
- [Line Chart Template](./assets/line-chart.js)
- [Stacked Area Template](./assets/stacked-area.js)
- [Gantt Template](./assets/gantt-chart.js)
- [Pie Template](./assets/pie-chart.js)
- [Linked Brushing Template](./assets/linked-brushing.js)
- [Custom Component Template](./assets/custom-component.js)
- [Q Hypercube Template](./assets/q-hypercube.js)
- [Debug Harness](./assets/debug-harness.js)

## Companion Agent

- [Picasso Chart Author Agent](../../agents/picasso-chart-author.agent.md)

## Custom Component API

When writing a custom component, component-level config is exposed as `this.settings.settings`, not `this.settings`. `this.settings` is the normalized internal object picasso wraps around the component definition; the raw user-supplied `settings` key lives one level deeper.

```js
// WRONG — this.settings is picasso's internal wrapper object
const { myOption } = this.settings;

// CORRECT — user settings from the chart config are here
const { myOption } = this.settings.settings;
```

All other context accessors on `this` are top-level: `this.rect`, `this.data`, `this.chart`, `this.scale`, `this.formatter`.

## Valid SVG Render Node Types

`render()` must return an array of plain objects with a `type` property. Valid types are:

- `rect` — `x`, `y`, `width`, `height`, `fill`, `stroke`, `strokeWidth`, `rx`, `ry`, `opacity`
- `circle` — `cx`, `cy`, `r`, `fill`, `stroke`, `strokeWidth`, `opacity`
- `text` — `x`, `y`, `text`, `fill`, `fontSize`, `fontFamily`, `textAnchor`, `dominantBaseline`
- `line` — `x1`, `y1`, `x2`, `y2`, `stroke`, `strokeWidth`
- `path` — `d`, `fill`, `stroke`, `strokeWidth`, `opacity`

> **Warning**: `polygon` is not a valid node type and causes a runtime crash. Use `path` instead, building the `d` attribute from the vertex list.

```js
// Converts an array of {x, y} points to an SVG path d string
const pointsToPath = (points, close = true) => {
  if (!points || !points.length) return '';
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  return close ? `${d} Z` : d;
};

// Used in render:
{ type: 'path', d: pointsToPath([{x:0,y:0},{x:100,y:0},{x:50,y:80}]), fill: '#4477aa' }
```

## Color Values and Text Alignment

Picasso passes color values through brushing, scales, and themes as either a plain CSS string or an object `{ color: '#hex' }`. Always normalize before placing in a render node:

```js
const resolveColor = (value, fallback) => {
  if (typeof value === 'string' && value.trim()) return value;
  if (value && typeof value.color === 'string') return value.color;
  return fallback;
};

// Usage in render:
fill: resolveColor(datum.fill, '#4477aa')
```

For text nodes, use `textAnchor` (SVG attribute, values `start` | `middle` | `end`), not `textAlign` (a CSS property that picasso's renderer ignores for SVG text nodes).

```js
{ type: 'text', text: 'Label', x: 50, y: 20, textAnchor: 'middle', dominantBaseline: 'middle' }
```

## Authoring Rules

- Prefer minimal chart definitions that are easy to extend.
- Reuse extracted props and named scales instead of duplicating inline scale config.
- Keep lifecycle hooks as function methods, not arrow functions, when `this` needs the chart instance.
- For custom components, keep rendering pure and move setup and teardown into lifecycle hooks.
- For brushing, define the trigger context name once and reuse it consistently across consuming components.
- If the task involves the picasso codebase itself, inspect the relevant source files before suggesting internal API behavior.

## Expected Output Shape

When using this skill to answer a request, produce:

1. A chart definition or targeted patch.
2. A brief rationale for the chosen data extraction, scales, and components.
3. Any follow-up notes about brushing, plugins, or lifecycle hooks when relevant.