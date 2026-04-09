# Source Map

Use these paths when the task involves debugging internals or aligning generated configs with the implementation.

## Public Entry Points

- `packages/picasso.js/src/index.js`: main factory, registries, `picasso.chart`, and plugin registration.
- `packages/picasso.js/src/api/`: public API surface for components, renderers, and scales.

## Chart Runtime

- `packages/picasso.js/src/core/chart/`: chart instance creation, update lifecycle, and runtime orchestration.
- `packages/picasso.js/src/core/chart/scales/`: scale registry and chart scale integration.
- `packages/picasso.js/src/core/layout/dock/`: docking and layout behavior.

## Registries And Internals

- `packages/picasso.js/src/core/component/`: component factory and lifecycle wiring.
- `packages/picasso.js/src/core/data/`: dataset parsing and extraction pipeline.
- `packages/picasso.js/src/core/brush/`: brush instances and linking behavior.
- `packages/picasso.js/src/core/interaction/`: interaction runtime.
- `packages/picasso.js/src/core/theme/`: default style and palettes.

## Built-In Components

- `packages/picasso.js/src/core/chart-components/`: built-in component implementations such as `axis`, `point`, `line`, `box`, and legends.

## Plugins

- `plugins/q/src/`: QIX dataset and selection helper implementation.
- `plugins/hammer/src/`: Hammer interaction plugin.

## Working Examples

- `examples/scatterplot/index.js`: minimal matrix-backed point chart.
- `examples/q-scatterplot/index.js`: Q plugin chart example.
- `examples/hammer/index.js`: interaction and custom behavior example.

## Documentation Cross-Check

- `../qlik-dev/src/content/articles/extend/create-viz-picasso/get-started/`: quick onboarding docs.
- `../qlik-dev/src/content/articles/extend/create-viz-picasso/main-concepts/`: chart, data, scales, layout, interaction, brushing, formatting.
- `../qlik-dev/src/content/articles/extend/create-viz-picasso/components/`: component-specific docs.
- `../qlik-dev/src/content/articles/extend/create-viz-picasso/plugins/`: Hammer and Q plugin docs.

When a user asks how picasso behaves internally, inspect the runtime file for that subsystem instead of relying on the docs alone.
