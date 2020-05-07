import { measureText, textBounds } from '..';

describe('text-metrics', () => {
  describe('measureText', () => {
    let sandbox,
      canvasContextMock,
      cacheId = 0,
      fontWasUnset = false;

    const argument = {
      text: 'Test',
      fontSize: 0,
      fontFamily: 'Arial',
    };

    before(() => {
      sandbox = sinon.createSandbox();

      canvasContextMock = {
        font: '',
        measureText: sandbox.spy(() => {
          if (!canvasContextMock.font) {
            fontWasUnset = true;
          }
          return { width: 150 };
        }),
      };

      global.document = {
        createElement: sandbox.spy(() => ({ getContext: () => canvasContextMock })),
      };
    });

    afterEach(() => {
      fontWasUnset = false;
      canvasContextMock.font = '';
      sandbox.resetHistory();
    });

    after(() => {
      delete global.document;
    });

    it('should return correct result', () => {
      argument.fontSize = ++cacheId;

      const result = measureText(argument);

      expect(result).to.deep.equal({ width: 150, height: 16 });
    });

    it('should set the correct font before firing measureText', () => {
      argument.fontSize = ++cacheId;

      measureText(argument);

      expect(canvasContextMock.font).to.equal(`${cacheId} Arial`);
      expect(fontWasUnset).to.equal(false);
    });

    it('should fire measureText once with correct arguments', () => {
      argument.fontSize = ++cacheId;

      measureText(argument);

      expect(canvasContextMock.measureText).to.have.been.calledOnce;
      expect(canvasContextMock.measureText).to.have.been.calledWith('Test');
    });

    it('should reuse the previously created canvas element', () => {
      argument.fontSize = ++cacheId;

      measureText(argument);

      const preCallCount = global.document.createElement.callCount;

      argument.fontSize = ++cacheId;

      measureText(argument);

      const postCallCount = global.document.createElement.callCount;

      expect(preCallCount).to.equal(postCallCount);
    });

    it('should reuse past width calculations if arguments match previous use case', () => {
      argument.fontSize = ++cacheId;

      measureText(argument);

      expect(canvasContextMock.measureText.withArgs('Test').calledOnce).to.equal(true);

      measureText(argument);

      expect(canvasContextMock.measureText.withArgs('Test').calledOnce).to.equal(true);
    });

    it('should not reuse past width calculations if arguments does not match previous use case', () => {
      argument.fontSize = ++cacheId;

      measureText(argument);

      expect(canvasContextMock.measureText.withArgs('Test').calledOnce).to.equal(true);

      argument.fontSize = ++cacheId;

      measureText(argument);

      expect(canvasContextMock.measureText.withArgs('Test').calledTwice).to.equal(true);
    });
  });

  describe('textBounds', () => {
    const textMeasureMock = ({ text, fontSize, fontFamily }) => ({
      width: text.length * (parseFloat(fontSize) || 1),
      height: fontFamily || 1,
    });
    let node;
    let bounds;

    beforeEach(() => {
      bounds = {};
      node = {
        text: 'test',
        x: 1,
        y: 2,
      };
    });

    describe('should handle different properties', () => {
      describe('no line-break', () => {
        it('should return correct bounds', () => {
          bounds = textBounds(node, textMeasureMock);
          expect(bounds).to.deep.equal({
            x: 1,
            y: 1.25,
            width: 4,
            height: 1,
          });
        });

        it('with anchor middle', () => {
          node.anchor = 'middle';
          bounds = textBounds(node, textMeasureMock);
          expect(bounds).to.deep.equal({
            x: -1,
            y: 1.25,
            width: 4,
            height: 1,
          });
        });

        it('with anchor end', () => {
          node.anchor = 'end';
          bounds = textBounds(node, textMeasureMock);
          expect(bounds).to.deep.equal({
            x: -3,
            y: 1.25,
            width: 4,
            height: 1,
          });
        });

        it('without x and y', () => {
          node.x = undefined;
          node.y = undefined;
          bounds = textBounds(node, textMeasureMock);
          expect(bounds).to.deep.equal({
            x: 0,
            y: -0.75,
            width: 4,
            height: 1,
          });
        });

        it('with dx and dy', () => {
          node.dx = 3;
          node.dy = 4;
          bounds = textBounds(node, textMeasureMock);
          expect(bounds).to.deep.equal({
            x: 4,
            y: 5.25,
            width: 4,
            height: 1,
          });
        });

        it('with fontSize and fontFamily', () => {
          node.fontSize = 2;
          node.fontFamily = 3;
          bounds = textBounds(node, textMeasureMock);
          expect(bounds).to.deep.equal({
            x: 1,
            y: -0.25,
            width: 8,
            height: 3,
          });
        });

        it('with font-size and font-family', () => {
          node['font-size'] = 2;
          node['font-family'] = 3;
          bounds = textBounds(node, textMeasureMock);
          expect(bounds).to.deep.equal({
            x: 1,
            y: -0.25,
            width: 8,
            height: 3,
          });
        });

        it('with baseline', () => {
          node['font-size'] = 10;
          node['font-family'] = 3;
          node['dominant-baseline'] = 'ideographic';
          bounds = textBounds(node, textMeasureMock);
          expect(bounds).to.deep.equal({
            x: 1,
            y: -2.25,
            width: 40,
            height: 3,
          });
        });
      });

      describe('wordBreak', () => {
        beforeEach(() => {
          node.fontSize = '1px';
        });

        describe('break-all', () => {
          it('should not compute bounds based on line break given no maxWidth is set', () => {
            node.wordBreak = 'break-all';
            node.maxLines = 2;
            node.lineHeight = 10;
            bounds = textBounds(node, textMeasureMock);
            expect(bounds).to.deep.equal({
              x: 1,
              y: 1.25,
              width: 4,
              height: 1,
            });
          });

          it('should compute bounds based on line break given all conditions are meet', () => {
            node.wordBreak = 'break-all';
            node.maxWidth = 1;
            node.lineHeight = 10;
            node.maxLines = 2;
            bounds = textBounds(node, textMeasureMock);
            expect(bounds).to.deep.equal({
              x: 1,
              y: 1.25,
              width: 1,
              height: 20,
            });
          });

          it('should require text width to be more than node maxWidth', () => {
            node.wordBreak = 'break-all';
            node.maxWidth = node.text.length + 1;
            node.lineHeight = 10;
            node.maxLines = 2;
            bounds = textBounds(node, textMeasureMock);
            expect(bounds).to.deep.equal({
              x: 1,
              y: 1.25,
              width: 4,
              height: 1,
            });
          });

          it('should compute bounds based on line break given node text contains a line break character', () => {
            node.text = 'te\nst';
            node.wordBreak = 'break-all';
            node.maxWidth = Infinity;
            node.lineHeight = 10;
            node.maxLines = 2;
            bounds = textBounds(node, textMeasureMock);
            expect(bounds).to.deep.equal({
              x: 1,
              y: 1.25,
              width: 2,
              height: 20,
            });
          });
        });
      });
    });
  });
});
