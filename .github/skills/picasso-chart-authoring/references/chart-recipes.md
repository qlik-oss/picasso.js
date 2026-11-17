# Chart Recipes

Use this reference when the request is short and ambiguous, such as "build a bubble chart from sales and margin by product".

## Input Contract

Before generating code, derive these fields from the request:

1. Chart type intent: scatter, bubble, bar, line, area, pie, box, gantt, or linked views.
2. Dataset type: `matrix` or `q`.
3. Dimension fields: category or grouping fields.
4. Measure fields: numeric fields for position, size, color, or range.
5. Interaction needs: hover, tap, brushing, linked selection, pan, or zoom.
6. Output target: full chart definition, component snippet, or patch.

If any required field is missing, infer defaults conservatively and call out the assumption.

## Recipe: Scatter Or Bubble

When asked for scatter, bubble, distribution, or "x vs y" plots:

- Component: `point`
- Scales: `x` and `y` as linear, optional `size`, optional color scale
- Data shape: extract one dimension and map numeric props
- Layout: left axis plus bottom axis

Starter asset:

- `./assets/scatter-plot.js`

## Recipe: Bar, Ranked Bars, Or Horizontal Bars

When asked for bars, ranked categories, or value comparison by category:

- Component: `box`
- Scales: one band scale for category, one linear scale for value
- Data shape: extract category with `start: 0`, `end: measure`
- Layout: axis pair with readable category labels

Starter asset:

- `./assets/bar-chart.js`

## Recipe: Line Or Area Trend

When asked for trend over time, progression, or time series:

- Component: `line`
- Scales: ordered major scale for time/order plus linear minor scale
- Data shape: extract major field with value prop for measure
- Layers: configure `line`, optional `area`, optional `curve`

Starter assets:

- `./assets/line-chart.js`
- `./assets/stacked-area.js`

## Recipe: Stacked Area

When asked for composition over time:

- Component: `line` with area layer
- Data shape: extract series field and stack by major axis value
- Scales: major axis for sequence/time, minor axis for totals, categorical color for series

Starter asset:

- `./assets/stacked-area.js`

## Recipe: Gantt Or Interval Bars

When asked for task duration, start and end windows, or schedule bars:

- Component: `box`
- Data shape: extract task with `start` and `end`
- Scales: band for task, linear for timeline
- Interaction: optional brushing to highlight selected tasks

Starter asset:

- `./assets/gantt-chart.js`

## Recipe: Pie Or Donut

When asked for part-to-whole with few categories:

- Component: `pie`
- Data shape: extract category plus aggregated numeric prop
- Scale: categorical color
- Layout: optional `legend-cat` docked right

Starter asset:

- `./assets/pie-chart.js`

## Recipe: Linked Selection Across Charts

When asked for coordinated views or linked highlighting:

- Build both charts first with independent scales and components
- Add trigger context on source chart
- Add consume context on target chart
- Link brush instances via `chartA.brush(...).link(chartB.brush(...))`

Starter asset:

- `./assets/linked-brushing.js`

## Recipe: QIX Hypercube Input

When the dataset is a hypercube or the task includes QIX selections:

- Register plugin with `picasso.use(picassoQ)`
- Use `type: 'q'` dataset
- Use dimension paths or fallback titles for field references
- Map brushed values to QIX selections via `picassoQ.selections(...)`
- Use q field paths such as `qHyperCube/qDimensionInfo/0` as selection keys for value brushing
- If helper conversion becomes brittle in a specific flow, prefer explicit QIX calls through `selections.select`
- Keep ordering explicit: resolve clicked mark, apply selection call, then update transient visuals

Starter asset:

- `./assets/q-hypercube.js`

## Recipe: Custom Mark Or Overlay

When built-in components cannot render the required geometry:

- Register a custom component with `picasso.component(name, definition)`
- Keep drawing logic in `render`
- Use lifecycle hooks for setup and teardown if needed

Starter asset:

- `./assets/custom-component.js`

## Response Template For The Agent

Use this output structure in responses:

1. Assumptions: dataset type, dimensions, measures, interactions.
2. Proposed chart model: extraction, scales, components, layout.
3. Concrete output: full config or patch.
4. Optional extension: brushing, linked charts, plugin integration.

## Quality Checklist

Before returning code:

1. Every scale reference exists.
2. Every `ref` points to an extracted prop.
3. Component type matches extracted data shape.
4. Axis docking and label settings are sane for the data density.
5. Brushing contexts are named consistently across trigger and consume.
