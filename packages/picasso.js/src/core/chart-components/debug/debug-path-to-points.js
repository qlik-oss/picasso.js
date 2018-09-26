import pathToSegments from '../../scene-graph/parse-path-d';

const debugPathToPointsDef = {
  require: ['renderer', 'chart'],
  defaultSettings: {
    settings: {
      target: '',
      fill: 'transparent',
      stroke: 'lime',
      opacity: 1,
      radius: 2
    }
  },
  on: {
    update() {
      this.draw();
    }
  },
  draw() {
    const shapes = this.chart.findShapes('path').filter(s => s.key === this.props.target); // Find all shapes

    const circles = [];
    shapes.forEach((s) => {
      pathToSegments(s.attrs.d).forEach((segment) => {
        segment.forEach((p) => {
          circles.push({
            type: 'circle',
            cx: p.x,
            cy: p.y,
            r: this.props.radius,
            fill: this.props.fill,
            stroke: this.props.stroke,
            opacity: this.props.opacity,
            collider: { type: null }
          });
        });
      });
    });

    this.renderer.render(circles);
  },
  created() {
    this.props = this.settings.settings;
  },
  render() { },
  mounted() {
    this.draw();
  },
  updated() {
    this.props = this.settings.settings;
    this.draw();
  }
};

export default debugPathToPointsDef;
