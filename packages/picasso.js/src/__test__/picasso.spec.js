import createElement from 'test-utils/mocks/element-mock';
import picasso from '../index';

describe('picasso.js', () => {
  const iface = [
    'component',
    'data',
    'formatter',
    'interaction',
    'renderer',
    'scale',
    'symbol'
  ];

  describe('api', () => {
    it('should expose the correct top-level API', () => {
      expect(typeof picasso).to.equal('function');
      expect(typeof picasso.use).to.equal('function');
      expect(typeof picasso.chart).to.equal('function');

      // registries
      iface.forEach((key) => {
        expect(typeof picasso[key]).to.equal('function');
        expect(typeof picasso[key].add).to.equal('function');
      });
    });
  });

  describe('use', () => {
    it('should expose registries to plugin API', () => {
      const plugin = sinon.stub();
      picasso.use(plugin);
      const firstParam = plugin.args[0][0];

      iface.forEach((key) => {
        expect(typeof firstParam[key]).to.equal('function');
        expect(typeof firstParam[key].add).to.equal('function');
      });
    });

    it('should expose logger', () => {
      const plugin = sinon.stub();
      picasso.use(plugin);
      const firstParam = plugin.args[0][0];

      expect(typeof firstParam.logger.log).to.equal('function');
    });
  });

  describe('config', () => {
    it('should set default renderer', () => {
      const pic = picasso({
        renderer: {
          prio: ['custom']
        }
      });
      expect(pic.renderer.default()).to.equal('custom');
    });

    it('should set default log level', () => {
      const pic = picasso({
        logger: {
          level: 3
        }
      });
      expect(pic.logger.level()).to.equal(3);
    });

    it('should inherit style', () => {
      const pic = picasso({
        style: {
          fill: 'red',
          stroke: 'green'
        }
      })({
        style: {
          fill: 'cyan'
        }
      });
      expect(pic.config().style.fill).to.equal('cyan');
      expect(pic.config().style.stroke).to.equal('green');
    });

    it('should extend palettes', () => {
      const pic = picasso({
        palettes: ['fancy']
      });
      expect(pic.config().palettes[3]).to.equal('fancy');
    });
  });

  describe('Chart lifecycle', () => {
    it('should call mounted function', () => {
      const mountedFn = sinon.stub();
      const element = createElement();

      picasso.chart({
        element,
        mounted: mountedFn
      });

      expect(mountedFn).to.have.been.calledWith(element);
    });

    it('should expose the element', () => {
      const element = createElement();
      const chart = picasso.chart({ element });
      expect(chart.element).to.equal(element);
    });

    it('should call updated function', () => {
      const updatedFn = sinon.stub();
      const element = createElement();

      const chart = picasso.chart({
        element,
        updated: updatedFn
      });
      chart.update({
        data: []
      });

      expect(updatedFn).to.have.been.called;
    });

    it('should bind event listener', () => {
      const clickFn = sinon.stub();
      const element = createElement();

      picasso.chart({
        element,
        on: {
          click: clickFn
        }
      });

      const e = {};
      element.trigger('click', e);
      expect(clickFn).to.have.been.calledWith(e);
    });

    it('should bind brush event listeners', () => {
      const element = createElement();
      const spy = sinon.spy(element, 'addEventListener');
      const matchFn = fnName => fn => fn.name === fnName;

      picasso.chart({
        element
      });

      expect(spy).to.have.been.calledWith('mousedown', sinon.match(matchFn('onTapDown'), 'function onTapDown'));
      expect(spy).to.have.been.calledWith('mouseup', sinon.match(matchFn('onBrushTap'), 'function onBrushTap'));
      expect(spy).to.have.been.calledWith('mousemove', sinon.match(matchFn('onBrushOver'), 'function onBrushOver'));
    });
  });
});
