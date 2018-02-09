(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var isTutorial = document.querySelectorAll('.tutorial-chart').length;
    if (!isTutorial) {
      return;
    }

    var instances = [];

    var data = [{
      type: 'matrix',
      data: [
        ['Year', 'Month', 'Sales', 'Margin'],
        ['2010', 'Jan', 1106, 7],
        ['2010', 'Feb', 5444, 53],
        ['2010', 'Mar', 147, 64],
        ['2010', 'Apr', 7499, 47],
        ['2010', 'May', 430, 62],
        ['2010', 'June', 9735, 13],
        ['2010', 'July', 7435, 15],
        ['2011', 'Jan', 1482, 45],
        ['2011', 'Feb', 2659, 76],
        ['2011', 'Mar', 1261, 73],
        ['2011', 'Apr', 3085, 56],
        ['2011', 'May', 3035, 91],
        ['2011', 'June', 7691, 88],
        ['2011', 'July', 3012, 81],
        ['2012', 'Jan', 7980, 61],
        ['2012', 'Feb', 2564, 22],
        ['2012', 'Mar', 7957, 98],
        ['2012', 'Apr', 5809, 1],
        ['2012', 'May', 429, 2],
        ['2012', 'June', 6757, 77],
        ['2012', 'July', 9415, 92]
      ]
    }];

    var scales = {
      s: {
        data: {
          field: 'Sales'
        },
        expand: 0.1,
        invert: true
      },
      m: {
        data: {
          field: 'Margin'
        },
        expand: 0.1
      },
      col: {
        data: { extract: { field: 'Year' } },
        type: 'color'
      }
    };

    var xAxis = function() {
      return {
        key: 'x',
        type: 'axis',
        scale: 'm',
        dock: 'bottom'
      };
    };

    var yAxis = function() {
      return {
        key: 'y',
        type: 'axis',
        scale: 's',
        dock: 'left'
      };
    };

    var legend = function(brush) {
      var ret = {
        key: 'legend',
        type: 'legend-cat',
        scale: 'col',
        dock: 'top'
      };

      if (brush) {
        ret.brush = {
          trigger: [{
            contexts: ['highlight'],
            on: 'tap',
            action: 'toggle'
          }],
          consume: [{
            context: 'highlight',
            style: {
              inactive: {
                opacity: 0.4
              }
            }
          }]
        };
      }

      return ret;
    };

    var points = function(color, brush) {
      var ret = {
        key: 'points',
        type: 'point',
        data: {
          extract: {
            field: 'Month',
            props: {
              y: { field: 'Sales' },
              mar: { field: 'Margin' }
            }
          }
        },
        settings: {
          x: { scale: 'm', ref: 'mar' },
          y: { scale: 's' },
          size: function() { return Math.random(); },
          opacity: 0.8
        }
      };

      if (color) {
        ret.data.extract.props.fill = { field: 'Year' };
        ret.settings.fill = { scale: 'col' };
      }

      if (brush) {
        ret.brush = {
          trigger: [{
            contexts: ['highlight'],
            data: ['fill'],
            on: 'tap',
            action: 'toggle'
          }],
          consume: [{
            context: 'highlight',
            style: {
              inactive: {
                opacity: 0.4
              }
            }
          }]
        };
      }

      return ret;
    };

    function addingAxis() {
      return picasso.chart({
        element: document.querySelector('#tutorial-axis'),
        data: data,
        settings: {
          scales: scales,
          components: [
            yAxis(),
            xAxis()
          ]
        }
      });
    }

    function addingPoints() {
      return picasso.chart({
        element: document.querySelector('#tutorial-points'),
        data: data,
        settings: {
          scales: scales,
          components: [
            yAxis(),
            xAxis(),
            points()
          ]
        }
      });
    }

    function addingColoring() {
      return picasso.chart({
        element: document.querySelector('#tutorial-coloring'),
        data: data,
        settings: {
          scales: scales,
          components: [
            yAxis(),
            xAxis(),
            points(true),
            legend()
          ]
        }
      });
    }

    function addingBrushing() {
      return picasso.chart({
        element: document.querySelector('#tutorial-brushing'),
        data: data,
        settings: {
          scales: scales,
          components: [
            yAxis(),
            xAxis(),
            points(true, true),
            legend(true)
          ]
        }
      });
    }

    function result() {
      return picasso.chart({
        element: document.querySelector('#tutorial-result'),
        data: data,
        settings: {
          scales: scales,
          components: [
            yAxis(),
            xAxis(),
            points(true, true),
            legend(true)
          ]
        }
      });
    }

    instances.push(result());
    instances.push(addingAxis());
    instances.push(addingPoints());
    instances.push(addingColoring());
    instances.push(addingBrushing());

    window.onresize = function() {
      instances.forEach(function(c) {
        c.update();
      });
    };
  });
}());
