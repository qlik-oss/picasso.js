import element from 'test-utils/mocks/element-mock';

describe('canvas renderer', () => {
  let sandbox, r, scene, mockedCanvasBuffer, renderer;
  const mock = () =>
    aw.mock([['**/canvas-buffer.js', () => sinon.stub().returns(mockedCanvasBuffer)]], ['../canvas-renderer']);

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    scene = sandbox.stub();
    mockedCanvasBuffer = {
      updateSize: sinon.spy(),
      apply: sinon.spy(),
      clear: sinon.spy(),
      getContext: sinon.spy(),
    };

    renderer = mock()[0].renderer;
    r = renderer(scene);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should set rendererSettings correctly', () => {
    const rendererSettings = {
      transform: () => {},
      canvasBufferSize: { width: 1000, height: 600 },
      irrelevantSetting: 'irrelevant!',
    };
    r.settings(rendererSettings);
    expect(r.settings()).to.eql({
      transform: rendererSettings.transform,
      canvasBufferSize: rendererSettings.canvasBufferSize,
    });
  });

  it('should append canvas element', () => {
    const div = element('div');
    const spy = sandbox.spy(div, 'appendChild');
    r.appendTo(div);
    expect(spy.args[0][0].name).to.equal('canvas');
  });

  it('should on appendTo apply font smoothing', () => {
    scene.returns({ children: [] });
    r.appendTo(element('div'));

    const el = r.element();
    expect(el.style['-webkit-font-smoothing']).to.equal('antialiased');
    expect(el.style['-moz-osx-font-smoothing']).to.equal('antialiased');
  });

  it('should not render when canvas does not exist', () => {
    expect(r.render()).to.equal(false);
  });

  it('should render when canvas exists', () => {
    r.appendTo(element('div'));
    scene.returns({ children: [] });
    expect(r.render()).to.equal(true);
  });

  it('should set transform and apply buffer if transform is provided', () => {
    const rendererSettings = {
      transform: () => ({ a: 1, b: 0, c: 1, d: 0, e: 100, f: 100 }),
    };
    r.settings(rendererSettings);
    r.appendTo(element('div'));
    const targetCtx = r.element().getContext('2d');
    targetCtx.webkitBackingStorePixelRatio = 0.5;
    r.render();
    expect(targetCtx.setTransform).to.have.been.calledWith(1, 0, 1, 0, 200, 200);
    expect(mockedCanvasBuffer.apply).to.have.been.calledOnce;
  });

  it('should apply buffer but not set transform when transform func returns falsy value', () => {
    const rendererSettings = {
      transform: () => false,
    };
    r.settings(rendererSettings);
    r.appendTo(element('div'));
    scene.returns({
      children: [],
      equals: () => true,
    });
    const targetCtx = r.element().getContext('2d');
    r.render();
    expect(targetCtx.setTransform).to.not.have.been.called;
    expect(mockedCanvasBuffer.apply).to.have.been.calledOnce;
  });

  it('should not render if scene and size has not changed', () => {
    r.appendTo(element('div'));
    scene.returns({
      children: [],
      equals: () => true,
    });
    expect(r.render()).to.equal(true);
    expect(r.render()).to.equal(false);
  });

  it('should render if scene has been cleared', () => {
    r.appendTo(element('div'));
    scene.returns({
      children: [],
      equals: () => true,
    });
    expect(r.render()).to.equal(true);
    r.clear();
    expect(r.render()).to.equal(true);
  });

  it('should return zero size when canvas is not initiated', () => {
    expect(r.size()).to.deep.equal({
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

  it('should return size when called', () => {
    r.size({
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
    expect(r.size()).to.deep.equal({
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
    r.size({
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
    expect(r.size()).to.deep.equal({
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

  it('should update buffer size correctly', () => {
    const rendererSettings = {
      transform: () => false,
      canvasBufferSize: () => ({ width: 1000, height: 600 }),
    };
    r.settings(rendererSettings);
    r.appendTo(element('div'));
    scene.returns({
      children: [],
      equals: () => true,
    });
    r.size({
      x: 50,
      y: 100,
      width: 200,
      height: 400,
    });
    const rect = r.size();
    const targetCtx = r.element().getContext('2d');
    targetCtx.webkitBackingStorePixelRatio = 0.5;
    r.render();
    expect(mockedCanvasBuffer.updateSize).to.have.been.calledWith({
      rect,
      dpiRatio: 2,
      canvasBufferSize: rendererSettings.canvasBufferSize,
    });
  });

  it('should attach to given position in the container', () => {
    scene.returns({ children: [] });
    r.appendTo(element('div'));
    r.size({
      x: 50,
      y: 100,
      width: 200,
      height: 400,
    });
    r.render();

    const el = r.element();
    expect(el.style.position).to.equal('absolute');
    expect(el.style.left).to.equal('50px');
    expect(el.style.top).to.equal('100px');
    expect(el.style.width).to.equal('200px');
    expect(el.style.height).to.equal('400px');
    expect(el.width).to.equal(200);
    expect(el.height).to.equal(400);
  });

  it('should detach from parent element when destoyed', () => {
    const div = element('div');
    r.appendTo(div);
    expect(div.children.length).to.equal(1);
    r.destroy();
    expect(div.children.length).to.equal(0);
  });

  describe('setKey', () => {
    it('should set key attribute', () => {
      const div = element('div');
      const spy = sandbox.spy(div, 'setAttribute');
      r.element = () => div;
      r.setKey('myKey');
      expect(spy).have.been.calledWith('data-key', 'myKey');
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
      r = renderer(); // Don't mock the scene
    });

    it('should return shapes at a point', () => {
      r.appendTo(element('div'));
      r.size({
        x: 100,
        y: 100,
        width: 400,
        height: 400,
      });
      r.render(items);

      const shapes = r.itemsAt({ x: 120, y: 135 });
      expect(shapes.length).to.equal(1);
    });

    /*
    it('should return shapes at a circle', () => {
      r.appendTo(element('div'));
      r.size({ x: 100, y: 100, width: 400, height: 400 });
      r.render(items);

      const shapes = r.itemsAt({ cx: 120, cy: 135, r: 3 });
      expect(shapes.length).to.equal(1);
    });
    */

    it('should return shapes at a line', () => {
      r.appendTo(element('div'));
      r.size({
        x: 100,
        y: 100,
        width: 400,
        height: 400,
      });
      r.render(items);

      const shapes = r.itemsAt({
        x1: 130,
        x2: 130,
        y1: 0,
        y2: 320,
      });
      expect(shapes.length).to.equal(2);
    });

    it('should return shapes at a rect', () => {
      r.appendTo(element('div'));
      r.size({
        x: 100,
        y: 100,
        width: 400,
        height: 400,
      });
      r.render(items);

      const shapes = r.itemsAt({
        x: 100,
        y: 100,
        width: 50,
        height: 50,
      });
      expect(shapes.length).to.equal(1);
    });
  });

  it('should scale canvas to adjust for HiDPI screens', () => {
    const div = element('div');
    const inputShapes = [{ type: 'container' }];
    const expectedInput = {
      items: [
        {
          type: 'container',
          children: inputShapes,
          transform: 'scale(0.5, 0.5)',
        },
      ],
      dpi: 0.5,
    };
    scene.returns({ children: [] });
    r.appendTo(div);
    r.size({
      x: 50,
      y: 100,
      width: 200,
      height: 400,
    });

    const ctxStub = sandbox.stub(div.children[0], 'getContext');
    ctxStub.returns({ webkitBackingStorePixelRatio: 2 });

    r.render(inputShapes);

    expect(r.element().style.width).to.equal('200px');
    expect(r.element().style.height).to.equal('400px');
    expect(r.element().width).to.equal(200 * (1 / 2));
    expect(r.element().height).to.equal(400 * (1 / 2));
    expect(scene.args[0][0].items).to.deep.equal(expectedInput.items);
  });

  it('should apply a scale ratio', () => {
    const div = element('div');
    const scaleRatio = { x: 2, y: 3 };
    const size = {
      x: 50,
      y: 100,
      width: 200,
      height: 400,
      scaleRatio,
    };
    const inputShapes = [{ type: 'container' }];
    const expectedInputShapes = {
      items: [
        {
          type: 'container',
          children: inputShapes,
          transform: `scale(${scaleRatio.x}, ${scaleRatio.y})`,
        },
      ],
      dpi: 1,
    };
    scene.returns({ children: [] });
    r.appendTo(div);
    r.size(size);

    r.render(inputShapes);

    const el = r.element();
    expect(el.style.width).to.equal(`${size.width * scaleRatio.x}px`);
    expect(el.style.height).to.equal(`${size.height * scaleRatio.y}px`);
    expect(el.style.left).to.equal(`${size.x * scaleRatio.x}px`);
    expect(el.style.top).to.equal(`${size.y * scaleRatio.y}px`);
    expect(el.width).to.equal(size.width * scaleRatio.x);
    expect(el.height).to.equal(size.height * scaleRatio.y);
    expect(scene.args[0][0].items).to.deep.equal(expectedInputShapes.items);
  });

  it('should account for screen dpi when applying scale ratio', () => {
    const div = element('div');
    const scaleRatio = { x: 2, y: 3 };
    const dpiScale = 2;
    const size = {
      x: 50,
      y: 100,
      width: 200,
      height: 400,
      scaleRatio,
    };
    const inputShapes = [{ type: 'container' }];
    const expectedInputShapes = {
      items: [
        {
          type: 'container',
          children: inputShapes,
          transform: `scale(${scaleRatio.x * dpiScale}, ${scaleRatio.y * dpiScale})`,
        },
      ],
      dpi: dpiScale,
    };
    scene.returns({ children: [] });
    r.appendTo(div);
    r.size(size);

    const ctxStub = sandbox.stub(div.children[0], 'getContext');
    ctxStub.returns({ webkitBackingStorePixelRatio: 0.5 });

    r.render(inputShapes);

    const el = r.element();
    expect(el.style.width).to.equal(`${size.width * scaleRatio.x}px`);
    expect(el.style.height).to.equal(`${size.height * scaleRatio.y}px`);
    expect(el.style.left).to.equal(`${size.x * scaleRatio.x}px`);
    expect(el.style.top).to.equal(`${size.y * scaleRatio.y}px`);
    expect(el.width).to.equal(size.width * scaleRatio.x * dpiScale);
    expect(el.height).to.equal(size.height * scaleRatio.y * dpiScale);
    expect(scene.args[0][0].items).to.deep.equal(expectedInputShapes.items);
  });
});
