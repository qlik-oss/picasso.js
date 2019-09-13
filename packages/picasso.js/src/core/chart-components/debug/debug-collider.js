const debugColliderDef = {
  require: ['renderer', 'chart'],
  defaultSettings: {
    settings: {
      target: '',
      selector: '*',
      fill: 'rgba(0, 255, 0, 0.1)',
      stroke: 'lime',
      opacity: 1,
      useOuterRect: false
    }
  },
  on: {
    update() {
      this.draw();
    }
  },
  draw() {
    const shapes = this.chart.findShapes(this.props.selector).filter((s) => s.key === this.props.target); // Find all shapes
    const colliders = shapes.filter((s) => s.collider).map((s) => s.collider);

    colliders.forEach((c) => {
      c.fill = this.props.fill;
      c.stroke = this.props.stroke;
      c.opacity = this.props.opacity;
      c.collider = { type: null };
    });

    this.renderer.render(colliders);
  },
  created() {
    this.props = this.settings.settings;
  },
  resize({ outer, inner }) {
    if (this.props.useOuterRect) {
      return outer;
    }
    return inner;
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

export default debugColliderDef;
