import elementMock from 'test-utils/mocks/element-mock';
import vDomMock from 'test-utils/mocks/vDom-mock';
import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';
import brushAreaDir from '../brush-area-dir';

describe('Brush Area Directional', () => {
  let componentFixture;
  let instance;
  let config;
  let rendererOutput;
  let chartMock;
  let theme;
  let sandbox;
  let size;

  beforeEach(() => {
    size = {
      inner: {
        x: 0,
        y: 0,
        width: 100,
        height: 150,
      },
      outer: {
        x: 0,
        y: 0,
        width: 100,
        height: 150,
      },
    };

    global.document = {
      elementFromPoint: sinon.stub(),
      createElement: sinon.stub().returns({ bind: elementMock }),
    };

    componentFixture = componentFactoryFixture();
    config = {
      settings: {
        direction: 'horizontal',
        target: null, // Remove target to reduce complexity and dependencies on other components
      },
    };

    sandbox = componentFixture.sandbox();
    chartMock = componentFixture.mocks().chart;
    chartMock.shapesAt = sandbox.stub().returns([]);
    chartMock.brushFromShapes = sandbox.stub();
    componentFixture.mocks().renderer.renderArgs = [vDomMock];

    theme = componentFixture.mocks().theme;
    theme.style.returns({
      line: {
        stroke: 'rgba(50, 50, 50, 0.8)',
      },
      target: {},
      bubble: {
        fontFamily: 'Arial',
        fontSize: '14px',
        fill: '#fff',
        color: '#595959',
        borderRadius: 4,
        stroke: '#666',
        strokeWidth: 1,
      },
    });
  });

  afterEach(() => {
    delete global.document;
  });

  describe('should renderer', () => {
    describe('horizontal', () => {
      beforeEach(() => {
        instance = componentFixture.simulateCreate(brushAreaDir, config);
        componentFixture.simulateRender(size);
        instance.def.start({ center: { x: 0, y: 0 }, deltaX: 0, deltaY: 0 });
        instance.def.move({ center: { x: 100, y: 0 }, deltaX: 0, deltaY: 0 });
        instance.def.end();
        rendererOutput = componentFixture.getRenderOutput();
      });

      it('left edge node correctly', () => {
        const edgeLeft = rendererOutput[0];

        // Work-around to deal with deep equal on objects with functions
        expect(edgeLeft.data.onmouseover).to.be.a('function');
        expect(edgeLeft.data.onmouseout).to.be.a('function');
        delete edgeLeft.data.onmouseover;
        delete edgeLeft.data.onmouseout;

        const expectedEdgeLeft = {
          sel: 'div',
          data: {
            'data-value': 0,
            'data-key': 'brush-area-dir-edge-0',
            style: {
              cursor: 'ew-resize',
              position: 'absolute',
              left: '0px',
              top: '0px',
              height: '100%',
              width: '5px',
              pointerEvents: 'auto',
            },
          },
          children: [
            {
              sel: 'div',
              data: {
                style: {
                  backgroundColor: 'rgba(50, 50, 50, 0.8)',
                  position: 'absolute',
                  height: '100%',
                  width: '1px',
                  left: '0',
                  top: '0',
                  pointerEvents: 'none',
                },
              },
              children: [],
            },
          ],
        };
        expect(edgeLeft).to.deep.equal(expectedEdgeLeft);
      });

      it('right edge node correctly', () => {
        const edgeRight = rendererOutput[1];

        // Work-around to deal with deep equal on objects with functions
        expect(edgeRight.data.onmouseover).to.be.a('function');
        expect(edgeRight.data.onmouseout).to.be.a('function');
        delete edgeRight.data.onmouseover;
        delete edgeRight.data.onmouseout;

        const expectedEdgeRight = {
          sel: 'div',
          data: {
            'data-value': 100,
            'data-key': 'brush-area-dir-edge-0',
            style: {
              cursor: 'ew-resize',
              position: 'absolute',
              left: '95px',
              top: '0px',
              height: '100%',
              width: '5px',
              pointerEvents: 'auto',
            },
          },
          children: [
            {
              sel: 'div',
              data: {
                style: {
                  backgroundColor: 'rgba(50, 50, 50, 0.8)',
                  position: 'absolute',
                  height: '100%',
                  width: '1px',
                  right: '0',
                  bottom: '0',
                  pointerEvents: 'none',
                },
              },
              children: [],
            },
          ],
        };
        expect(edgeRight).to.deep.equal(expectedEdgeRight);
      });

      it('left bubble node correctly', () => {
        const bubbleLeft = rendererOutput[2];
        const expectedBubbleLeft = {
          sel: 'div',
          data: {
            style: {
              position: 'absolute',
              top: '0',
              left: '0px',
              transform: 'none',
            },
          },
          children: [
            {
              sel: 'div',
              data: {
                'data-other-value': 100,
                'data-idx': 0,
                'data-bidx': 0,
                'data-key': 'brush-area-dir-bubble-0',
                style: {
                  position: 'relative',
                  borderRadius: '4px',
                  border: '1px solid #666',
                  backgroundColor: '#fff',
                  padding: '4px 8px',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '150px',
                  minWidth: '50px',
                  minHeight: '1em',
                  pointerEvents: 'auto',
                  transform: 'translate(-50%,0)',
                  fontSize: '14px',
                  fontFamily: 'Arial',
                  color: '#595959',
                  cursor: 'ew-resize',
                },
              },
              children: ['-'],
            },
          ],
        };

        expect(bubbleLeft).to.deep.equal(expectedBubbleLeft);
      });

      it('right bubble node correctly', () => {
        const bubbleRight = rendererOutput[3];
        const expectedBubbleRight = {
          sel: 'div',
          data: {
            style: {
              position: 'absolute',
              top: '0',
              left: '100px',
              transform: 'none',
            },
          },
          children: [
            {
              sel: 'div',
              data: {
                'data-other-value': 0,
                'data-idx': 0,
                'data-bidx': 1,
                'data-key': 'brush-area-dir-bubble-1',
                style: {
                  position: 'relative',
                  borderRadius: '4px',
                  border: '1px solid #666',
                  backgroundColor: '#fff',
                  padding: '4px 8px',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '150px',
                  minWidth: '50px',
                  minHeight: '1em',
                  pointerEvents: 'auto',
                  transform: 'translate(-50%,0)',
                  fontSize: '14px',
                  fontFamily: 'Arial',
                  color: '#595959',
                  cursor: 'ew-resize',
                },
              },
              children: ['-'],
            },
          ],
        };

        expect(bubbleRight).to.deep.equal(expectedBubbleRight);
      });
    });

    describe('horizontal negative active drag', () => {
      beforeEach(() => {
        instance = componentFixture.simulateCreate(brushAreaDir, config);
        componentFixture.simulateRender(size);
        instance.def.start({ center: { x: 100, y: 0 }, deltaX: 0, deltaY: 0 });
        instance.def.move({ center: { x: 0, y: 0 }, deltaX: 0, deltaY: 0 }); // move to the left (negative)
        rendererOutput = componentFixture.getRenderOutput();
      });

      it('left edge node', () => {
        const edgeLeft = rendererOutput[0];
        expect(edgeLeft.data['data-key']).to.equal('brush-area-dir-edge--1');
        expect(edgeLeft.data.style.left).to.equal('0px');
      });

      it('right edge node', () => {
        const edgeRight = rendererOutput[1];
        expect(edgeRight.data['data-key']).to.equal('brush-area-dir-edge--1');
        expect(edgeRight.data.style.left).to.equal('95px');
      });
    });

    describe('vertical', () => {
      beforeEach(() => {
        config.settings.direction = 'vertical';
        instance = componentFixture.simulateCreate(brushAreaDir, config);
        componentFixture.simulateRender(size);
        instance.def.start({ center: { x: 0, y: 0 }, deltaX: 0, deltaY: 0 });
        instance.def.move({ center: { x: 0, y: 150 }, deltaX: 0, deltaY: 0 });
        instance.def.end({ center: { x: 0, y: 75 }, deltaX: 0, deltaY: 0 });
        rendererOutput = componentFixture.getRenderOutput();
      });

      it('top edge node correctly', () => {
        const edgeTop = rendererOutput[0];

        // Work-around to deal with deep equal on objects with functions
        expect(edgeTop.data.onmouseover).to.be.a('function');
        expect(edgeTop.data.onmouseout).to.be.a('function');
        delete edgeTop.data.onmouseover;
        delete edgeTop.data.onmouseout;

        const expectedEdgeTop = {
          sel: 'div',
          data: {
            'data-value': 0,
            'data-key': 'brush-area-dir-edge-0',
            style: {
              cursor: 'ns-resize',
              position: 'absolute',
              left: '0px',
              top: '0px',
              height: '5px',
              width: '100%',
              pointerEvents: 'auto',
            },
          },
          children: [
            {
              sel: 'div',
              data: {
                style: {
                  backgroundColor: 'rgba(50, 50, 50, 0.8)',
                  position: 'absolute',
                  height: '1px',
                  width: '100%',
                  left: '0',
                  top: '0',
                  pointerEvents: 'none',
                },
              },
              children: [],
            },
          ],
        };
        expect(edgeTop).to.deep.equal(expectedEdgeTop);
      });

      it('bottom edge node correctly', () => {
        const edgeBottom = rendererOutput[1];

        // Work-around to deal with deep equal on objects with functions
        expect(edgeBottom.data.onmouseover).to.be.a('function');
        expect(edgeBottom.data.onmouseout).to.be.a('function');
        delete edgeBottom.data.onmouseover;
        delete edgeBottom.data.onmouseout;

        const expectedEdgeBottom = {
          sel: 'div',
          data: {
            'data-value': 150,
            'data-key': 'brush-area-dir-edge-0',
            style: {
              cursor: 'ns-resize',
              position: 'absolute',
              left: '0px',
              top: '145px',
              height: '5px',
              width: '100%',
              pointerEvents: 'auto',
            },
          },
          children: [
            {
              sel: 'div',
              data: {
                style: {
                  backgroundColor: 'rgba(50, 50, 50, 0.8)',
                  position: 'absolute',
                  height: '1px',
                  width: '100%',
                  right: '0',
                  bottom: '0',
                  pointerEvents: 'none',
                },
              },
              children: [],
            },
          ],
        };
        expect(edgeBottom).to.deep.equal(expectedEdgeBottom);
      });

      it('top bubble node correctly', () => {
        const bubbleTop = rendererOutput[2];
        const expectedBubbleTop = {
          sel: 'div',
          data: {
            style: {
              position: 'absolute',
              top: '0px',
              left: '0',
              transform: 'none',
            },
          },
          children: [
            {
              sel: 'div',
              data: {
                'data-other-value': 150,
                'data-idx': 0,
                'data-bidx': 0,
                'data-key': 'brush-area-dir-bubble-0',
                style: {
                  position: 'relative',
                  borderRadius: '4px',
                  border: '1px solid #666',
                  backgroundColor: '#fff',
                  padding: '4px 8px',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '150px',
                  minWidth: '50px',
                  minHeight: '1em',
                  pointerEvents: 'auto',
                  transform: 'translate(0,-50%)',
                  fontSize: '14px',
                  fontFamily: 'Arial',
                  color: '#595959',
                  cursor: 'ns-resize',
                },
              },
              children: ['-'],
            },
          ],
        };

        expect(bubbleTop).to.deep.equal(expectedBubbleTop);
      });

      it('bottom bubble node correctly', () => {
        const bubbleBottom = rendererOutput[3];
        const expectedBubbleBottom = {
          sel: 'div',
          data: {
            style: {
              position: 'absolute',
              top: '150px',
              left: '0',
              transform: 'none',
            },
          },
          children: [
            {
              sel: 'div',
              data: {
                'data-other-value': 0,
                'data-idx': 0,
                'data-bidx': 1,
                'data-key': 'brush-area-dir-bubble-1',
                style: {
                  position: 'relative',
                  borderRadius: '4px',
                  border: '1px solid #666',
                  backgroundColor: '#fff',
                  padding: '4px 8px',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '150px',
                  minWidth: '50px',
                  minHeight: '1em',
                  pointerEvents: 'auto',
                  transform: 'translate(0,-50%)',
                  fontSize: '14px',
                  fontFamily: 'Arial',
                  color: '#595959',
                  cursor: 'ns-resize',
                },
              },
              children: ['-'],
            },
          ],
        };

        expect(bubbleBottom).to.deep.equal(expectedBubbleBottom);
      });
    });
  });
});
