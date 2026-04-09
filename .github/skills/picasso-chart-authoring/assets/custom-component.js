picasso.component('drawLine', {
  render() {
    return [
      {
        type: 'line',
        stroke: 'red',
        strokeWidth: 4,
        x1: this.rect.x,
        y1: this.rect.y,
        x2: this.rect.width,
        y2: this.rect.height,
      },
    ];
  },
});

picasso.chart({
  element: document.querySelector('#container'),
  settings: {
    components: [
      {
        type: 'drawLine',
      },
    ],
  },
});
