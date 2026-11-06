# Debugging Playbook

Use this playbook when a picasso chart is blank, malformed, non-interactive, or inconsistent after updates.

## Triage Flow

1. Confirm chart lifecycle and whether rendering runs at all.
2. Confirm dataset shape and extracted props.
3. Confirm scale creation and references.
4. Confirm component layout and visibility.
5. Confirm brushing and interaction wiring.
6. Confirm plugin registration for Hammer or Q use cases.

Apply fixes in that order. Most chart issues are upstream data or scale mismatches.

## Symptom: Nothing Renders

Likely causes:

- Chart `element` is null or has no size.
- Dataset field names do not match extraction config.
- Main component references missing scales.

Checks:

1. Verify the container exists and has non-zero width and height.
2. Verify each field name used in `extract` exists in the dataset header or object keys.
3. Verify each `settings.*.scale` name exists in `settings.scales`.

Fix pattern:

```js
const el = document.querySelector('#container');
if (!el) throw new Error('Missing container');

picasso.chart({
  element: el,
  data: [{ type: 'matrix', data: [...] }],
  settings: {
    scales: {
      x: { data: { field: 'Margin' } },
      y: { data: { field: 'Sales' } },
    },
    components: [
      { type: 'axis', scale: 'x', layout: { dock: 'bottom' } },
      { type: 'axis', scale: 'y', layout: { dock: 'left' } },
      {
        type: 'point',
        data: { extract: { field: 'Product', props: { x: { field: 'Margin' }, y: { field: 'Sales' } } } },
        settings: { x: { scale: 'x' }, y: { scale: 'y' } },
      },
    ],
  },
});
```

## Symptom: Axis Renders But Marks Do Not

Likely causes:

- Extracted props do not match `ref` names.
- Component expects specific prop names that are missing.
- Data is filtered away by `filter` or malformed `reduce` logic.

Checks:

1. Compare extracted prop keys and component refs one by one.
2. Temporarily remove `filter`, `sort`, and `stack` to isolate extraction.
3. Ensure measure values are numeric.

Fix pattern:

- Start with a minimal extract containing only required props.
- Add transform steps incrementally.

## Symptom: Marks Render In Wrong Position

Likely causes:

- Incorrect scale type deduction.
- Missing `invert` or poor `expand` settings on linear scales.
- Major and minor scales swapped in `line` or `box`.

Checks:

1. Explicitly set `type` on uncertain scales.
2. Validate orientation and coordinate wiring.
3. Confirm major axis field order is what the chart expects.

Fix pattern:

```js
scales: {
  x: { type: 'band', data: { extract: { field: 'Month' } } },
  y: { type: 'linear', data: { field: 'Sales' }, invert: true, expand: 0.1 },
}
```

## Symptom: Labels Overlap Or Layout Looks Broken

Likely causes:

- Axis labels exceed available dock size.
- Too many docked components competing for space.
- Missing label mode settings for dense discrete axes.

Checks:

1. Set axis label mode to `auto` or `tilted` where appropriate.
2. Reduce docked components and reintroduce them gradually.
3. Tune `maxGlyphCount`, `paddingStart`, `paddingEnd`.

Fix pattern:

```js
{
  type: 'axis',
  scale: 'x',
  layout: { dock: 'bottom' },
  settings: {
    labels: { mode: 'auto', maxGlyphCount: 14 },
  },
}
```

## Symptom: Brushing Does Not Highlight

Likely causes:

- Trigger and consume contexts have different names.
- Trigger event type does not fire in the current interaction mode.
- Consumed `data` keys do not match brushed values.

Checks:

1. Ensure context names match exactly.
2. Remove `data` filtering in brush config and test broad context matching.
3. Confirm the component actually receives tap or hover events.

Fix pattern:

```js
brush: {
  trigger: [{ on: 'tap', contexts: ['selection'] }],
  consume: [{ context: 'selection', style: { inactive: { opacity: 0.25 } } }],
}
```

## Symptom: Linked Charts Do Not Sync

Likely causes:

- Brushes are not linked at runtime.
- Linked contexts carry different data keys.

Checks:

1. Verify link call executes after both charts are created.
2. Check both charts brush comparable values from matching fields.

Fix pattern:

```js
chartA.brush('select').link(chartB.brush('highlight'));
```

## Symptom: Hammer Gestures Do Nothing

