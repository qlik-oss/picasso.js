import { svgNs, creator, maintainer, destroyer } from '../../../../../src/web/renderer/svg-renderer/svg-nodes';

describe('svg-nodes', () => {
  it('should have the correct svg namespace', () => {
    expect(svgNs).to.equal('http://www.w3.org/2000/svg');
  });

  describe('creator', () => {
    it('should throw error when type is invalid', () => {
      expect(creator).to.throw(Error);
    });

    it('should create an element and append it to the parent', () => {
      const p = {
        ownerDocument: {
          createElementNS: sinon.stub().returns('candy')
        },
        appendChild: sinon.spy()
      };

      creator('magic', p);
      expect(p.ownerDocument.createElementNS).to.have.been.calledWithExactly(svgNs, 'magic');
      expect(p.appendChild).to.have.been.calledWithExactly('candy');
    });

    it('should return the created element', () => {
      const p = {
        ownerDocument: {
          createElementNS: sinon.stub().returns('candy')
        },
        appendChild: sinon.spy()
      };

      expect(creator('magic', p)).to.equal('candy');
    });

    it('should create a group element for type container', () => {
      const p = {
        ownerDocument: {
          createElementNS: sinon.stub().returns('candy')
        },
        appendChild: sinon.spy()
      };

      creator('container', p);
      expect(p.ownerDocument.createElementNS).to.have.been.calledWithExactly(svgNs, 'g');
    });
  });

  describe('destroyer', () => {
    it('should remove node from parent', () => {
      const el = {
        parentNode: {
          removeChild: sinon.spy()
        }
      };
      destroyer(el);
      expect(el.parentNode.removeChild).to.have.been.calledWithExactly(el);
    });

    it('should not throw error if parentNode is falsy', () => {
      const fn = () => {
        destroyer({});
      };
      expect(fn).to.not.throw();
    });
  });

  describe('maintainer', () => {
    it('should apply given attributes', () => {
      const el = {
        setAttribute: sinon.spy()
      };
      const item = {
        attrs: {
          cx: 13,
          fill: 'red'
        }
      };
      maintainer(el, item);
      expect(el.setAttribute.firstCall).to.have.been.calledWithExactly('cx', 13);
      expect(el.setAttribute.secondCall).to.have.been.calledWithExactly('fill', 'red');
    });

    it('should always append whites-space attribute to text nodes', () => {
      const el = {
        setAttribute: sinon.spy()
      };
      const item = {
        attrs: {
          text: 'Hello'
        }
      };
      maintainer(el, item);
      expect(el.setAttribute.firstCall).to.have.been.calledWithExactly('style', 'white-space: pre');
    });

    it('should ignore attributes id, type, children, and complex data objects', () => {
      const el = {
        setAttribute: sinon.spy()
      };
      const item = {
        id: 'a',
        data: {},
        type: 'a',
        children: 'a'
      };
      maintainer(el, item);
      expect(el.setAttribute.callCount).to.equal(0);
    });

    it('should set data attribute if data value is a primitive', () => {
      const el = {
        setAttribute: sinon.spy()
      };
      const item = {
        data: 'foo'
      };
      maintainer(el, item);
      expect(el.setAttribute).to.have.been.calledWith('data', 'foo');
    });

    it('should set data attributes if data object contains primitives', () => {
      const el = {
        setAttribute: sinon.spy()
      };
      const item = {
        data: {
          x: 123,
          label: 'etikett',
          really: true,
          complex: {}
        }
      };
      maintainer(el, item);
      expect(el.setAttribute.callCount).to.equal(3);
      expect(el.setAttribute.getCall(0)).to.have.been.calledWith('data-x', 123);
      expect(el.setAttribute.getCall(1)).to.have.been.calledWith('data-label', 'etikett');
      expect(el.setAttribute.getCall(2)).to.have.been.calledWith('data-really', true);
    });

    it('should always append dy attribute on text item', () => {
      const el = {
        setAttribute: sinon.spy(),
        getAttribute: () => 5
      };
      const item = {
        type: 'text',
        attrs: {
          dy: 10
        }
      };
      maintainer(el, item);

      expect(el.setAttribute.args[0]).to.deep.equal(['dy', 15]);
    });

    it('should transform dominant-baseline into dy attribute on text item', () => {
      const el = {
        setAttribute: sinon.spy(),
        getAttribute: () => 5
      };
      const item = {
        type: 'text',
        attrs: {
          'dominant-baseline': 'ideographic',
          'font-size': '10px'
        }
      };
      maintainer(el, item);

      expect(el.setAttribute.args[0]).to.deep.equal(['dy', 3]);
    });
  });
});
