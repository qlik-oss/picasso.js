# Components And Scales

Use this table to choose the main building blocks quickly.

## Core Components

| Component        | Use It For                                 | Required Or Common Inputs                                   | Notes                                                                               |
| ---------------- | ------------------------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `axis`           | Discrete or continuous axes                | `scale`, `layout.dock`                                      | Consumes scale data implicitly. Supports tilted or layered labels on discrete axes. |
| `point`          | Scatter, bubble, distributions             | Extracted items with `x`, `y`, optional `size`, `fill` refs | The fastest way to build a Cartesian chart from measures.                           |
| `line`           | Line and area charts                       | `coordinates.major`, `coordinates.minor`                    | Use `layers.area` for filled areas and `layers.curve` for smoothing.                |
| `box`            | Bars, ranges, box plot, gantt, candlestick | `major` and `minor` scales; `start` and `end` props         | Add `min`, `med`, `max` as needed.                                                  |
| `pie`            | Pie and donut charts                       | Slice value extraction and arc settings                     | Best with fewer categories.                                                         |
| `labels`         | Point, bar, or series labels               | Usually bound to parent component output                    | Add after geometry is stable.                                                       |
| `legend-cat`     | Discrete legends                           | Categorical color scale                                     | Pair with `categorical-color`.                                                      |
| `legend-seq`     | Continuous legends                         | Sequential color scale                                      | Pair with `sequential-color`.                                                       |
| `grid-line`      | Grid lines                                 | `scale`                                                     | Usually placed behind points or boxes.                                              |
| `brush-range`    | Continuous range selection                 | Brushing context plus target scale                          | Use for continuous axes instead of axis tap interactions.                           |
| `brush-lasso`    | Freeform selection                         | Brushing context and compatible marks                       | Useful for dense scatter plots.                                                     |
| `brush-area-dir` | Rectangular directional selection          | Brushing context                                            | Useful for drag selection.                                                          |
| `text`           | Static annotation                          | Manual text items or layout position                        | Good for captions or overlay notes.                                                 |

## Scale Types

| Scale               | Use It For                 | Typical Input                 |
| ------------------- | -------------------------- | ----------------------------- |
| `linear`            | Numeric position or size   | Measure field                 |
| `band`              | Discrete categories        | Dimension field               |
| `h-band`            | Hierarchical categories    | Hierarchical extracted values |
| `categorical-color` | Discrete color mapping     | Dimension field               |
| `sequential-color`  | Continuous color gradients | Numeric field                 |
| `threshold-color`   | Bucketed color ranges      | Numeric field with thresholds |

## Component Selection Rules

- If the user says bar chart, start with `box` instead of inventing rectangles manually.
- If the user says bubble or scatter, start with `point` and add size or fill afterward.
- If the user needs a plotted trend across ordered values, use `line`.
- If the user wants linked selection between charts, make sure the chosen components expose the right extracted values for brush contexts.

## Axis Notes

- Discrete axes can use `labels.mode: 'tilted'`, `labels.mode: 'layered'`, or `labels.mode: 'auto'`.
- Continuous axis selection is usually implemented with `brush-range` or `brush-area-dir`, not direct axis tapping.
- `paddingStart` and `paddingEnd` are layout tools, not data tools.

## Scale Notes

- When type deduction is ambiguous, declare `type` explicitly.
- Use named scales in `settings.scales` instead of repeating inline scale objects across many components.
- `expand` is usually the first lever for improving chart readability on continuous scales.
