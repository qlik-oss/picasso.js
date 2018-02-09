import {
  onLineBreak
} from '../../../../src/web/text-manipulation';

describe('Line Break Resolver', () => {
  describe('onLineBreak', () => {
    const measureTextMock = ({ text }) => ({ width: text.length, height: 1 });
    let measureTextSpy;
    let node;
    let state;
    let fn;

    beforeEach(() => {
      node = { type: 'text' };
      state = { node };
      measureTextSpy = sinon.spy();
      fn = onLineBreak(measureTextMock);
    });

    it('should only be invoked on text nodes', () => {
      node.wordBreak = 'break-all';
      node.type = 'container';
      fn = onLineBreak(measureTextSpy);
      fn(state);
      expect(measureTextSpy).to.not.have.been.called;
    });

    it('should not be invoked on text nodes if wordBreak property is missing', () => {
      fn = onLineBreak(measureTextSpy);
      fn(state);
      expect(measureTextSpy).to.not.have.been.called;
    });

    it('should not be invoked on text node if tagged as a multi-line node', () => {
      node.wordBreak = 'break-all';
      node._lineBreak = true; // _lineBreak prop how it's internally tagged if part o multi-line text
      fn = onLineBreak(measureTextSpy);
      fn(state);
      expect(measureTextSpy).to.not.have.been.called;
    });

    it('should tag output nodes', () => {
      node.text = '123456789';
      node.wordBreak = 'break-all';
      node.maxWidth = 3;
      fn(state);
      expect(state.node.type).to.equal('container');
      state.node.children.forEach((c) => {
        expect(c._lineBreak).to.be.true;
      });
    });

    it('should inherit id attribute from text node', () => {
      node.text = '123456789';
      node.wordBreak = 'break-all';
      node.maxWidth = 3;
      node.id = 'test';
      fn(state);
      expect(state.node.type).to.equal('container');
      expect(state.node.id).to.equal('test');
    });

    it('should respect lineHeight attribute', () => {
      node.text = '123456789';
      node.wordBreak = 'break-all';
      node.x = 0;
      node.y = 0;
      node.maxWidth = 3;
      node.lineHeight = 10;
      fn(state);
      expect(state.node.children[0].dy).to.equal(0);
      expect(state.node.children[1].dy).to.equal(10);
      expect(state.node.children[2].dy).to.equal(20);
    });

    it('should include dy attribute when calculating position', () => {
      node.text = '123456789';
      node.wordBreak = 'break-all';
      node.x = 0;
      node.y = 0;
      node.dy = 3;
      node.maxWidth = 3;
      node.lineHeight = 10;
      fn(state);
      expect(state.node.children[0].dy).to.equal(3);
      expect(state.node.children[1].dy).to.equal(13);
      expect(state.node.children[2].dy).to.equal(23);
    });

    it('should remove maxWidth attribute and append ellipis char on last line', () => {
      node.text = '123456789';
      node.wordBreak = 'break-all';
      node.x = 0;
      node.y = 0;
      node.maxWidth = 3;
      node.maxLines = 2;
      fn(state);
      expect(state.node.children[0].maxWidth).to.equal(undefined);
      expect(state.node.children[1].maxWidth).to.equal(3); // maxWidth on last line should remain
      expect(state.node.children[1].text).to.equal('456…');
    });

    it('should not line-break node if text fits on a single line', () => {
      node.text = '123456789';
      node.wordBreak = 'break-all';
      node.maxWidth = 9;
      node.maxLines = 2;
      fn(state);
      expect(state.node).to.deep.equal(node);
    });

    it('should line-break node if text fits on a single line but contains line-break characters', () => {
      node.text = '\n123456789';
      node.wordBreak = 'break-all';
      node.maxWidth = 100;
      node.maxLines = 2;
      fn(state);
      expect(state.node.children.length).to.equal(2);
    });
  });
});
