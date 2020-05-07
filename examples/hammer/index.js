(function () {
  (function () {
    function render(that, state, renderit) {
      var sx = that.drawing.sx;
      var sy = that.drawing.sy;
      var start = state.points[0];
      var end = state.points[1];
      var displayPoints =
        state.points.length === 2
          ? [
              {
                type: 'line',
                stroke: that.settings.settings.color,
                strokeWidth: 3,
                strokeDasharray: '4 2',
                x1: sx(start.x) * that.rect.width,
                y1: sy(start.y) * that.rect.height,
                x2: sx(end.x) * that.rect.width,
                y2: sy(end.y) * that.rect.height,
              },
            ]
          : [];

      if (renderit) {
        that.renderer.render(displayPoints);
      }
      return displayPoints;
    }

    function getPoint(e, that) {
      var x = e.center.x;
      var y = e.center.y;
      var relX = x - that.drawing.el.left;
      var relY = y - that.drawing.el.top;
      return {
        x: that.drawing.sx.invert(relX / that.rect.width),
        y: that.drawing.sy.invert(relY / that.rect.height),
      };
    }

    // register custom component
    picasso.component('draw', {
      defaultSettings: {
        settings: {
          color: '#333',
          scaleX: 'x',
          scaleY: 'y',
        },
      },
      require: ['chart', 'renderer'],
      created: function () {
        this.state = {
          points: [],
        };
      },
      beforeRender: function (opts) {
        this.rect = opts.size;
      },
      render: function () {
        this.drawing = {
          el: this.renderer.element().getBoundingClientRect(),
          sx: this.chart.scale('x'),
          sy: this.chart.scale('y'),
        };
        return render(this, this.state);
      },
      on: {
        start: function (e) {
          this.drawing.el = this.renderer.element().getBoundingClientRect();
          var p = getPoint(e, this);
          this.state.points = [p, p];
          render(this, this.state);
        },
        move: function (e) {
          this.state.points[1] = getPoint(e, this);
          render(this, this.state, true);
        },
        end: function (e) {
          this.state.points[1] = getPoint(e, this);
          render(this, this.state, true);
        },
      },
    });
  })();

  // register hammer plugin
  picasso.use(picassoHammer);

  var settings = {
    scales: {
      x: { data: { field: 'Sales' }, expand: 0.1 },
      y: { data: { field: 'Margin' }, expand: 0.1 },
    },
    components: [
      {
        type: 'axis',
        scale: 'y',
        layout: {
          dock: 'left',
        },
      },
      {
        type: 'axis',
        scale: 'x',
        layout: {
          dock: 'bottom',
        },
      },
      {
        type: 'point',
        data: {
          extract: {
            field: 'Product sub group',
            props: {
              x: { field: 'Sales' },
              y: { field: 'Margin' },
              size: { field: '# Customers' },
            },
          },
        },
        settings: {
          x: { scale: 'x' },
          y: { scale: 'y' },
          size: {
            scale: {
              data: { field: '# Customers' },
            },
          },
          fill: {
            ref: 'size',
            scale: {
              data: { field: '# Customers' },
              type: 'color',
            },
          },
        },
      },
      {
        type: 'draw',
        key: 'drawOnMe',
        settings: {
          color: 'green',
        },
      },
    ],
    interactions: [
      {
        type: 'hammer',
        key: 'hammered',
        gestures: [
          {
            type: 'Pan',
            options: {
              event: 'draw',
            },
            events: {
              drawstart: function (e) {
                var hitComp = this.chart.componentsFromPoint({ x: e.center.x, y: e.center.y }).filter(function (c) {
                  return c.settings.key === 'drawOnMe';
                })[0];
                if (!hitComp) {
                  return;
                }
                this.chart.component('drawOnMe').emit('start', e);
              },
              drawmove: function (e) {
                this.chart.component('drawOnMe').emit('move', e);
              },
              drawend: function (e) {
                this.chart.component('drawOnMe').emit('end', e);
              },
            },
          },
        ],
      },
    ],
  };

  var pic = picasso({
    renderer: {
      prio: ['canvas'],
    },
  }).chart({
    element: document.querySelector('#container'),
    data: picData.products,
    settings: settings,
  });

  window.onresize = function () {
    pic.update();
  };
})();
