import { svgNs, creator, maintainer, destroyer } from '../svg-nodes';

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
          createElementNS: vi.fn().mockReturnValue('candy'),
        },
        appendChild: vi.fn(),
      };

      creator('magic', p);
      expect(p.ownerDocument.createElementNS).toHaveBeenCalledWith(svgNs, 'magic');
      expect(p.appendChild).toHaveBeenCalledWith('candy');
    });

    it('should return the created element', () => {
      const p = {
        ownerDocument: {
          createElementNS: vi.fn().mockReturnValue('candy'),
        },
        appendChild: vi.fn(),
      };

      expect(creator('magic', p)).to.equal('candy');
    });

    it('should create a group element for type container', () => {
      const p = {
        ownerDocument: {
          createElementNS: vi.fn().mockReturnValue('candy'),
        },
        appendChild: vi.fn(),
      };

      creator('container', p);
      expect(p.ownerDocument.createElementNS).toHaveBeenCalledWith(svgNs, 'g');
    });
  });

  describe('destroyer', () => {
    it('should remove node from parent', () => {
      const el = {
        parentNode: {
          removeChild: vi.fn(),
        },
      };
      destroyer(el);
      expect(el.parentNode.removeChild).toHaveBeenCalledWith(el);
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
        setAttribute: vi.fn(),
      };
      const item = {
        attrs: {
          cx: 13,
          fill: 'red',
        },
      };
      maintainer(el, item);
      expect(el.setAttribute.mock.calls[0]).toEqual(['cx', 13]);
      expect(el.setAttribute.mock.calls[1]).toEqual(['fill', 'red']);
    });

    it('should always append whites-space attribute to text nodes', () => {
      const el = {
        setAttribute: vi.fn(),
      };
      const item = {
        attrs: {
          text: 'Hello',
        },
      };
      maintainer(el, item);
      expect(el.setAttribute.mock.calls[0]).toEqual(['style', 'white-space: pre']);
    });

    it('should ignore attributes id, type, children, and complex data objects', () => {
      const el = {
        setAttribute: vi.fn(),
      };
      const item = {
        id: 'a',
        data: {},
        type: 'a',
        children: 'a',
      };
      maintainer(el, item);
      expect(el.setAttribute.mock.calls.length).to.equal(0);
    });

    it('should set data attribute if data value is a primitive', () => {
      const el = {
        setAttribute: vi.fn(),
      };
      const item = {
        data: 'foo',
      };
      maintainer(el, item);
      expect(el.setAttribute).toHaveBeenCalledWith('data', 'foo');
    });

    it('should set data attributes if data object contains primitives', () => {
      const el = {
        setAttribute: vi.fn(),
      };
      const item = {
        data: {
          x: 123,
          label: 'etikett',
          really: true,
          complex: {},
        },
      };
      maintainer(el, item);
      expect(el.setAttribute.mock.calls.length).to.equal(3);
      expect(el.setAttribute.mock.calls[0]).toEqual(['data-x', 123]);
      expect(el.setAttribute.mock.calls[1]).toEqual(['data-label', 'etikett']);
      expect(el.setAttribute.mock.calls[2]).toEqual(['data-really', true]);
    });

    it('should always append dy attribute on text item', () => {
      const el = {
        setAttribute: vi.fn(),
        getAttribute: () => 5,
      };
      const item = {
        type: 'text',
        attrs: {
          dy: 10,
          x: 0,
          y: 0,
        },
      };
      maintainer(el, item);

      expect(el.setAttribute.mock.calls[0]).to.deep.equal(['dy', 15]);
    });

    it('should transform dominant-baseline into dy attribute on text item', () => {
      const el = {
        setAttribute: vi.fn(),
        getAttribute: () => 5,
      };
      const item = {
        type: 'text',
        attrs: {
          'dominant-baseline': 'ideographic',
          'font-size': '10px',
          x: 0,
          y: 0,
        },
      };
      maintainer(el, item);

      expect(el.setAttribute.mock.calls[0]).to.deep.equal(['dy', 3]);
    });

    it('should append a title element on text item with the title attribute', () => {
      const titleElm = {};
      const el = {
        setAttribute: vi.fn(),
        getAttribute: () => 5,
        ownerDocument: {
          createElementNS: () => titleElm,
        },
        appendChild: vi.fn(),
      };
      const item = {
        type: 'text',
        attrs: {
          title: 'my title',
          x: 0,
          y: 0,
        },
      };
      maintainer(el, item);

      expect(el.appendChild).toHaveBeenCalledWith(titleElm);
      expect(titleElm.textContent).to.equal('my title');
    });

    describe('should ignore item with "NaN" attributes', () => {
      let el;
      let circle;
      let rect;
      let line;
      let text;

      beforeEach(() => {
        el = {
          setAttribute: vi.fn(),
        };

        circle = {
          type: 'circle',
          attrs: { cx: 1, cy: 1, r: 1 },
        };

        rect = {
          type: 'rect',
          attrs: { x: 1, y: 1, width: 1, height: 1 },
        };

        line = {
          type: 'line',
          attrs: { x1: 1, y1: 1, x2: 1, y2: 1 },
        };

        text = {
          type: 'text',
          attrs: { x: 1, y: 1 },
        };
      });

      ['cx', 'cy', 'r'].forEach((attr) => {
        it(`circle - ${attr}`, () => {
          circle.attrs[attr] = NaN;

          maintainer(el, circle);
          expect(el.setAttribute).not.toHaveBeenCalled();
        });
      });

      ['x', 'y', 'width', 'height'].forEach((attr) => {
        it(`rect - ${attr}`, () => {
          rect.attrs[attr] = NaN;

          maintainer(el, rect);
          expect(el.setAttribute).not.toHaveBeenCalled();
        });
      });

      ['x1', 'y1', 'x2', 'y2'].forEach((attr) => {
        it(`line - ${attr}`, () => {
          line.attrs[attr] = NaN;

          maintainer(el, line);
          expect(el.setAttribute).not.toHaveBeenCalled();
        });
      });

      ['x', 'y'].forEach((attr) => {
        it(`text - ${attr}`, () => {
          text.attrs[attr] = NaN;

          maintainer(el, text);
          expect(el.setAttribute).not.toHaveBeenCalled();
        });
      });
    });
  });
});
