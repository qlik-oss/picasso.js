import element from 'test-utils/mocks/element-mock';
import renderer from '../svg-renderer';

describe('svg renderer', () => {
  let sandbox, tree, ns, treeRenderer, svg, scene;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    treeRenderer = {
      render: sandbox.spy(),
    };
    scene = sandbox.stub();
    tree = sandbox.stub().returns(treeRenderer);
    ns = 'namespace';
    svg = renderer(tree, ns, scene);
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
      svg.appendTo(el);

      expect(svg.element().name).to.equal('namespace:svg');
      expect(svg.element().parentElement).to.equal(el);
    });

    it('should not create new root if it already exists', () => {
      let el = element('div'),
        el2 = element('div');
      svg.appendTo(el);
      const svgEl = svg.element();
      svg.appendTo(el2);

      expect(svg.element()).to.equal(svgEl);
    });

    it('should apply font smoothing', () => {
      const el = element('div');
      svg.appendTo(el);

      expect(svg.element().style['-webkit-font-smoothing']).to.equal('antialiased');
      expect(svg.element().style['-moz-osx-font-smoothing']).to.equal('antialiased');
    });
  });

  describe('render', () => {
    let items, s;

    beforeEach(() => {
      items = ['a'];
      s = { children: ['AA'] };
    });

    it('should not render before appending', () => {
      expect(svg.render()).to.equal(false);
    });

    it('should call tree creator with proper params', () => {
      scene.returns(s);
      svg.appendTo(element('div'));
      svg.render(items);
      const sceneContainer = {
        type: 'container',
        children: [...items, { type: 'defs', children: [] }],
        transform: '',
      };
      const actual = scene.args[0][0].items;
      delete actual[0].children[1].disabled;
      expect(actual).to.deep.equal([sceneContainer]);
      expect(treeRenderer.render).to.have.been.calledWith(s.children, svg.root());
    });

    it('should attach to given position in the container', () => {
      scene.returns(s);
      svg.appendTo(element('div'));
      svg.size({
        x: 50,
        y: 100,
        width: 200,
        height: 400,
        scaleRatio: { x: 1, y: 1 },
      });
      svg.render(items);

      const el = svg.element();
      expect(el.style.position).to.equal('absolute');
      expect(el.style.left).to.equal('50px');
      expect(el.style.top).to.equal('100px');
      expect(el.attributes.width).to.equal(200);
      expect(el.attributes.height).to.equal(400);
    });

    it('should scale from logical size to physical size', () => {
      const scaleRatio = { x: 2, y: 3 };
      const size = {
        x: 50,
        y: 100,
        width: 200,
        height: 400,
        scaleRatio,
      };
      const expectedInputShapes = [
        {
          type: 'container',
          children: [s],
          transform: `scale(${scaleRatio.x}, ${scaleRatio.y})`,
        },
      ];
      scene.returns(s);
      svg.appendTo(element('div'));
      svg.size(size);
      svg.render([s]);

      const wrappedContainer = scene.args[0][0].items;
      const el = svg.element();
      expect(el.style.left).to.equal(`${size.x * scaleRatio.x}px`);
      expect(el.style.top).to.equal(`${size.y * scaleRatio.y}px`);
      expect(el.attributes.width).to.equal(size.width * scaleRatio.x);
      expect(el.attributes.height).to.equal(size.height * scaleRatio.y);
      expect(wrappedContainer[0].type).to.equal(expectedInputShapes[0].type);
      expect(wrappedContainer[0].transform).to.deep.equal(expectedInputShapes[0].transform);
    });

    it('should handle call without arguments', () => {
      scene.returns(s);
      svg.appendTo(element('div'));
      expect(svg.render).to.not.throw();
    });

    it('should not render if scene and size has not changed', () => {
      svg.appendTo(element('div'));
      scene.returns({
        children: [],
        equals: () => true,
      });
      expect(svg.render()).to.equal(true);
      expect(svg.render()).to.equal(false);
    });
  });

  describe('clear', () => {
    it('should remove all elements', () => {
      svg.appendTo(element('div'));
      svg.root().appendChild(element('circle'));
      svg.root().appendChild(element('rect'));
      expect(svg.root().children.length).to.equal(2);

      svg.clear();

      expect(svg.root().children.length).to.equal(0);
    });

    it('should render if scene has been cleared', () => {
      svg.appendTo(element('div'));
      scene.returns({
        children: [],
        equals: () => true,
      });
      expect(svg.render()).to.equal(true);
      svg.clear();
      expect(svg.render()).to.equal(true);
    });
  });

  describe('destroy', () => {
    it('should detach root from its parent', () => {
      const parent = element('div');
      svg.appendTo(parent);
      expect(svg.element().parentElement).to.equal(parent);
      svg.destroy();

      expect(svg.element()).to.equal(null);
      expect(parent.children.length).to.equal(0);
    });

    it('should not throw error if root does not exist', () => {
      const fn = () => {
        svg.destroy();
      };
      expect(fn).to.not.throw();
    });
  });

  describe('itemsAt', () => {
    let items;

    beforeEach(() => {
      items = [
        {
          type: 'circle',
          cx: 138.2,
          cy: 80.1,
          r: 10.14121384712747,
          opacity: 0.0850144505610413,
          fill: '#440154',
          stroke: '#ccc',
          strokeWidth: 0,
        },
        {
          type: 'rect',
          x: 109.87669609109648,
          y: 131.87669609109648,
          width: 56.64660781780709,
          height: 56.64660781780709,
          opacity: 0.30146790367742315,
          fill: '#482979',
          stroke: '#ccc',
          strokeWidth: 0,
        },
      ];
      svg = renderer(tree, ns); // Don't mock the scene function
    });

    it('should return shapes at a point', () => {
      svg.appendTo(element('div'));
      svg.size({
        x: 100,
        y: 100,
        width: 400,
        height: 400,
      });
      svg.render(items);

      const shapes = svg.itemsAt({ x: 120, y: 135 });
      expect(shapes.length).to.equal(1);
    });

    /*
    it('should return shapes at a circle', () => {
      svg.appendTo(element('div'));
      svg.size({ x: 100, y: 100, width: 400, height: 400 });
      svg.render(items);

      const shapes = svg.itemsAt({ cx: 120, cy: 135, r: 3 });
      expect(shapes.length).to.equal(1);
    });
    */

    it('should return shapes at a line', () => {
      svg.appendTo(element('div'));
      svg.size({
        x: 100,
        y: 100,
        width: 400,
        height: 400,
      });
      svg.render(items);

      const shapes = svg.itemsAt({
        x1: 130,
        x2: 130,
        y1: 0,
        y2: 320,
      });
      expect(shapes.length).to.equal(2);
    });

    it('should return shapes at a rect', () => {
      svg.appendTo(element('div'));
      svg.size({
        x: 100,
        y: 100,
        width: 400,
        height: 400,
      });
      svg.render(items);

      const shapes = svg.itemsAt({
        x: 100,
        y: 100,
        width: 50,
        height: 50,
      });
      expect(shapes.length).to.equal(1);
    });
  });

  describe('size', () => {
    it('should return current size if no parameters are given', () => {
      svg.appendTo(element('div'));
      svg.size({
        x: 50,
        y: 100,
        width: 200,
        height: 400,
        scaleRatio: { x: 3, y: 4 },
        margin: { left: 5, top: 6 },
        edgeBleed: {
          left: 7,
          right: 8,
          top: 9,
          bottom: 10,
        },
      });
      expect(svg.size()).to.deep.equal({
        x: 50,
        y: 100,
        width: 200,
        height: 400,
        scaleRatio: { x: 3, y: 4 },
        margin: { left: 5, top: 6 },
        edgeBleed: {
          left: 7,
          right: 8,
          top: 9,
          bottom: 10,
          bool: true,
        },
        computedPhysical: {
          x: 134,
          y: 370,
          width: 645,
          height: 1676,
        },
      });
    });

    it('should ignore NaN values and fallback to default size value', () => {
      svg.size({
        x: undefined,
        y: undefined,
        width: undefined,
        height: undefined,
        scaleRatio: { x: undefined, y: undefined },
        margin: { left: undefined, top: undefined },
        edgeBleed: {
          left: undefined,
          right: undefined,
          top: undefined,
          bottom: undefined,
        },
      });
      expect(svg.size()).to.deep.equal({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        scaleRatio: { x: 1, y: 1 },
        margin: { left: 0, top: 0 },
        edgeBleed: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          bool: false,
        },
        computedPhysical: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
      });
    });
  });

  describe('setKey', () => {
    it('should set key attribute', () => {
      const el = element('div');
      const spy = sinon.spy(el, 'setAttribute');
      svg.element = () => el;
      svg.setKey(123);

      expect(spy).to.have.been.calledWith('data-key', 123);
    });
  });
});