Likely causes:

- Plugin not registered.
- Hammer global is not available.
- Gesture event names do not match handlers.

Checks:

1. Confirm `picasso.use(picassoHammer)` runs before chart creation.
2. Confirm Hammer is loaded globally.
3. Confirm gesture `options.event` and handler keys are aligned.

## Symptom: Q Hypercube Field Lookup Fails

Likely causes:

- Q plugin not registered.
- Field path or title is incorrect.
- Hypercube shape differs from assumption.

Checks:

1. Confirm dataset type is `q`.
2. Verify dimension and measure fallback titles or paths in layout.
3. Test extraction on one known field before composing props.

## Symptom: Clicks Fire But QIX Selections Are Missing Or Inconsistent

Use this branch when the chart appears interactive, hover or click handlers fire, and external selections still flow into the chart, but local engine selections are missing, delayed, or unreliable.

Symptom pattern:

- Marks are rendered and pointer or tap events fire.
- The selection toolbar may appear, but selected values are not reflected.
- There are no runtime errors, or only helper or interceptor shape errors.
- External selections still affect the chart correctly.

Core diagnostics:

1. Verify click path to mark identity.
   Confirm the clicked mark maps to a stable domain value or `qElemNumber`.
2. Verify selection call shape.
   Ensure method and params match the expected QIX API signatures.
3. Verify helper output.
   If using `picasso-plugin-q` helper conversion, ensure generated calls are real selection calls rather than reset or empty-selection payloads.
4. Verify listener lifecycle.
   Ensure listeners are not duplicated, detached, or rebound incorrectly after chart updates.

Picasso event wiring guidance:

- Prefer delegated listeners on a stable container when marks are frequently recreated.
- Avoid relying on custom DOM attributes that renderers may strip.
- Derive mark identity from stable mapping logic, or from rendered order only when that order is deterministic.

Anti-pattern to avoid:

- Avoid mapping clicked marks to data exclusively by raw DOM order unless you also have a stable identity fallback.
- Prefer a stable mark identity channel such as a deterministic key mapping or encoded class token.

Plugin-q and QIX guidance:

- For plugin-q value brushing, use q field paths such as `qHyperCube/qDimensionInfo/0` as brush keys.
- If helper conversion becomes brittle in a specific flow, issue explicit QIX calls through `selections.select` rather than forcing everything through helper conversion.
- Keep selection mode lifecycle explicit.
- Begin selection mode before issuing selection commands when the host flow requires it.
- Clear transient interaction state on deactivated, cleared, canceled, or release transitions.

Interaction with stale layout:

- Do not wait for layout changes to provide click feedback.
- Maintain local transient interaction state.
- Trigger lightweight settings-only updates for visuals.
- Keep layout or data updates separate from transient visual updates to avoid selection races.

Regression triggers:

- Full chart updates on every transient interaction.
- Updating transient UI state before applying selection calls.
- Coupling helper conversion and transient rerender in one hot path without ordering guarantees.

Recommended ordering:

1. Resolve the clicked mark and target value.
2. Apply the selection call, either helper-generated or explicit QIX.
3. Update transient visuals.
4. Let confirmed or stale layout reconcile long-term state afterward.

Practical outcome:

Following this pattern improves engine selection reliability while preserving responsive local interactions in picasso-based charts.

## Runtime Inspection Checklist

Use this checklist while debugging:

1. Reduce to one component and one axis.
2. Replace dynamic functions with constants.
3. Remove optional interactions and brush config.
4. Reintroduce extraction transforms step by step.
5. Reintroduce styling and interactivity only after geometry is stable.

Debug harness tips:

1. Use extraction logs first to verify `value`, `label`, and prop shape.
2. Use brush logs to verify interaction context updates.
3. Use QIX conversion logs to inspect helper output before sending anything to the engine.
4. Always clean up temporary debug charts to avoid stale listeners and repeated-session noise.

## Source Landmarks For Deep Debugging

- `packages/picasso.js/src/core/chart/`
- `packages/picasso.js/src/core/data/`
- `packages/picasso.js/src/core/chart/scales/`
- `packages/picasso.js/src/core/brush/`
- `packages/picasso.js/src/core/interaction/`
- `packages/picasso.js/src/core/chart-components/`

When uncertain, inspect implementation before assuming undocumented behavior.
