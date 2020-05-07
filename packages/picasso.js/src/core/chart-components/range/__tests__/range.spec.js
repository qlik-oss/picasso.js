import component from '../range';

describe('range component', () => {
  let chart;
  let renderer;
  let context;
  let settings;
  let brush;
  let scale;
  let listeners;
  beforeEach(() => {
    chart = {
      brush: sinon.stub(),
      scale: sinon.stub(),
    };

    renderer = {
      render: sinon.stub(),
    };

    settings = {};

    context = {
      chart,
      renderer,
      settings: {
        settings,
      },
      rect: {
        width: 50,
        height: 200,
        x: 0,
        y: 0,
      },
      state: {},
    };

    listeners = {
      start: [],
      end: [],
      update: [],
    };

    brush = {
      on: (type, handler) => listeners[type].push(handler),
      removeListener: (type, handler) => listeners[type].splice(listeners[type].indexOf(handler), 1),
      isActive: sinon.stub(),
      brushes: sinon.stub(),
    };

    scale = (s) => s / 100; // assume scale has domain [0, 100]
    scale.data = () => ({
      fields: [
        {
          id: () => 'sales',
        },
      ],
    });

    chart.brush.returns(brush);
    chart.scale.returns(scale);
  });

  it('should render empty when brush is not active', () => {
    const shapes = component.render.call(context);
    expect(shapes).to.eql([]);
  });

  describe('active ranges', () => {
    beforeEach(() => {
      brush.isActive.returns(true);
      brush.brushes.returns([
        {
          id: 'sales',
          type: 'range',
          brush: {
            ranges: () => [
              { min: 30, max: 40 },
              { min: 60, max: 100 },
            ],
          },
        },
      ]);
    });

    it('should render along vertical direction', () => {
      settings.direction = 'vertical';
      const shapes = component.render.call(context);
      expect(
        shapes.map((s) => ({
          width: s.width,
          height: s.height,
          x: s.x,
          y: s.y,
        }))
      ).to.eql([
        {
          height: 20,
          width: 50,
          x: 0,
          y: 60,
        },
        {
          height: 80,
          width: 50,
          x: 0,
          y: 120,
        },
      ]);
    });

    it('should render along horizontal direction', () => {
      const shapes = component.render.call(context);
      expect(
        shapes.map((s) => ({
          width: s.width,
          height: s.height,
          x: s.x,
          y: s.y,
        }))
      ).to.eql([
        {
          height: 200,
          width: 5,
          x: 15,
          y: 0,
        },
        {
          height: 200,
          width: 20,
          x: 30,
          y: 0,
        },
      ]);
    });

    it('should have a default fill of "#ccc"', () => {
      const shapes = component.render.call(context);
      expect(
        shapes.map((s) => ({
          fill: s.fill,
        }))
      ).to.eql([{ fill: '#ccc' }, { fill: '#ccc' }]);
    });

    it('should have a fill of "#f00"', () => {
      settings.fill = '#f00';
      const shapes = component.render.call(context);
      expect(
        shapes.map((s) => ({
          fill: s.fill,
        }))
      ).to.eql([{ fill: '#f00' }, { fill: '#f00' }]);
    });

    it('should have a default opacity of 1', () => {
      const shapes = component.render.call(context);
      expect(
        shapes.map((s) => ({
          opacity: s.opacity,
        }))
      ).to.eql([{ opacity: 1 }, { opacity: 1 }]);
    });

    it('should have an opacity of 0.2', () => {
      settings.opacity = 0.2;
      const shapes = component.render.call(context);
      expect(
        shapes.map((s) => ({
          opacity: s.opacity,
        }))
      ).to.eql([{ opacity: 0.2 }, { opacity: 0.2 }]);
    });
  });

  describe('life', () => {
    const shapes = [
      {
        type: 'rect',
        fill: '#ccc',
        opacity: 1,
        height: 200,
        width: 5,
        x: 15,
        y: 0,
      },
      {
        type: 'rect',
        fill: '#ccc',
        opacity: 1,
        height: 200,
        width: 20,
        x: 30,
        y: 0,
      },
    ];
    beforeEach(() => {
      brush.isActive.returns(true);
      brush.brushes.returns([
        {
          id: 'sales',
          type: 'range',
          brush: {
            ranges: () => [
              { min: 30, max: 40 },
              { min: 60, max: 100 },
            ],
          },
        },
      ]);
    });
    it('should attach event handlers on brush start, update and end', () => {
      component.render.call(context);
      expect(listeners.start.length).to.equal(1);
      expect(listeners.update.length).to.equal(1);
      expect(listeners.end.length).to.equal(1);
    });

    it('should remove event handlers ondestroy', () => {
      component.render.call(context);
      component.beforeDestroy.call(context);
      expect(listeners.start.length).to.equal(0);
      expect(listeners.update.length).to.equal(0);
      expect(listeners.end.length).to.equal(0);
    });

    it('should render when brush "start" is triggered', () => {
      component.render.call(context);
      listeners.start[0]();
      expect(renderer.render).to.have.been.calledWith(shapes);
    });

    it('should render when brush "update" is triggered', () => {
      component.render.call(context);
      listeners.update[0]();
      expect(renderer.render).to.have.been.calledWith(shapes);
    });

    it('should render when brush "end" is triggered', () => {
      component.render.call(context);
      listeners.end[0]();
      expect(renderer.render).to.have.been.calledWith(shapes);
    });
  });
});
