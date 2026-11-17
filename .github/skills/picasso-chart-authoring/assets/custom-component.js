// Custom picasso component template
// Key API facts:
// 1. Settings from chart config are at this.settings.settings (not this.settings directly)
// 2. Built-in cross-renderer node types include rect, circle, text, line, path, image
// 3. Color values must be resolved to CSS strings before use in nodes
// 4. Use SVG attribute names such as text-anchor (not textAlign) for alignment

const resolveColor = (value, fallback) => {
  if (typeof value === 'string' && value.trim()) return value;
  if (value && typeof value.color === 'string') return value.color;
  return fallback;
};

const pointsToPath = (points, close = true) => {
  if (!points || !points.length) return '';
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  return close ? `${d} Z` : d;
};

picasso.component('my-custom-component', {
  render() {
    // Access settings from this.settings.settings, NOT this.settings
    const { options } = this.settings.settings;
    const rect = this.rect || { x: 0, y: 0, width: 0, height: 0 };
    const color = resolveColor(options && options.color, '#4477aa');

    return [
      // path — use instead of polygon for filled shapes
      {
        type: 'path',
        d: pointsToPath([
          { x: rect.x, y: rect.y },
          { x: rect.x + rect.width, y: rect.y },
          { x: rect.x + rect.width / 2, y: rect.y + rect.height },
        ]),
        fill: color,
        stroke: color,
        'stroke-width': 1,
        opacity: 0.3,
      },
      // line
      {
        type: 'line',
        x1: rect.x,
        y1: rect.y,
        x2: rect.x + rect.width,
        y2: rect.y + rect.height,
        stroke: color,
        'stroke-width': 2,
      },
      // circle
      {
        type: 'circle',
        cx: rect.x + rect.width / 2,
        cy: rect.y + rect.height / 2,
        r: 5,
        fill: color,
      },
      // text — use the SVG text-anchor attribute, not textAlign
      {
        type: 'text',
        text: 'Label',
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
        fill: '#404b5a',
        'font-size': '12px',
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
      },
    ];
  },
});

picasso.chart({
  element: document.querySelector('#container'),
  settings: {
    components: [
      {
        type: 'my-custom-component',
        settings: {
          // User settings are accessed as this.settings.settings inside render()
          options: { color: '#4477aa' },
        },
      },
    ],
  },
});
