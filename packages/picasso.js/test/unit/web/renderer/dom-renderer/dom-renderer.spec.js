import element from 'test-utils/mocks/element-mock';
import renderer from '../../../../../src/web/renderer/dom-renderer/dom-renderer';

describe('dom renderer', () => {
  let sandbox;
  let rend;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    rend = renderer({
      createElement: element,
      createTextNode: text => text
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should be a function', () => {
    expect(renderer).to.be.a('function');
  });

  describe('appendTo', () => {
    it('should append root node to element', () => {
      const el = element('div');
      rend.appendTo(el);

      expect(rend.element().name).to.equal('div');
      expect(rend.element().parentElement).to.equal(el);
    });

    it('should not create new root if it already exists', () => {
      const el = element('div');
      const el2 = element('div');
      rend.appendTo(el);
      const rendEl = rend.element();
      rend.appendTo(el2);

      expect(rend.element()).to.equal(rendEl);
    });

    it('should apply font smoothing', () => {
      const el = element('div');
      rend.appendTo(el);

      expect(rend.element().style['-webkit-font-smoothing']).to.equal('antialiased');
      expect(rend.element().style['-moz-osx-font-smoothing']).to.equal('antialiased');
    });
  });

  describe('render', () => {
    /*
    let item;

    beforeEach(() => {
      item = h('div');
    });
    */

    it('should not render before appending', () => {
      expect(rend.render()).to.equal(false);
    });

    /*
    it('should attach to given position in the container', () => {
      rend.appendTo(element('div'));
      rend.size({ x: 50, y: 100, width: 200, height: 400, scaleRatio: { x: 1, y: 1 } });
      rend.render(item);

      const el = rend.element();
      expect(el.style.position).to.equal('absolute');
      expect(el.style.left).to.equal('50px');
      expect(el.style.top).to.equal('100px');
      expect(el.attributes.width).to.equal(200);
      expect(el.attributes.height).to.equal(400);
    });
    */
  });

  describe('clear', () => {
    it('should remove all elements', () => {
      rend.appendTo(element('div'));
      rend.root().appendChild(element('div'));
      rend.root().appendChild(element('span'));
      expect(rend.root().children.length).to.equal(2);

      rend.clear();

      expect(rend.root().children.length).to.equal(0);
    });
  });

  describe('destroy', () => {
    it('should detach root from its parent', () => {
      const parent = element('div');
      rend.appendTo(parent);
      expect(rend.element().parentElement).to.equal(parent);
      rend.destroy();

      expect(rend.element()).to.equal(null);
      expect(parent.children.length).to.equal(0);
    });

    it('should not throw error if root does not exist', () => {
      const fn = () => {
        rend.destroy();
      };
      expect(fn).to.not.throw();
    });
  });

  describe('size', () => {
    it('should return current size if no parameters are given', () => {
      rend.appendTo(element('div'));
      rend.size({
        x: 50, y: 100, width: 200, height: 400, scaleRatio: { x: 2, y: 3 }, margin: { top: 4, left: 5 }
      });
      expect(rend.size()).to.deep.equal({
        x: 50, y: 100, width: 200, height: 400, scaleRatio: { x: 2, y: 3 }, margin: { top: 4, left: 5 }
      });
    });

    it('should ignore NaN values and fallback to default size value', () => {
      rend.size({
        x: undefined, y: undefined, width: undefined, height: undefined, scaleRatio: { x: undefined, y: undefined }, margin: { top: undefined, left: undefined }
      });
      expect(rend.size()).to.deep.equal({
        x: 0, y: 0, width: 0, height: 0, scaleRatio: { x: 1, y: 1 }, margin: { top: 0, left: 0 }
      });
    });
  });
});
