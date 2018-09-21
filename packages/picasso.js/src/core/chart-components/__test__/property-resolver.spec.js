import { normalizeSettings, resolveForItem } from '../../../../src/core/chart-components/property-resolver';

describe('property-resolver', () => {
  describe('setting normalization', () => {
    it('should normalize primitives', () => {
      let norm = normalizeSettings({
        fill: 'red',
        doit: false,
        num: 0
      }, { fill: 'green', stroke: 'blue' });

      expect(norm).to.eql({
        fill: 'red',
        stroke: 'blue',
        doit: false,
        num: 0
      });
    });

    it('should not override defaults when type does not match', () => {
      let norm = normalizeSettings({
        fill: 3,
        show: 'yes',
        stroke: true
      }, { fill: 'green', stroke: 'blue', show: false });

      expect(norm).to.eql({
        fill: 'green',
        stroke: 'blue',
        show: false
      });
    });

    it('should normalize functions', () => {
      let fn = () => 'red';
      let norm = normalizeSettings({
        fill: fn
      }, { fill: 'green', stroke: 'blue' });

      expect(norm).to.eql({
        fill: { fn },
        stroke: 'blue'
      });
    });

    it('should normalize objects', () => {
      let fn = () => 'red';
      let norm = normalizeSettings({
        fill: {
          fn
        }
      }, { fill: 'green' });

      expect(norm).to.eql({
        fill: { fn }
      });
    });

    it('should attach scale', () => {
      const c = {
        scale: () => 'scaleInstance'
      };
      let norm = normalizeSettings({
        fill: {
          scale: 'foo'
        }
      }, { fill: 'green', stroke: 'blue' }, c);

      expect(norm).to.eql({
        fill: { scale: 'scaleInstance' },
        stroke: 'blue'
      });
    });

    it('should attach reference', () => {
      let norm = normalizeSettings({
        fill: {
          ref: 'foo'
        }
      }, { fill: 'green', stroke: 'blue' });

      expect(norm).to.eql({
        fill: { ref: 'foo' },
        stroke: 'blue'
      });
    });
  });

  describe('resolving', () => {
    it('should resolve constant value', () => {
      const normalized = {
        strokeWidth: 0
      };
      const resolved = resolveForItem({}, normalized);
      expect(resolved).to.eql({ strokeWidth: 0 });
    });
    it('should resolve fn callback', () => {
      const normalized = {
        strokeWidth: { fn: () => 1 }
      };
      const resolved = resolveForItem({}, normalized);
      expect(resolved).to.eql({ strokeWidth: 1 });
    });
    it('should resolve fn callback with context', () => {
      const normalized = {
        strokeWidth: {
          fn: function fn(b) { return b.scale(b.datum.tjocklek); },
          scale: v => v * 2
        }
      };
      const resolved = resolveForItem({ datum: { tjocklek: 3 } }, normalized);
      expect(resolved).to.eql({ strokeWidth: 6 });
    });

    it('should resolve fn callback with parameters', () => {
      const normalized = {
        strokeWidth: { ref: 'stroke', fn: d => d.datum.stroke.tjocklek }
      };
      const resolved = resolveForItem({ datum: { stroke: { tjocklek: 3 } } }, normalized);
      expect(resolved).to.eql({ strokeWidth: 3 });
    });
  });
});
