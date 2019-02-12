import componentFactory from '../component-factory';

describe('Component', () => {
  let definition;
  let created;
  let beforeMount;
  let mounted;
  let beforeRender;
  let render;
  let beforeUpdate;
  let updated;
  let resize;
  let chart;
  let renderer;

  beforeEach(() => {
    chart = {
      brush: () => ({
        on: () => {}
      }),
      container: () => ({}),
      table: () => ({}),
      dataset: () => ({}),
      scale: sinon.stub(),
      logger: () => 'logger'
    };
    created = sinon.spy();
    beforeMount = sinon.spy();
    mounted = sinon.spy();
    beforeRender = sinon.spy();
    render = sinon.spy();
    beforeUpdate = sinon.spy();
    updated = sinon.spy();
    resize = sinon.spy();
    definition = {
      defaultSettings: {
        dock: 'top',
        style: {
          strokeWidth: 5
        },
        key1: 'value1'
      },
      created,
      beforeMount,
      mounted,
      beforeRender,
      render,
      resize,
      beforeUpdate,
      updated
    };
    renderer = {
      appendTo: () => {},
      render: () => ({}),
      destroy: () => ({}),
      size: s => s,
      element: () => 'elm'
    };
  });

  function createAndRenderComponent(config) {
    const instance = componentFactory(definition, {
      settings: config,
      chart,
      renderer,
      theme: {
        palette: sinon.stub(),
        style: sinon.stub()
      }
    });
    instance.beforeMount();
    instance.resize({}, {});
    instance.beforeRender();
    instance.render();
    instance.mounted();
    return instance;
  }

  describe('require', () => {
    it('should be able to require symbol factory', () => {
      const opts = {
        settings: {},
        chart,
        renderer,
        theme: {
          palette: sinon.stub(),
          style: sinon.stub()
        }
      };

      let fn;

      definition = {
        defaultSettings: {},
        created() {
          fn = this.symbol;
        }
      };

      componentFactory(definition, opts);

      expect(fn).to.equal(undefined);

      definition.require = ['symbol'];

      componentFactory(definition, opts);

      expect(fn).to.be.a('Function');
    });
  });

  it('should call lifecycle methods with correct context when rendering', () => {
    /* const config = {
      key1: 'override',
      key2: false
    };
    const expectedContext = {
      settings: {s
        dock: 'top',
        style: {
          strokeWidth: 5
        },
        key1: 'override',
        key2: false
      },
      data: []
    }; */

    createAndRenderComponent();

    expect(created).to.have.been.calledOnce;
    expect(resize).to.have.been.calledOnce;
    expect(beforeRender).to.have.been.calledOnce;
    expect(render).to.have.been.calledOnce;
    expect(resize).to.have.been.calledOnce;
    expect(mounted).to.have.been.calledOnce;
  });

  it('should call lifecycle methods with correct context when updating', () => {
    const instance = createAndRenderComponent();
    instance.set();
    instance.beforeUpdate();
    instance.resize({}, {});
    instance.beforeRender();
    instance.render();
    instance.updated();

    expect(mounted).to.have.been.calledOnce;
    expect(beforeRender).to.have.been.calledTwice;
    expect(beforeUpdate).to.have.been.calledOnce;
    expect(updated).to.have.been.calledOnce;
    expect(render).to.have.been.calledTwice;
  });

  describe('emits', () => {
    it('should have an empty emit function when rendering', () => {
      const instance = createAndRenderComponent();
      expect(instance.ctx.emit).to.be.a('function');
    });

    it('should have an empty emit function when updating', () => {
      const instance = createAndRenderComponent();
      instance.set();
      instance.beforeUpdate();
      instance.resize({}, {});
      instance.beforeRender();
      instance.render();
      instance.updated();

      expect(instance.ctx.emit).to.be.a('function');
    });

    it('should have an empty emit function when destroying', () => {
      const instance = createAndRenderComponent();
      instance.set();
      instance.destroy();

      expect(instance.ctx.emit).to.be.a('function');
    });
  });

  /*
  it('should call lifecycle methods with correct context when updating with partial data', () => {
  });
  */

  describe('findShapes', () => {
    let instance;
    let config;
    let shapes;

    beforeEach(() => {
      shapes = [{ data: 0 }, { data: 1 }, { data: 2 }];
      renderer.findShapes = () => shapes;
      config = {
        key: 'myKey'
      };

      instance = createAndRenderComponent(config);
    });

    it('should return matching shapes', () => {
      const s = instance.findShapes('*');

      expect(s).to.deep.equal([
        { data: 0, key: 'myKey', element: 'elm' },
        { data: 1, key: 'myKey', element: 'elm' },
        { data: 2, key: 'myKey', element: 'elm' }
      ]);
    });
  });

  describe('shapesAt', () => {
    let instance;
    let config;
    let shapes;

    beforeEach(() => {
      shapes = [
        { node: { data: 0 } },
        { node: { data: 1 } },
        { node: { data: 2 } }
      ];
      renderer.itemsAt = () => shapes;
      config = {
        key: 'myKey'
      };

      instance = createAndRenderComponent(config);
    });

    it('should return matching shapes', () => {
      const s = instance.shapesAt({ x: 0, y: 0 }); // Input doesn't matter as output is mocked

      expect(s).to.deep.equal([
        { data: 0, key: 'myKey', element: 'elm' },
        { data: 1, key: 'myKey', element: 'elm' },
        { data: 2, key: 'myKey', element: 'elm' }
      ]);
    });

    it('propagation option should return last shape', () => {
      // Last shape is the shape that is visibly "on top"
      const s = instance.shapesAt({ x: 0, y: 0 }, { propagation: 'stop' });

      expect(s).to.deep.equal([
        { data: 2, key: 'myKey', element: 'elm' }
      ]);
    });
  });

  describe('getBrushedShapes', () => {
    let instance;
    let config;
    let shapes;

    beforeEach(() => {
      shapes = [{ data: 0 }, { data: 1 }, { data: 2 }];
      renderer.findShapes = () => shapes;
      chart.brush = () => ({ containsMappedData: d => d === 1 || d === 2 });
      config = {
        key: 'myKey',
        brush: {
          consume: [
            {
              context: 'test'
            }
          ]
        }
      };

      instance = createAndRenderComponent(config);
    });

    it('should only return shapes within the same context', () => {
      const rNoMatch = instance.getBrushedShapes('unknown');
      expect(rNoMatch).to.be.empty;

      const rMatch = instance.getBrushedShapes('test');
      expect(rMatch).to.deep.equal([
        { data: 1, key: 'myKey', element: 'elm' },
        { data: 2, key: 'myKey', element: 'elm' }
      ]);
    });

    it('should not return duplicate shapes', () => {
      // Config two brush listeners on the same context
      config.brush.consume.push({ context: 'test' });

      instance = createAndRenderComponent(config);
      expect(instance.getBrushedShapes('test')).to.deep.equal([
        { data: 1, key: 'myKey', element: 'elm' },
        { data: 2, key: 'myKey', element: 'elm' }
      ]);
    });

    it('should use data props parameter if submitted', () => {
      shapes.forEach((s, i) => {
        s.data = { x: i };
      });
      const spy = sinon.spy();
      chart.brush = () => ({
        containsMappedData: spy
      });

      instance = createAndRenderComponent(config);
      instance.getBrushedShapes('test', 'xor', ['x']);
      expect(spy).to.have.been.calledWith({ x: 0 }, ['x'], 'xor');
    });

    it('should fallback to brush data property if data props parameter is omitted', () => {
      shapes.forEach((s, i) => {
        s.data = { x: i };
      });
      const spy = sinon.spy();
      chart.brush = () => ({
        containsMappedData: spy
      });

      config.brush.consume = [{ context: 'test', data: ['x'] }];

      instance = createAndRenderComponent(config);
      instance.getBrushedShapes('test', 'xor');
      expect(spy).to.have.been.calledWith({ x: 0 }, ['x'], 'xor');
    });
  });
});
