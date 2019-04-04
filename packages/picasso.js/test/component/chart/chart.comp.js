import createElement from 'test-utils/mocks/element-mock';
import p from '../../../src';

const { chart } = p;

describe('Chart', () => {
  let element;
  let data;
  let pointMarkerRed;
  let pointMarkerGreen;
  let pointMarkerBlue;
  let settings;

  beforeEach(() => {
    element = createElement();

    data = [
      ['Product', 'Cost'],
      ['Cars', 1],
      ['Trucks', 2]
    ];

    pointMarkerRed = {
      key: 'key1',
      type: 'point',
      data: {
        extract: {
          field: 0
        }
      },
      settings: {
        fill: 'red'
      }
    };

    pointMarkerGreen = {
      key: 'key2',
      type: 'point',
      data: {
        extract: {
          field: 0
        }
      },
      settings: {
        fill: 'green'
      }
    };

    pointMarkerBlue = {
      key: 'key3',
      type: 'point',
      data: {
        extract: {
          field: 0
        }
      },
      settings: {
        fill: 'blue'
      }
    };

    settings = {
      components: []
    };
  });

  describe('shapesAt', () => {
    it('should return shapesAt', () => {
      settings.components.push(pointMarkerRed);
      settings.components.push(pointMarkerGreen);
      settings.components.push(pointMarkerBlue);
      const instance = chart({
        element,
        data: { data },
        settings
      });

      const shapes = instance.shapesAt({
        x: 0,
        y: 0,
        width: 100,
        height: 100
      }); // Select all shapes in the chart
      const expectedShapes = instance.findShapes('circle');

      expect(shapes.map(s => s.attrs)).to.deep.equal(expectedShapes.map(s => s.attrs).reverse()); // Reverse because findShapes do lookup down-n-up
    });

    it('should be possible to do lookup on specific components', () => {
      settings.components.push(pointMarkerRed);
      settings.components.push(pointMarkerGreen);
      settings.components.push(pointMarkerBlue);
      const instance = chart({
        element,
        data: { data },
        settings
      });

      const shapes = instance.shapesAt({
        x: 0,
        y: 0,
        width: 100,
        height: 100
      }, {
        components: [{ key: 'key2' }]
      }); // Select all shapes in key2 component
      const expectedShapes = instance.findShapes('circle[fill="green"]'); // All shapes in key2 component are circles with fill=green

      expect(shapes.map(s => s.attrs)).to.deep.equal(expectedShapes.map(s => s.attrs));
    });

    it('should stop propagation to other components if a match is found', () => {
      settings.components.push(pointMarkerRed);
      settings.components.push(pointMarkerGreen);
      settings.components.push(pointMarkerBlue);
      const instance = chart({
        element,
        data: { data },
        settings
      });

      const shapes = instance.shapesAt({
        x: 0,
        y: 0,
        width: 100,
        height: 100
      }, {
        propagation: 'stop'
      }); // Should start on top (visible top) component and propagation down until a match is found
      const expectedShapes = instance.findShapes('circle[fill="blue"]');

      expect(shapes.map(s => s.attrs)).to.deep.equal(expectedShapes.map(s => s.attrs));
    });

    it('should stop propagation in component if a match is found', () => {
      settings.components.push(pointMarkerRed);
      settings.components.push(pointMarkerGreen);
      settings.components.push(pointMarkerBlue);
      const instance = chart({
        element,
        data: { data },
        settings
      });

      const shapes = instance.shapesAt({
        x: 0,
        y: 0,
        width: 100,
        height: 100
      }, {
        components: [
          { key: 'key1', propagation: 'stop' },
          { key: 'key2', propagation: 'stop' },
          { key: 'key3' }
        ]
      });

      expect(shapes.map(s => s.attrs.fill)).to.deep.equal(['blue', 'blue', 'green', 'red']); // Only return 1 circle for each component except blue which doesnt have propagation set to stop
    });
  });

  describe('brushFromShapes', () => {
    it('should brush provided shapes given that their parent component is configured and they have data bound to them', () => {
      pointMarkerRed.brush = {
        consume: [
          {
            context: 'test',
            style: {
              active: {
                fill: 'black'
              }
            }
          }
        ]
      };

      settings.components.push(pointMarkerRed);
      const instance = chart({
        element,
        data: { data },
        settings
      });

      const shapes = instance.findShapes('circle');
      instance.brushFromShapes(shapes, {
        components: [{
          key: 'key1',
          contexts: ['test'],
          data: [''],
          action: 'add'
        }]
      });

      const brushedShapes = instance.findShapes('circle');
      expect(brushedShapes.map(s => s.attrs.fill)).to.deep.equal(['black', 'black']);
    });

    it('should not brush provided shapes doesnt have a their parent component configured', () => {
      pointMarkerRed.brush = {
        consume: [
          {
            context: 'test',
            style: {
              active: {
                fill: 'black'
              }
            }
          }
        ]
      };

      settings.components.push(pointMarkerRed);
      const instance = chart({
        element,
        data: { data },
        settings
      });

      const shapes = instance.findShapes('circle');
      instance.brushFromShapes(shapes, {
        components: [{
          key: 'unknown',
          contexts: ['test'],
          data: [''],
          action: 'add'
        }]
      });

      const brushedShapes = instance.findShapes('circle');
      expect(brushedShapes.map(s => s.attrs.fill)).to.deep.equal(['red', 'red']);
    });
  });

  it('should render components in the correct order', () => {
    let renderOrder = [];
    p.component('custom-log-render', {
      render() {
        renderOrder.push(this.settings.key);
        return [];
      }
    });
    function createComp(key, order = key) {
      return {
        key: `comp${key}`,
        layout: {
          displayOrder: order
        },
        type: 'custom-log-render'
      };
    }

    const comp0 = createComp(0);
    const comp1 = createComp(1);
    const comp2 = createComp(2);
    const comp3 = createComp(3, 1);

    settings.components.push(comp2, comp0);
    const instance = chart({
      element,
      data: { data },
      settings
    });
    expect(renderOrder).to.eql(['comp0', 'comp2']);
    renderOrder = [];
    settings.components.push(comp1);
    instance.update({
      settings
    });
    expect(renderOrder).to.eql(['comp0', 'comp1', 'comp2']);
    renderOrder = [];
    settings.components.push(comp3);
    instance.update({
      settings
    });
    expect(renderOrder).to.eql(['comp0', 'comp1', 'comp3', 'comp2']);
  });
});
