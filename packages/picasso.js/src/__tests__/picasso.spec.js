import createElement from 'test-utils/mocks/element-mock';
import picasso from '..';

describe('picasso.js', () => {
  const iface = ['component', 'data', 'formatter', 'interaction', 'renderer', 'scale', 'symbol'];

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
      const plugin = vi.fn();
      picasso.use(plugin);
      const firstParam = plugin.mock.calls[0][0];

      iface.forEach((key) => {
        expect(typeof firstParam[key]).to.equal('function');
        expect(typeof firstParam[key].add).to.equal('function');
      });
    });

    it('should expose logger', () => {
      const plugin = vi.fn();
      picasso.use(plugin);
      const firstParam = plugin.mock.calls[0][0];

      expect(typeof firstParam.logger.log).to.equal('function');
    });
  });

  describe('config', () => {
    it('should set default renderer', () => {
      const pic = picasso({
        renderer: {
          prio: ['custom'],
        },
      });
      expect(pic.renderer.default()).to.equal('custom');
    });

    it('should set default log level', () => {
      const pic = picasso({
        logger: {
          level: 3,
        },
      });
      expect(pic.logger.level()).to.equal(3);
    });

    it('should inherit style', () => {
      const pic = picasso({
        style: {
          fill: 'red',
          stroke: 'green',
        },
      })({
        style: {
          fill: 'cyan',
        },
      });
      expect(pic.config().style.fill).to.equal('cyan');
      expect(pic.config().style.stroke).to.equal('green');
    });

    it('should extend palettes', () => {
      const pic = picasso({
        palettes: ['fancy'],
      });
      expect(pic.config().palettes[3]).to.equal('fancy');
    });
  });

  describe('Chart lifecycle', () => {
    it('should call mounted function', () => {
      const mountedFn = vi.fn();
      const element = createElement();

      picasso.chart({
        element,
        mounted: mountedFn,
      });

      expect(mountedFn).toHaveBeenCalledWith(element);
    });

    it('should expose the element', () => {
      const element = createElement();
      const chart = picasso.chart({ element });
      expect(chart.element).to.equal(element);
    });

    it('should call updated function', () => {
      const updatedFn = vi.fn();
      const element = createElement();

      const chart = picasso.chart({
        element,
        updated: updatedFn,
      });
      chart.update({
        data: [],
      });

      expect(updatedFn).toHaveBeenCalled();
    });

    it('should bind event listener', () => {
      const clickFn = vi.fn();
      const element = createElement();

      picasso.chart({
        element,
        on: {
          click: clickFn,
        },
      });

      const e = {};
      element.trigger('click', e);
      expect(clickFn).toHaveBeenCalledWith(e);
    });

    it('should bind brush event listeners', () => {
      const element = createElement();
      const spy = vi.spyOn(element, 'addEventListener');
      const matchFn = (fnName) => (fn) => fn.name === fnName;

      picasso.chart({
        element,
      });

      expect(spy.mock.calls.some(([event, handler]) => event === 'mousedown' && matchFn('onTapDown')(handler))).toBe(
        true,
      );
      expect(spy.mock.calls.some(([event, handler]) => event === 'mouseup' && matchFn('onBrushTap')(handler))).toBe(
        true,
      );
      expect(spy.mock.calls.some(([event, handler]) => event === 'mousemove' && matchFn('onBrushOver')(handler))).toBe(
        true,
      );
    });
  });
});
