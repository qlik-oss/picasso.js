import elementMock from 'test-utils/mocks/element-mock';
import vDomMock from 'test-utils/mocks/vDom-mock';
import componentFactoryFixture from '../../../../helpers/component-factory-fixture';
import brushRange from '../../../../../src/web/components/brush-range/brush-range';
import linearScale from '../../../../../src/core/scales/linear';
import bandScale from '../../../../../src/core/scales/band';
import brushFactory from '../../../../../src/core/brush';

describe('Brush Range', () => {
  let componentFixture;
  let instance;
  let config;
  let rendererOutput;
  let chartMock;
  let theme;
  let sandbox;
  let size;
  let bubbleStyle;
  let rootBubbleStyle;
  let edgeStyle;
  let rootEdgeStyle;

  beforeEach(() => {
    size = {
      inner: {
        x: 0, y: 0, width: 100, height: 150
      },
      outer: {
        x: 0, y: 0, width: 100, height: 150
      }
    };

    global.document = {
      elementFromPoint: sinon.stub(),
      createElement: sinon.stub().returns({ bind: elementMock })
    };

    componentFixture = componentFactoryFixture();
    config = {
      settings: {
        scale: 'a',
        direction: 'horizontal',
        target: null // Remove target to reduce complexity and dependencies on other components
      }
    };

    sandbox = componentFixture.sandbox();
    chartMock = componentFixture.mocks().chart;
    chartMock.shapesAt = sandbox.stub().returns([]);
    chartMock.brushFromShapes = sandbox.stub();
    chartMock.brush = sandbox.stub().returns(brushFactory());
    componentFixture.mocks().renderer.renderArgs = [vDomMock];

    theme = componentFixture.mocks().theme;
    theme.style.returns({
      line: {
        stroke: 'rgba(50, 50, 50, 0.8)'
      },
      target: {

      },
      bubble: {
        fontFamily: 'Georgia',
        fontSize: '14px',
        fill: '#fff',
        color: '#595959',
        borderRadius: 3,
        stroke: '#666',
        strokeWidth: 1
      }
    });

    bubbleStyle = {
      position: 'relative',
      borderRadius: '3px',
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
      fontFamily: 'Georgia',
      color: '#595959'
    };

    rootBubbleStyle = {
      position: 'absolute',
      top: '0',
      left: '0px',
      transform: 'none'
    };

    edgeStyle = {
      backgroundColor: 'rgba(50, 50, 50, 0.8)',
      position: 'absolute',
      height: '100%',
      width: '1px',
      left: '0',
      top: '0',
      pointerEvents: 'none'
    };

    rootEdgeStyle = {
      cursor: 'ew-resize',
      position: 'absolute',
      left: '0px',
      top: '0px',
      height: '100%',
      width: '5px',
      pointerEvents: 'auto'
    };
  });

  afterEach(() => {
    delete global.document;
  });

  describe('should renderer discrete range', () => {
    beforeEach(() => {
      const scale = bandScale();
      scale.type = 'band';
      chartMock.scale = sandbox.stub().returns(scale);
    });

    describe('horizontal', () => {
      beforeEach(() => {
        instance = componentFixture.simulateCreate(brushRange, config);
        componentFixture.simulateRender(size);
        instance.def.start({ center: { x: 0, y: 0 }, deltaX: 0, deltaY: 0 });
        instance.def.move({ center: { x: 100, y: 0 }, deltaX: 0, deltaY: 0 });
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
            style: rootEdgeStyle
          },
          children: [{
            sel: 'div',
            data: {
              style: edgeStyle
            },
            children: []
          }]
        };
        expect(edgeLeft).to.deep.equal(expectedEdgeLeft);
      });

      it('right edge node correctly', () => {
        edgeStyle.bottom = '0';
        edgeStyle.right = '0';
        delete edgeStyle.top;
        delete edgeStyle.left;
        rootEdgeStyle.left = '95px';
        const edgeRight = rendererOutput[1];

        // Work-around to deal with deep equal on objects with functions
        expect(edgeRight.data.onmouseover).to.be.a('function');
        expect(edgeRight.data.onmouseout).to.be.a('function');
        delete edgeRight.data.onmouseover;
        delete edgeRight.data.onmouseout;

        const expectedEdgeRight = {
          sel: 'div',
          data: {
            'data-value': 1,
            style: rootEdgeStyle
          },
          children: [{
            sel: 'div',
            data: {
              style: edgeStyle
            },
            children: []
          }]
        };
        expect(edgeRight).to.deep.equal(expectedEdgeRight);
      });

      it('left bubble node correctly', () => {
        const bubbleLeft = rendererOutput[2];
        const expectedBubbleLeft = {
          sel: 'div',
          data: {
            style: rootBubbleStyle
          },
          children: [{
            sel: 'div',
            data: {
              'data-other-value': 1,
              'data-idx': -1,
              style: bubbleStyle
            },
            children: ['-']
          }]
        };

        expect(bubbleLeft).to.deep.equal(expectedBubbleLeft);
      });

      it('right bubble node correctly', () => {
        rootBubbleStyle.left = '100px';
        const bubbleRight = rendererOutput[3];
        const expectedBubbleRight = {
          sel: 'div',
          data: {
            style: rootBubbleStyle
          },
          children: [{
            sel: 'div',
            data: {
              'data-other-value': 0,
              'data-idx': -1,
              style: bubbleStyle
            },
            children: ['-']
          }]
        };

        expect(bubbleRight).to.deep.equal(expectedBubbleRight);
      });
    });
  });

  describe('should renderer linear range', () => {
    beforeEach(() => {
      const scale = linearScale();
      scale.type = 'linear';
      scale.data = () => ({
        fields: [{
          id: () => '',
          formatter: () => (v => v)
        }]
      });
      chartMock.scale = sandbox.stub().returns(scale);
    });

    describe('horizontal', () => {
      beforeEach(() => {
        instance = componentFixture.simulateCreate(brushRange, config);
        componentFixture.simulateRender(size);
        instance.def.start({ center: { x: 0, y: 0 }, deltaX: 0, deltaY: 0 });
        instance.def.move({ center: { x: 100, y: 0 }, deltaX: 0, deltaY: 0 });
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
            style: rootEdgeStyle
          },
          children: [{
            sel: 'div',
            data: {
              style: edgeStyle
            },
            children: []
          }]
        };
        expect(edgeLeft).to.deep.equal(expectedEdgeLeft);
      });

      it('right edge node correctly', () => {
        edgeStyle.bottom = '0';
        edgeStyle.right = '0';
        delete edgeStyle.top;
        delete edgeStyle.left;
        rootEdgeStyle.left = '95px';
        const edgeRight = rendererOutput[1];

        // Work-around to deal with deep equal on objects with functions
        expect(edgeRight.data.onmouseover).to.be.a('function');
        expect(edgeRight.data.onmouseout).to.be.a('function');
        delete edgeRight.data.onmouseover;
        delete edgeRight.data.onmouseout;

        const expectedEdgeRight = {
          sel: 'div',
          data: {
            'data-value': 1,
            style: rootEdgeStyle
          },
          children: [{
            sel: 'div',
            data: {
              style: edgeStyle
            },
            children: []
          }]
        };
        expect(edgeRight).to.deep.equal(expectedEdgeRight);
      });

      it('left bubble node correctly', () => {
        const bubbleLeft = rendererOutput[2];
        const expectedBubbleLeft = {
          sel: 'div',
          data: {
            style: rootBubbleStyle
          },
          children: [{
            sel: 'div',
            data: {
              'data-other-value': 1,
              'data-idx': -1,
              style: bubbleStyle
            },
            children: ['0']
          }]
        };

        expect(bubbleLeft).to.deep.equal(expectedBubbleLeft);
      });

      it('right bubble node correctly', () => {
        rootBubbleStyle.left = '100px';
        const bubbleRight = rendererOutput[3];
        const expectedBubbleRight = {
          sel: 'div',
          data: {
            style: rootBubbleStyle
          },
          children: [{
            sel: 'div',
            data: {
              'data-other-value': 0,
              'data-idx': -1,
              style: bubbleStyle
            },
            children: ['1']
          }]
        };

        expect(bubbleRight).to.deep.equal(expectedBubbleRight);
      });
    });

    describe('vertical', () => {
      beforeEach(() => {
        config.settings.direction = 'vertical';
        instance = componentFixture.simulateCreate(brushRange, config);
        componentFixture.simulateRender(size);
        instance.def.start({ center: { x: 0, y: 0 }, deltaX: 0, deltaY: 0 });
        instance.def.move({ center: { x: 0, y: 150 }, deltaX: 0, deltaY: 0 });
        rendererOutput = componentFixture.getRenderOutput();

        edgeStyle.width = '100%';
        edgeStyle.height = '1px';
      });

      it('top edge node correctly', () => {
        rootEdgeStyle.cursor = 'ns-resize';
        rootEdgeStyle.height = '5px';
        rootEdgeStyle.width = '100%';
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
            style: rootEdgeStyle
          },
          children: [{
            sel: 'div',
            data: {
              style: edgeStyle
            },
            children: []
          }]
        };
        expect(edgeTop).to.deep.equal(expectedEdgeTop);
      });

      it('bottom edge node correctly', () => {
        edgeStyle.bottom = '0';
        edgeStyle.right = '0';
        delete edgeStyle.top;
        delete edgeStyle.left;
        rootEdgeStyle.cursor = 'ns-resize';
        rootEdgeStyle.height = '5px';
        rootEdgeStyle.width = '100%';
        rootEdgeStyle.top = '145px';
        const edgeBottom = rendererOutput[1];

        // Work-around to deal with deep equal on objects with functions
        expect(edgeBottom.data.onmouseover).to.be.a('function');
        expect(edgeBottom.data.onmouseout).to.be.a('function');
        delete edgeBottom.data.onmouseover;
        delete edgeBottom.data.onmouseout;

        const expectedEdgeBottom = {
          sel: 'div',
          data: {
            'data-value': 1,
            style: rootEdgeStyle
          },
          children: [{
            sel: 'div',
            data: {
              style: edgeStyle
            },
            children: []
          }]
        };
        expect(edgeBottom).to.deep.equal(expectedEdgeBottom);
      });

      it('top bubble node correctly', () => {
        bubbleStyle.transform = 'translate(0,-50%)';
        rootBubbleStyle.top = '0px';
        rootBubbleStyle.left = '0';
        const bubbleTop = rendererOutput[2];
        const expectedBubbleTop = {
          sel: 'div',
          data: {
            style: rootBubbleStyle
          },
          children: [{
            sel: 'div',
            data: {
              'data-other-value': 1,
              'data-idx': -1,
              style: bubbleStyle
            },
            children: ['0']
          }]
        };

        expect(bubbleTop).to.deep.equal(expectedBubbleTop);
      });

      it('bottom bubble node correctly', () => {
        bubbleStyle.transform = 'translate(0,-50%)';
        rootBubbleStyle.top = '150px';
        rootBubbleStyle.left = '0';
        const bubbleBottom = rendererOutput[3];
        const expectedBubbleBottom = {
          sel: 'div',
          data: {
            style: rootBubbleStyle
          },
          children: [{
            sel: 'div',
            data: {
              'data-other-value': 0,
              'data-idx': -1,
              style: bubbleStyle
            },
            children: ['1']
          }]
        };

        expect(bubbleBottom).to.deep.equal(expectedBubbleBottom);
      });
    });
  });
});
