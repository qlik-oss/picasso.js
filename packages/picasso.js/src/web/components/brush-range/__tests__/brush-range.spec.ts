import elementMock from 'test-utils/mocks/element-mock';
import vDomMock from 'test-utils/mocks/vDom-mock';
import componentFactoryFixture from '../../../../../test/helpers/component-factory-fixture';
import brushRange from '../brush-range';
import linearScale from '../../../../core/scales/linear';
import bandScale from '../../../../core/scales/band';
import brushFactory from '../../../../core/brush';

interface Size {
  inner: { x: number; y: number; width: number; height: number };
  outer: { x: number; y: number; width: number; height: number };
}

interface StyleObject extends Record<string, unknown> {
  position?: string;
  borderRadius?: string;
  border?: string;
  backgroundColor?: string;
  padding?: string;
  textAlign?: string;
  overflow?: string;
  textOverflow?: string;
  whiteSpace?: string;
  maxWidth?: string;
  minWidth?: string;
  minHeight?: string;
  pointerEvents?: string;
  transform?: string;
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  cursor?: string;
  height?: string;
  width?: string;
  left?: string;
  top?: string;
  right?: string;
  bottom?: string;
}

interface BrushConfig {
  settings: Record<string, unknown>;
}

describe('Brush Range', () => {
  let componentFixture: unknown;
  let instance: unknown;
  let config: BrushConfig;
  let rendererOutput: unknown;
  let chartMock: unknown;
  let theme: unknown;
  // @ts-expect-error - Sinon types provided globally in test environment
  let sandbox: SinonSandbox;
  let size: Size;
  let bubbleStyle: StyleObject;
  let rootBubbleStyle: StyleObject;
  let edgeStyle: StyleObject;
  let rootEdgeStyle: StyleObject;

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

    global.document.elementFromPoint = sinon.stub();
    global.document.createElement = sinon.stub().returns({ bind: elementMock });

    componentFixture = componentFactoryFixture();
    config = {
      settings: {
        scale: 'a',
        direction: 'horizontal',
        target: null, // Remove target to reduce complexity and dependencies on other components
      },
    };

    sandbox = (componentFixture as any).sandbox();
    chartMock = (componentFixture as any).mocks().chart;
    (chartMock as any).shapesAt = sandbox.stub().returns([]);
    (chartMock as any).brushFromShapes = sandbox.stub();
    chartMock.brush = sandbox.stub().returns(brushFactory());
    (componentFixture as any).mocks().renderer.renderArgs = [vDomMock];

    theme = (componentFixture as any).mocks().theme;
    (theme as Record<string, unknown>).style = (): unknown => ({
      line: {
        stroke: 'rgba(50, 50, 50, 0.8)',
      },
      target: {},
      bubble: {
        fontFamily: 'Georgia',
        fontSize: '14px',
        fill: '#fff',
        color: '#595959',
        borderRadius: 3,
        stroke: '#666',
        strokeWidth: 1,
      },
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
      color: '#595959',
      cursor: 'ew-resize',
    };

    rootBubbleStyle = {
      position: 'absolute',
      top: '0',
      left: '0px',
      transform: 'none',
    };

    edgeStyle = {
      backgroundColor: 'rgba(50, 50, 50, 0.8)',
      position: 'absolute',
      height: '100%',
      width: '1px',
      left: '0',
      top: '0',
      pointerEvents: 'none',
    };

    rootEdgeStyle = {
      cursor: 'ew-resize',
      position: 'absolute',
      left: '0px',
      top: '0px',
      height: '100%',
      width: '5px',
      pointerEvents: 'auto',
    };
  });

  afterEach(() => {
    // @ts-expect-error - deleting global property
    delete global.document.elementFromPoint;
    // @ts-expect-error - deleting global property
    delete global.document.createElement;
  });

  describe('should renderer discrete range', () => {
    beforeEach(() => {
      const scale = bandScale();
      scale.type = 'band';
      (chartMock as any).scale = sandbox.stub().returns(scale);
    });

    describe('horizontal', () => {
      beforeEach(() => {
        instance = (componentFixture as any).simulateCreate(brushRange, config);
        (componentFixture as any).simulateRender(size);
        (instance as any).def.start({ center: { x: 0, y: 0 }, deltaX: 0, deltaY: 0 });
        (instance as any).def.move({ center: { x: 100, y: 0 }, deltaX: 0, deltaY: 0 });
        rendererOutput = (componentFixture as any).getRenderOutput();
      });

      it('left edge node correctly', () => {
        const edgeLeft = (rendererOutput as any)[0];

        // Work-around to deal with deep equal on objects with functions
        expect(edgeLeft.data.onmouseover).to.be.a('function');
        expect(edgeLeft.data.onmouseout).to.be.a('function');
        delete edgeLeft.data.onmouseover;
        delete edgeLeft.data.onmouseout;

        const expectedEdgeLeft = {
          sel: 'div',
          data: {
            'data-value': 0,
            'data-key': 'brush-range-edge--1',
            style: rootEdgeStyle,
          },
          children: [
            {
              sel: 'div',
              data: {
                style: edgeStyle,
              },
              children: [],
            },
          ],
        };
        expect(edgeLeft).to.deep.equal(expectedEdgeLeft);
      });

      it('right edge node correctly', () => {
        edgeStyle.bottom = '0';
        edgeStyle.right = '0';
        delete edgeStyle.top;
        delete edgeStyle.left;
        rootEdgeStyle.left = '95px';
        const edgeRight = (rendererOutput as any)[1];

        // Work-around to deal with deep equal on objects with functions
        expect(edgeRight.data.onmouseover).to.be.a('function');
        expect(edgeRight.data.onmouseout).to.be.a('function');
        delete edgeRight.data.onmouseover;
        delete edgeRight.data.onmouseout;

        const expectedEdgeRight = {
          sel: 'div',
          data: {
            'data-value': 1,
            'data-key': 'brush-range-edge--1',
            style: rootEdgeStyle,
          },
          children: [
            {
              sel: 'div',
              data: {
                style: edgeStyle,
              },
              children: [],
            },
          ],
        };
        expect(edgeRight).to.deep.equal(expectedEdgeRight);
      });

      it('left bubble node correctly', () => {
        const bubbleLeft = (rendererOutput as any)[2];
        const expectedBubbleLeft = {
          sel: 'div',
          data: {
            style: rootBubbleStyle,
          },
          children: [
            {
              sel: 'div',
              data: {
                'data-other-value': 1,
                'data-idx': -1,
                'data-bidx': 0,
                'data-key': 'brush-range-bubble--1-0',
                style: bubbleStyle,
              },
              children: ['-'],
            },
          ],
        };

        expect(bubbleLeft).to.deep.equal(expectedBubbleLeft);
      });

      it('right bubble node correctly', () => {
        rootBubbleStyle.left = '100px';
        const bubbleRight = (rendererOutput as any)[3];
        const expectedBubbleRight = {
          sel: 'div',
          data: {
            style: rootBubbleStyle,
          },
          children: [
            {
              sel: 'div',
              data: {
                'data-other-value': 0,
                'data-idx': -1,
                'data-bidx': 1,
                'data-key': 'brush-range-bubble--1-1',
                style: bubbleStyle,
              },
              children: ['-'],
            },
          ],
        };

        expect(bubbleRight).to.deep.equal(expectedBubbleRight);
      });
    });
  });

  describe('linear', () => {
    beforeEach(() => {
      const scale = linearScale();
      (scale as any).type = 'linear';
      scale.data = () => ({
        fields: [
          {
            id: () => 'foo',
            formatter: () => (v) => v,
          } as any,
        ],
      });
      (chartMock as any).scale = sandbox.stub().returns(scale);
    });

    describe('on render', () => {
      it('should return empty when not observed nor brushed from this component', () => {
        instance = (componentFixture as any).simulateCreate(brushRange, config);
        (chartMock as any).brush().setRange("foo", { min: 0, max: 10 });
        (componentFixture as any).simulateRender(size);
        rendererOutput = (componentFixture as any).getRenderOutput();
        expect(rendererOutput.length).to.equal(0);
      });

      it('should return nodes from existing brush when observed', () => {
        instance = (componentFixture as any).simulateCreate(brushRange, {
          settings: {
            scale: 'a',
            direction: 'horizontal',
            target: null,
            brush: {
              observe: true,
            },
          },
        });
        (chartMock as any).brush().setRange("foo", { min: 0, max: 10 });
        (componentFixture as any).simulateRender(size);
        rendererOutput = (componentFixture as any).getRenderOutput();
        expect(rendererOutput.length).to.equal(1);
      });
    });

    describe('horizontal', () => {
      beforeEach(() => {
        instance = (componentFixture as any).simulateCreate(brushRange, config);
        (componentFixture as any).simulateRender(size);
        (instance as any).def.start({ center: { x: 0, y: 0 }, deltaX: 0, deltaY: 0 });
        (instance as any).def.move({ center: { x: 100, y: 0 }, deltaX: 0, deltaY: 0 });
        rendererOutput = (componentFixture as any).getRenderOutput();
      });

      it('left edge node correctly', () => {
        const edgeLeft = (rendererOutput as any)[0];

        // Work-around to deal with deep equal on objects with functions
        expect(edgeLeft.data.onmouseover).to.be.a('function');
        expect(edgeLeft.data.onmouseout).to.be.a('function');
        delete edgeLeft.data.onmouseover;
        delete edgeLeft.data.onmouseout;

        const expectedEdgeLeft = {
          sel: 'div',
          data: {
            'data-value': 0,
            'data-key': 'brush-range-edge--1',
            style: rootEdgeStyle,
          },
          children: [
            {
              sel: 'div',
              data: {
                style: edgeStyle,
              },
              children: [],
            },
          ],
        };
        expect(edgeLeft).to.deep.equal(expectedEdgeLeft);
      });

      it('right edge node correctly', () => {
        edgeStyle.bottom = '0';
        edgeStyle.right = '0';
        delete edgeStyle.top;
        delete edgeStyle.left;
        rootEdgeStyle.left = '95px';
        const edgeRight = (rendererOutput as any)[1];

        // Work-around to deal with deep equal on objects with functions
        expect(edgeRight.data.onmouseover).to.be.a('function');
        expect(edgeRight.data.onmouseout).to.be.a('function');
        delete edgeRight.data.onmouseover;
        delete edgeRight.data.onmouseout;

        const expectedEdgeRight = {
          sel: 'div',
          data: {
            'data-value': 1,
            'data-key': 'brush-range-edge--1',
            style: rootEdgeStyle,
          },
          children: [
            {
              sel: 'div',
              data: {
                style: edgeStyle,
              },
              children: [],
            },
          ],
        };
        expect(edgeRight).to.deep.equal(expectedEdgeRight);
      });

      it('left bubble node correctly', () => {
        const bubbleLeft = (rendererOutput as any)[2];
        const expectedBubbleLeft = {
          sel: 'div',
          data: {
            style: rootBubbleStyle,
          },
          children: [
            {
              sel: 'div',
              data: {
                'data-other-value': 1,
                'data-idx': -1,
                'data-bidx': 0,
                'data-key': 'brush-range-bubble--1-0',
                style: bubbleStyle,
              },
              children: ['0'],
            },
          ],
        };

        expect(bubbleLeft).to.deep.equal(expectedBubbleLeft);
      });

      it('right bubble node correctly', () => {
        rootBubbleStyle.left = '100px';
        const bubbleRight = (rendererOutput as any)[3];
        const expectedBubbleRight = {
          sel: 'div',
          data: {
            style: rootBubbleStyle,
          },
          children: [
            {
              sel: 'div',
              data: {
                'data-other-value': 0,
                'data-idx': -1,
                'data-bidx': 1,
                'data-key': 'brush-range-bubble--1-1',
                style: bubbleStyle,
              },
              children: ['1'],
            },
          ],
        };

        expect(bubbleRight).to.deep.equal(expectedBubbleRight);
      });
    });

    describe('vertical', () => {
      beforeEach(() => {
        config.settings.direction = 'vertical';
        instance = (componentFixture as any).simulateCreate(brushRange, config);
        (componentFixture as any).simulateRender(size);
        (instance as any).def.start({ center: { x: 0, y: 0 }, deltaX: 0, deltaY: 0 });
        (instance as any).def.move({ center: { x: 0, y: 150 }, deltaX: 0, deltaY: 0 });
        rendererOutput = (componentFixture as any).getRenderOutput();

        edgeStyle.width = '100%';
        edgeStyle.height = '1px';
      });

      it('top edge node correctly', () => {
        rootEdgeStyle.cursor = 'ns-resize';
        rootEdgeStyle.height = '5px';
        rootEdgeStyle.width = '100%';
        const edgeTop = (rendererOutput as any)[0];

        // Work-around to deal with deep equal on objects with functions
        expect(edgeTop.data.onmouseover).to.be.a('function');
        expect(edgeTop.data.onmouseout).to.be.a('function');
        delete edgeTop.data.onmouseover;
        delete edgeTop.data.onmouseout;

        const expectedEdgeTop = {
          sel: 'div',
          data: {
            'data-value': 0,
            'data-key': 'brush-range-edge--1',
            style: rootEdgeStyle,
          },
          children: [
            {
              sel: 'div',
              data: {
                style: edgeStyle,
              },
              children: [],
            },
          ],
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
        const edgeBottom = (rendererOutput as any)[1];

        // Work-around to deal with deep equal on objects with functions
        expect(edgeBottom.data.onmouseover).to.be.a('function');
        expect(edgeBottom.data.onmouseout).to.be.a('function');
        delete edgeBottom.data.onmouseover;
        delete edgeBottom.data.onmouseout;

        const expectedEdgeBottom = {
          sel: 'div',
          data: {
            'data-value': 1,
            'data-key': 'brush-range-edge--1',
            style: rootEdgeStyle,
          },
          children: [
            {
              sel: 'div',
              data: {
                style: edgeStyle,
              },
              children: [],
            },
          ],
        };
        expect(edgeBottom).to.deep.equal(expectedEdgeBottom);
      });

      it('top bubble node correctly', () => {
        bubbleStyle.transform = 'translate(0,-50%)';
        bubbleStyle.cursor = 'ns-resize';
        rootBubbleStyle.top = '0px';
        rootBubbleStyle.left = '0';
        const bubbleTop = (rendererOutput as any)[2];
        const expectedBubbleTop = {
          sel: 'div',
          data: {
            style: rootBubbleStyle,
          },
          children: [
            {
              sel: 'div',
              data: {
                'data-other-value': 1,
                'data-idx': -1,
                'data-bidx': 0,
                'data-key': 'brush-range-bubble--1-0',
                style: bubbleStyle,
              },
              children: ['0'],
            },
          ],
        };

        expect(bubbleTop).to.deep.equal(expectedBubbleTop);
      });

      it('bottom bubble node correctly', () => {
        bubbleStyle.transform = 'translate(0,-50%)';
        bubbleStyle.cursor = 'ns-resize';
        rootBubbleStyle.top = '150px';
        rootBubbleStyle.left = '0';
        const bubbleBottom = (rendererOutput as any)[3];
        const expectedBubbleBottom = {
          sel: 'div',
          data: {
            style: rootBubbleStyle,
          },
          children: [
            {
              sel: 'div',
              data: {
                'data-other-value': 0,
                'data-idx': -1,
                'data-bidx': 1,
                'data-key': 'brush-range-bubble--1-1',
                style: bubbleStyle,
              },
              children: ['1'],
            },
          ],
        };

        expect(bubbleBottom).to.deep.equal(expectedBubbleBottom);
      });
    });
  });
});
