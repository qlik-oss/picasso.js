// Debug harness for picasso charts
// Use this to inspect extracted data, scale output, and brush state
// without building a full chart definition first.

const __debugCharts = [];

function trackDebugChart(chart) {
  __debugCharts.push(chart);
  return chart;
}

function destroyDebugChart(chart) {
  if (!chart || typeof chart.destroy !== 'function') {
    return;
  }
  chart.destroy();
  const idx = __debugCharts.indexOf(chart);
  if (idx !== -1) {
    __debugCharts.splice(idx, 1);
  }
}

function destroyAllDebugCharts() {
  while (__debugCharts.length) {
    const c = __debugCharts.pop();
    if (c && typeof c.destroy === 'function') {
      c.destroy();
    }
  }
}

// 1. Log extracted data items from a matrix dataset
function logExtract(data, extractConfig) {
  const chart = picasso.chart({
    element: Object.assign(document.createElement('div'), {
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: 400,
        height: 300,
      }),
    }),
    data: [{ type: 'matrix', key: 'debug', data }],
    settings: {
      components: [
        {
          type: 'point',
          data: { extract: extractConfig },
          settings: { x: () => 0, y: () => 0 },
          mounted() {
            console.group('[picasso debug] extracted items');
            console.table(
              this.data.items.map((item) => {
                const row = { value: item.value, label: item.label };
                Object.keys(item).forEach((k) => {
                  if (k !== 'value' && k !== 'label' && item[k] && item[k].value !== undefined) {
                    row[k] = item[k].value;
                  }
                });
                return row;
              })
            );
            console.groupEnd();
          },
        },
      ],
    },
  });

  return trackDebugChart(chart);
}

// 2. Log scale domain, range, and bandwidth after chart creation
function logScale(chartInstance, scaleName) {
  const s = chartInstance.scale(scaleName);
  if (!s) {
    console.warn(`[picasso debug] scale '${scaleName}' not found`);
    return;
  }
  console.group(`[picasso debug] scale '${scaleName}'`);
  console.log('domain    :', typeof s.domain === 'function' ? s.domain() : '(no domain)');
  console.log('range     :', typeof s.range === 'function' ? s.range() : '(no range)');
  console.log('bandwidth :', typeof s.bandwidth === 'function' ? s.bandwidth() : 'n/a (not band)');
  console.groupEnd();
}

// 3. Log active brush context values
function logBrush(chartInstance, contextName) {
  const b = chartInstance.brush(contextName);
  if (!b) {
    console.warn(`[picasso debug] brush context '${contextName}' not found`);
    return;
  }
  console.group(`[picasso debug] brush '${contextName}'`);
  console.log('brushes:', typeof b.brushes === 'function' ? b.brushes() : b);
  console.groupEnd();
}

// 4. Log helper-generated QIX selection calls for a given brush
function logQSelectionFromBrush(chartInstance, picassoQPlugin, contextName, options, layout) {
  const b = chartInstance && chartInstance.brush && chartInstance.brush(contextName);
  if (!b) {
    console.warn(`[picasso debug] brush context '${contextName}' not found`);
    return [];
  }

  const generated = picassoQPlugin.selections(b, options || {}, layout);
  console.group(`[picasso debug] qix selections from brush '${contextName}'`);
  console.table(
    generated.map((s) => ({
      method: s.method,
      params: JSON.stringify(s.params),
    }))
  );
  console.groupEnd();
  return generated;
}

// 5. Log explicit QIX call payload shape before sending selections.select
function logQixCall(method, params) {
  console.group('[picasso debug] explicit qix call');
  console.log('method:', method);
  console.log('params:', params);
  console.groupEnd();
  return { method, params };
}

// 6. Resolve a stable mark identity before issuing a selection call
function logMarkResolution(label, resolved) {
  console.group('[picasso debug] mark resolution');
  console.log('label:', label);
  console.log('resolved:', resolved);
  console.groupEnd();
  return resolved;
}

// 7. Log all visible components and their rects
function logLayout(chartInstance) {
  console.group('[picasso debug] component layout');
  // chart.components() returns internal layouted components
  const comps = typeof chartInstance.components === 'function' ? chartInstance.components() : [];
  comps.forEach((c) => {
    console.log(c.key || c.type, 'visible:', c.isVisible && c.isVisible(), 'rect:', c.rect);
  });
  console.groupEnd();
}

// ---- Drop-in usage ----
//
// Inspect extraction before wiring scales:
//   logExtract(myData, {
//     field: 'Product',
//     props: { x: { field: 'Sales' }, y: { field: 'Margin' } },
//   });
//
// After chart creation, inspect scales:
//   const chart = picasso.chart({ ... });
//   logScale(chart, 'x');
//   logScale(chart, 'y');
//
// After a user interaction, inspect brush state:
//   logBrush(chart, 'selection');
//
// Check which components rendered and where:
//   logLayout(chart);
//
// Inspect plugin-q helper conversion for a selection brush:
//   logQSelectionFromBrush(chart, picassoQ, 'selection');
//
// Log explicit QIX call payload shape:
//   logQixCall('selectHyperCubeValues', ['/qHyperCubeDef', 0, [4], true]);
//
// Log how a click resolved to a stable identity before selection:
//   logMarkResolution('clicked mark', { field: 'qHyperCube/qDimensionInfo/0', value: 4 });
//
// Cleanup:
//   destroyDebugChart(chart);
//   destroyAllDebugCharts();
