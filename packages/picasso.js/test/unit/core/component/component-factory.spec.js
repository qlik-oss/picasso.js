import componentFactory from '../../../../src/core/component/component-factory';

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
      scale: sinon.stub()
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
      size: () => {}
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
    instance.resize({});
    instance.beforeRender();
    instance.render();
    instance.mounted();
    return instance;
  }

  it('should call lifecycle methods with correct context when rendering', () => {
    /* const config = {
      key1: 'override',
      key2: false
    };
    const expectedContext = {
      settings: {
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
    instance.resize();
    instance.beforeRender();
    instance.render();
    instance.updated();

    expect(mounted).to.have.been.calledOnce;
    expect(beforeRender).to.have.been.calledTwice;
    expect(beforeUpdate).to.have.been.calledOnce;
    expect(updated).to.have.been.calledOnce;
    expect(render).to.have.been.calledTwice;
  });

  /*
  it('should call lifecycle methods with correct context when updating with partial data', () => {
  });
  */

  describe('getBrushedShapes', () => {
    let instance;
    let config;
    let shapes;

    beforeEach(() => {
      shapes = [{ data: 0 }, { data: 1 }, { data: 2 }];
      renderer.findShapes = () => shapes;
      chart.brush = () => ({ containsMappedData: d => d === 1 || d === 2 });
      config = {
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
      expect(rMatch).to.deep.equal([{ data: 1 }, { data: 2 }]);
    });

    it('should not return duplicate shapes', () => {
      // Config two brush listeners on the same context
      config.brush.consume.push({ context: 'test' });

      instance = createAndRenderComponent(config);
      expect(instance.getBrushedShapes('test')).to.deep.equal([{ data: 1 }, { data: 2 }]);
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

  describe('getState', () => {
    let instance;
    let state;

    it('should by default return an empty state', () => {
      instance = createAndRenderComponent({});
      state = instance.ctx.getState;
      expect(state).to.deep.equal({});
    });

    it('should return definition state', () => {
      definition.getState = () => ({ a: 1 });
      instance = createAndRenderComponent({});
      state = instance.ctx.getState;
      expect(state).to.deep.equal({ a: 1 });
    });

    it('should not be exposed on definition context', () => {
      definition.getState = () => ({ a: 1 });
      instance = createAndRenderComponent({});
      state = instance.def.getState;
      expect(state = instance.def.getState).to.be.undefined;
    });
  });
});
