import brush, { toggle, set } from '../brush';

describe('brush', () => {
  const noop = () => {};
  let sandbox;
  let vc;
  let vcf;
  let rc;
  let rcf;
  let b;
  beforeAll(() => {
    sandbox = vi;
    // mock value collection
    vc = () => {};
    vc.add = vi.fn();
    vc.values = vi.fn();
    vcf = () => vc;

    // mock range collection
    rc = () => {};
    rc.add = vi.fn();
    rc.containsValue = vi.fn();
    rcf = () => rc;
  });

  beforeEach(() => {
    b = brush({ vc: vcf, rc: rcf });
    b.addKeyAlias('_aliased', 'region');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('api', () => {
    it('should be a factory function', () => {
      expect(brush).to.be.a('function');
    });
  });

  describe('events', () => {
    it('should emit a start event with parameters when started', () => {
      const cb = vi.fn();
      b.on('start', cb);
      b.start(1, '2', false);
      expect(cb).toHaveBeenCalledWith(1, '2', false);
    });

    it('should not emit a start event when alredy started', () => {
      const cb = vi.fn();
      b.on('start', cb);
      b.start();
      b.start();
      b.start();
      expect(cb.mock.calls.length).to.equal(1);
    });

    it('should emit an end event with parameters when ended', () => {
      const cb = vi.fn();
      b.on('end', cb);
      b.start();
      b.end(1, '2', false);
      expect(cb).toHaveBeenCalledWith(1, '2', false);
      b.end();
      expect(cb.mock.calls.length).to.equal(1);
    });

    it('should be active when started', () => {
      expect(b.isActive()).to.equal(false);
      b.start();
      expect(b.isActive()).to.equal(true);
      b.end();
      expect(b.isActive()).to.equal(false);
    });

    it('should emit an "update" event when state changes', () => {
      const cb = vi.fn();
      b.on('update', cb);
      vc.add.mockReturnValue(true);
      b.addValues([
        { key: 'products', value: 'cars' },
        { key: '_aliased', value: 'sweden' },
      ]);
      expect(cb).toHaveBeenCalledWith(
        [
          { id: 'products', values: ['cars'] },
          { id: 'region', values: ['sweden'] },
        ],
        [],
      );
    });
  });

  describe('brushes', () => {
    it('should return all created brushes', () => {
      b.addValue('products');
      b.addRange('sales');
      b.addRange('_aliased');
      expect(b.brushes()).to.eql([
        { type: 'range', id: 'sales', brush: rc },
        { type: 'range', id: 'region', brush: rc },
        { type: 'value', id: 'products', brush: vc },
      ]);
    });

    it('should return empty after brush is ended', () => {
      b.addValue('products');
      b.addRange('sales');
      expect(b.brushes().length).to.eql(2);
      b.end();
      expect(b.brushes().length).to.eql(0);
    });
  });

  describe('addValue', () => {
    let v;
    let vcc;
    let bb;
    beforeEach(() => {
      v = {
        add: vi.fn(),
        values: vi.fn(),
      };
      vcc = vi.fn().mockReturnValue(v);
      bb = brush({ vc: vcc, rc: noop });
    });

    it('should call value.add() with value "Car"', () => {
      bb.addValue('garage', 'Car');
      expect(vcc.mock.calls.length).to.equal(1);
      expect(v.add).toHaveBeenCalledWith('Car');
    });

    it('should not create more than one instance per id', () => {
      bb.addValue('garage', 'Car');
      bb.addValue('garage', 'Bike');
      expect(vcc.mock.calls.length).to.equal(1);
    });

    it('should emit "start" event if not activated', () => {
      const cb = vi.fn();
      bb.on('start', cb);
      v.add.mockReturnValue(true);
      bb.addValue('garage', 'Car');
      bb.addValue('garage', 'Bike');
      expect(cb.mock.calls.length).to.equal(1);
    });

    it('should emit "update" event when state changes', () => {
      const cb = vi.fn();
      v.add.mockReturnValue(true);
      bb.on('update', cb);
      bb.addValue('garage', 'Car');
      expect(cb.mock.calls.length).to.equal(1);
    });

    it('should not emit "update" event when state does not change', () => {
      const cb = vi.fn();
      v.add.mockReturnValue(false);
      bb.on('update', cb);
      bb.addValue('garage', 'Car');
      expect(cb.mock.calls.length).to.equal(0);
    });
  });

  describe('removeValue', () => {
    let v;
    let vcc;
    let bb;
    beforeEach(() => {
      v = {
        remove: vi.fn(),
        add: vi.fn(),
        values: vi.fn(),
      };
      vcc = vi.fn().mockReturnValue(v);
      bb = brush({ vc: vcc, rc: noop });
      bb.addValue('garage');
    });

    it('should call value.remove() with value "Car"', () => {
      bb.removeValue('garage', 'Car');
      expect(vcc.mock.calls.length).to.equal(1);
      expect(v.remove).toHaveBeenCalledWith('Car');
    });

    it('should emit "update" event when state changes', () => {
      const cb = vi.fn();
      v.remove.mockReturnValue(true);
      bb.on('update', cb);
      bb.removeValue('garage', 'Car');
      expect(v.remove).toHaveBeenCalledWith('Car');
      expect(cb.mock.calls.length).to.equal(1);
    });

    it('should not emit "update" event when state does not change', () => {
      const cb = vi.fn();
      v.remove.mockReturnValue(false);
      bb.on('update', cb);
      bb.removeValue('garage', 'Car');
      expect(v.remove).toHaveBeenCalledWith('Car');
      expect(cb.mock.calls.length).to.equal(0);
    });
  });

  function testRange(action) {
    const fn = `${action}Range`;
    describe(fn, () => {
      let v;
      let rcc;
      let bb;
      beforeEach(() => {
        v = { ranges: vi.fn() };
        v[action] = vi.fn();
        rcc = vi.fn().mockReturnValue(v);
        bb = brush({ rc: rcc, vc: noop });
        v[action].mockReturnValue(true);
      });

      it(`should call range.${action}() with { min: 3 max: 7 }`, () => {
        bb[fn]('speed', { min: 3, max: 7 });
        expect(rcc.mock.calls.length).to.equal(1);
        expect(v[action]).toHaveBeenCalledWith({ min: 3, max: 7 });
      });

      it('should not create more than one instance per id', () => {
        bb[fn]('speed', {});
        bb[fn]('speed', {});
        expect(rcc.mock.calls.length).to.equal(1);
      });

      it('should emit "start" event if not activated', () => {
        const cb = vi.fn();
        bb.on('start', cb);
        bb[fn]('speed', {});
        bb[fn]('speed', {});
        expect(cb.mock.calls.length).to.equal(1);
      });

      it('should emit "update" event', () => {
        const cb = vi.fn();
        bb.on('update', cb);
        bb[fn]('speed', {});
        expect(cb.mock.calls.length).to.equal(1);
      });

      it('should not emit "update" event when state does not change', () => {
        const cb = vi.fn();
        v[action].mockReturnValue(false);
        bb.on('update', cb);
        bb[fn]('speed', {});
        expect(cb.mock.calls.length).to.equal(0);
      });
    });
  }

  ['add', 'remove', 'toggle', 'set'].forEach(testRange);

  describe('containsValue', () => {
    let v;
    let vcc;
    let bb;
    beforeEach(() => {
      v = {
        add: vi.fn(),
        contains: vi.fn(),
      };
      vcc = vi.fn().mockReturnValue(v);
      bb = brush({ vc: vcc, rc: noop });
      bb.addKeyAlias('_ali', 'ALI');
    });

    it('should return false when given id does not exist in the brush context', () => {
      expect(bb.containsValue('garage', 3)).to.equal(false);
    });

    it('should return true when given value exists', () => {
      bb.addValue('garage');
      v.contains.mockReturnValue(true);
      expect(bb.containsValue('garage', 3)).to.equal(true);
      expect(v.contains).toHaveBeenCalledWith(3);
    });

    it('should return true when given value exists from an aliased key', () => {
      bb.addValue('_ali');
      v.contains.mockReturnValue(true);
      expect(bb.containsValue('_ali', 3)).to.equal(true);
      expect(bb.containsValue('ALI', 3)).to.equal(true);
      expect(v.contains).toHaveBeenCalledWith(3);
    });

    it('should return false when given value does not exist', () => {
      bb.addValue('garage');
      v.contains.mockReturnValue(false);
      expect(bb.containsValue('garage', 3)).to.equal(false);
      expect(v.contains).toHaveBeenCalledWith(3);
    });
  });

  describe('containsRangeValue', () => {
    let v;
    let rcc;
    let bb;
    beforeEach(() => {
      v = {
        add: vi.fn(),
        containsValue: vi.fn(),
      };
      rcc = vi.fn().mockReturnValue(v);
      bb = brush({ vc: noop, rc: rcc });
      bb.addKeyAlias('_range-ali', 'margin');
    });

    it('should return false when given id does not exist in the brush context', () => {
      expect(bb.containsRangeValue('speed')).to.equal(false);
    });

    it('should return true when given value exists', () => {
      bb.addRange('speed');
      v.containsValue.mockReturnValue(true);
      expect(bb.containsRangeValue('speed', 'some range')).to.equal(true);
      expect(v.containsValue).toHaveBeenCalledWith('some range');
    });

    it('should return true when given value exists for an aliased key', () => {
      bb.addRange('_range-ali');
      v.containsValue.mockReturnValue(true);
      expect(bb.containsRangeValue('_range-ali', 'some range')).to.equal(true);
      expect(bb.containsRangeValue('margin', 'some range')).to.equal(true);
      expect(v.containsValue).toHaveBeenCalledWith('some range');
    });

    it('should return false when given value does not exist', () => {
      bb.addRange('speed');
      v.containsValue.mockReturnValue(false);
      expect(bb.containsRangeValue('speed', 'very fast')).to.equal(false);
      expect(v.containsValue).toHaveBeenCalledWith('very fast');
    });
  });

  describe('containsRange', () => {
    let v;
    let rcc;
    let bb;
    beforeEach(() => {
      v = {
        add: vi.fn(),
        containsRange: vi.fn(),
      };
      rcc = vi.fn().mockReturnValue(v);
      bb = brush({ vc: noop, rc: rcc });
      bb.addKeyAlias('_range-ali', 'margin');
    });

    it('should return false when given id does not exist in the brush context', () => {
      expect(bb.containsRange('speed')).to.equal(false);
    });

    it('should return true when given value exists', () => {
      bb.addRange('speed');
      v.containsRange.mockReturnValue(true);
      expect(bb.containsRange('speed', 'some range')).to.equal(true);
      expect(v.containsRange).toHaveBeenCalledWith('some range');
    });

    it('should return true when given value exists for an aliased key', () => {
      bb.addRange('_range-ali');
      v.containsRange.mockReturnValue(true);
      expect(bb.containsRange('_range-ali', 'some range')).to.equal(true);
      expect(bb.containsRange('margin', 'some range')).to.equal(true);
      expect(v.containsRange).toHaveBeenCalledWith('some range');
    });

    it('should return false when given value does not exist', () => {
      bb.addRange('speed');
      v.containsRange.mockReturnValue(false);
      expect(bb.containsRange('speed', 'very fast')).to.equal(false);
      expect(v.containsRange).toHaveBeenCalledWith('very fast');
    });
  });

  describe('clear', () => {
    it('should not emit an "update" event when state has not changed', () => {
      const cb = vi.fn();
      vc.add.mockReturnValue(true);
      vc.values.mockReturnValue([]);
      b.addValue('products', 'cars');
      b.on('update', cb);
      b.clear();
      expect(cb.mock.calls.length).to.equal(0);
    });

    it('should emit an "update" event when state has changed', () => {
      const cb = vi.fn();
      b.addValue('products', 'whatevz');
      vc.values.mockReturnValue(['whatwhat']);
      b.on('update', cb);
      b.clear();
      expect(cb.mock.calls.length).to.equal(1);
    });
  });

  describe('containsData', () => {
    let v;
    let rcc;
    let bb;
    let d;

    let val;
    let vcc;

    beforeEach(() => {
      v = {
        add: vi.fn(),
        containsValue: vi.fn(),
        containsRange: vi.fn(),
      };
      val = {
        add: vi.fn(),
        contains: vi.fn(),
      };
      rcc = vi.fn().mockReturnValue(v);
      vcc = vi.fn().mockReturnValue(val);
      bb = brush({ vc: vcc, rc: rcc });
      d = {
        x: { value: 7, source: { field: 'sales', type: 'quant' } },
        span: { value: [5, 10], source: { field: 'margin', type: 'quant' } },
        self: { value: 'Cars', source: { field: 'products' } },
      };
    });

    it('should return true when data contains a brushed range', () => {
      bb.addRange('sales');
      v.containsValue.mockReturnValue(true);
      expect(bb.containsMappedData(d)).to.equal(true);
      expect(v.containsValue).toHaveBeenCalledWith(7);
    });

    it('should return true when data contains a brushed range value', () => {
      bb.addRange('margin');
      v.containsRange.mockReturnValue(true);
      expect(bb.containsMappedData(d)).to.equal(true);
      expect(v.containsRange).toHaveBeenCalledWith({ min: 5, max: 10 });
    });

    it('should return false when data contains only a brushed range and mode=and', () => {
      bb.addRange('sales');
      v.containsValue.mockReturnValue(true);
      val.contains.mockReturnValue(false);
      expect(bb.containsMappedData(d, ['x', 'self'], 'and')).to.equal(false);
      expect(v.containsValue).toHaveBeenCalledWith(7);
    });

    it('should return true when data contains only a brushed range and mode=xor', () => {
      bb.addRange('sales');
      v.containsValue.mockReturnValue(true);
      val.contains.mockReturnValue(false);
      expect(bb.containsMappedData(d, ['x', 'self'], 'xor')).to.equal(true);
      expect(v.containsValue).toHaveBeenCalledWith(7);
    });

    it('should return true when data contains a brushed value', () => {
      bb.addValue('products');
      val.contains.mockReturnValue(true);
      expect(bb.containsMappedData(d)).to.equal(true);
      expect(val.contains).toHaveBeenCalledWith('Cars');
    });

    it('should return true when data contains a brushed value from an aliased key', () => {
      const aliasedData = {
        ali: { value: 'Bikes', source: { field: '_alias' } },
      };
      bb.addKeyAlias('_alias', 'products');
      bb.addValue('products');
      val.contains.mockReturnValue(true);
      expect(bb.containsMappedData(aliasedData)).to.equal(true);
      expect(val.contains).toHaveBeenCalledWith('Bikes');
    });

    it('should return true when data contains a brushed value from a data source with a key', () => {
      bb.addValue('corp/products');
      val.contains.mockReturnValue(true);
      expect(bb.containsMappedData({ value: 'Cars', source: { field: 'products', key: 'corp' } })).to.equal(true);
      expect(val.contains).toHaveBeenCalledWith('Cars');
    });

    it('should return false when data has no source', () => {
      bb.addRange('sales');
      v.containsValue.mockReturnValue(true);
      expect(
        bb.containsMappedData({
          x: { value: 7 },
        }),
      ).to.equal(false);
      expect(v.containsValue.mock.calls.length).to.equal(0);
    });

    it('should return false when brushed data is not part of property filter', () => {
      bb.addValue('products');
      val.contains.mockReturnValue(true);
      expect(bb.containsMappedData(d, ['nope'])).to.equal(false);
      expect(val.contains).toHaveBeenCalledWith('Cars');
    });

    it('should return false when brushed data is not part of property filter for mode=and', () => {
      bb.addValue('products');
      val.contains.mockReturnValue(true);
      expect(bb.containsMappedData(d, ['nope'], 'and')).to.equal(false);
      expect(val.contains).toHaveBeenCalledWith('Cars');
    });

    it('should return false when brushed data is not part of property filter for mode=xor ', () => {
      bb.addValue('products');
      val.contains.mockReturnValue(true);
      expect(bb.containsMappedData(d, ['nope'], 'xor')).to.equal(false);
      expect(val.contains).toHaveBeenCalledWith('Cars');
    });
  });

  describe('toggle', () => {
    let v;
    let vcoll;

    beforeEach(() => {
      v = {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
      };
      vcoll = vi.fn().mockReturnValue(v);
    });

    it('should toggle duplicate values', () => {
      const items = [
        { key: 'products', value: 'Bike' },
        { key: 'regions', value: 'south' },
        { key: 'regions', value: 'south' },
        { key: 'products', value: 'Bike' },
        { key: 'products', value: 'Bike' },
        { key: 'products', value: 'Bike' },
      ];
      const toggled = toggle({
        items,
        vc: vcoll,
        values: {},
      });

      expect(toggled).to.deep.equal([
        [
          { id: 'products', values: ['Bike'] },
          { id: 'regions', values: ['south'] },
        ],
        [],
      ]);
    });

    it('should toggle on new values', () => {
      const items = [
        { key: 'products', value: 'Bike' },
        { key: 'products', value: 0 },
      ];
      const toggled = toggle({
        items,
        vc: vcoll,
        values: {},
      });

      const expectAdded = [{ id: 'products', values: ['Bike', 0] }];
      expect(toggled[0]).to.eql(expectAdded);
    });

    it('should toggle off existing values', () => {
      const items = [
        { key: 'products', value: 'Bike' },
        { key: 'products', value: 'Existing' },
        { key: 'products', value: 'Car' },
      ];
      v.contains.mockImplementation((value) => value === 'Existing');
      const toggled = toggle({
        items,
        vc: vcoll,
        values: {},
      });

      const expectRemoved = [{ id: 'products', values: ['Existing'] }];
      expect(toggled[1]).to.eql(expectRemoved);
    });
  });

  describe('set', () => {
    let v;
    let vcoll;

    beforeEach(() => {
      v = {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
        values: vi.fn(),
      };
      vcoll = vi.fn().mockReturnValue(v);
    });

    it('should add the new values', () => {
      const items = [{ key: 'products', value: 'Bike' }];
      const changed = set({
        items,
        vc: vcoll,
        vCollection: {},
      });

      expect(changed[0]).to.eql([{ id: 'products', values: ['Bike'] }]);
    });

    it('should not add existing values', () => {
      v.values.mockReturnValue(['Bike']); // existing values
      const items = [
        { key: 'products', value: 'Bike' }, // new values
      ];
      v.contains.mockReturnValue(true);
      const changed = set({
        items,
        vc: vcoll,
        vCollection: {
          products: v,
        },
      });

      expect(changed[0]).to.eql([]);
    });

    it('should not remove existing values', () => {
      v.values.mockReturnValue(['Bike']); // existing values
      const items = [
        { key: 'products', value: 'Bike' }, // new values
      ];
      v.contains.mockReturnValue(true);
      const changed = set({
        items,
        vc: vcoll,
        vCollection: {
          products: v,
        },
      });

      expect(changed[1]).to.eql([]);
    });

    it('should remove old values from same collection', () => {
      v.values.mockReturnValue([0, 'Cars', 'Skateboards']); // existing values
      const items = [
        { key: 'products', value: 'Bike' }, // new value
        { key: 'products', value: 'Skateboards' }, // add existing value
      ];
      v.contains.mockImplementation((value) => value === 'Cars' || value === 0);
      const changed = set({
        items,
        vc: vcoll,
        vCollection: {
          products: v,
        },
      });

      expect(changed[1]).to.eql([{ id: 'products', values: [0, 'Cars'] }]);
    });

    it('should remove old values', () => {
      v.values.mockReturnValue(['Cars', 'Skateboards']); // existing values
      const items = [];
      const changed = set({
        items,
        vc: vcoll,
        vCollection: {
          products: v,
        },
      });

      expect(changed[1]).to.eql([{ id: 'products', values: ['Cars', 'Skateboards'] }]);
    });

    it('should set duplicate values', () => {
      const items = [
        { key: 'products', value: 'Bike' },
        { key: 'regions', value: 'south' },
        { key: 'regions', value: 'south' },
        { key: 'products', value: 'Bike' },
        { key: 'products', value: 'Bike' },
        { key: 'products', value: 'Bike' },
      ];
      const changed = set({
        items,
        vc: vcoll,
        vCollection: {},
      });

      expect(changed).to.deep.equal([
        [
          { id: 'products', values: ['Bike'] },
          { id: 'regions', values: ['south'] },
        ],
        [],
      ]);
    });
  });

  describe('interceptors', () => {
    let cb;
    let interceptor;
    beforeEach(() => {
      cb = vi.fn();
      b.on('update', cb);

      interceptor = vi.fn().mockReturnValue([{ key: 'intercepted', value: 'yes' }]);
      b.intercept('add-values', interceptor);

      vc.add.mockReturnValue(true);
    });

    it('should intercept "add-values"', () => {
      b.addValue('products', 'cars');
      expect(interceptor).toHaveBeenCalledWith([{ key: 'products', value: 'cars' }]);
    });

    it('should be updated with the values returned from the interceptor', () => {
      b.addValue('products', 'cars');
      expect(cb).toHaveBeenCalledWith([{ id: 'intercepted', values: ['yes'] }], []);
    });

    it('should remove the interceptor', () => {
      b.removeInterceptor('add-values', interceptor);
      b.addValue('products', 'cars');
      expect(interceptor.mock.calls.length).to.equal(0);
    });

    it('should remove all interceptors', () => {
      const toggleInterceptor = () => {};
      b.intercept('toggle-values', toggleInterceptor);

      const rem = vi.spyOn(b, 'removeInterceptor');
      b.removeAllInterceptors();

      expect(rem.mock.calls[0]).toEqual(['add-values', interceptor]);
      expect(rem.mock.calls[1]).toEqual(['toggle-values', toggleInterceptor]);
    });

    it('should remove all named interceptors', () => {
      const toggleInterceptor = () => {};
      b.intercept('toggle-values', toggleInterceptor);

      const rem = vi.spyOn(b, 'removeInterceptor');
      b.removeAllInterceptors('add-values');

      expect(rem.mock.calls.length).to.equal(1);
      expect(rem.mock.calls[0]).toEqual(['add-values', interceptor]);
    });
  });

  describe('addAndRemoveValues', () => {
    let v;
    let vcc;
    let bb;
    let valuesToAdd;
    let valuesToRemove;
    beforeEach(() => {
      v = {
        remove: vi.fn(),
        add: vi.fn(),
        values: vi.fn(),
      };
      vcc = vi.fn().mockReturnValue(v);
      bb = brush({ vc: vcc, rc: noop });
      bb.addValue('garage');

      valuesToAdd = [{ key: 'garage', value: 'Car' }];
      valuesToRemove = [{ key: 'garage', value: 'Bike' }];
    });

    it('should call value.remove() with value "Car"', () => {
      bb.addAndRemoveValues(valuesToAdd, valuesToRemove);
      expect(v.add).toHaveBeenCalledWith('Car');
      expect(v.remove).toHaveBeenCalledWith('Bike');
    });

    it('should emit "update" event when state changes (by add)', () => {
      const cb = vi.fn();
      v.add.mockReturnValue(true);
      v.remove.mockReturnValue(false);
      bb.on('update', cb);
      bb.addAndRemoveValues(valuesToAdd, valuesToRemove);
      expect(v.add).toHaveBeenCalledWith('Car');
      expect(v.remove).toHaveBeenCalledWith('Bike');
      expect(cb.mock.calls.length).to.equal(1);
    });

    it('should emit "update" event when state changes (by remove)', () => {
      const cb = vi.fn();
      v.add.mockReturnValue(false);
      v.remove.mockReturnValue(true);
      bb.on('update', cb);
      bb.addAndRemoveValues(valuesToAdd, valuesToRemove);
      expect(v.add).toHaveBeenCalledWith('Car');
      expect(v.remove).toHaveBeenCalledWith('Bike');
      expect(cb.mock.calls.length).to.equal(1);
    });

    it('should emit "update" event once when state changes by add and remove', () => {
      const cb = vi.fn();
      v.add.mockReturnValue(true);
      v.remove.mockReturnValue(true);
      bb.on('update', cb);
      bb.addAndRemoveValues(valuesToAdd, valuesToRemove);
      expect(v.add).toHaveBeenCalledWith('Car');
      expect(v.remove).toHaveBeenCalledWith('Bike');
      expect(cb.mock.calls.length).to.equal(1);
    });

    it('should not emit "update" event when state does not change', () => {
      const cb = vi.fn();
      v.add.mockReturnValue(false);
      v.remove.mockReturnValue(false);
      bb.on('update', cb);
      bb.addAndRemoveValues(valuesToAdd, valuesToRemove);
      expect(v.add).toHaveBeenCalledWith('Car');
      expect(v.remove).toHaveBeenCalledWith('Bike');
      expect(cb.mock.calls.length).to.equal(0);
    });
  });

  describe('link', () => {
    it('should throw when linking to itself', () => {
      const source = brush();
      const fn = () => {
        source.link(source);
      };
      expect(fn).to.throw();
    });

    it('target should maintain same state as source', () => {
      const source = brush();
      const target = brush();
      source.link(target);
      source.setValues([{ key: 'region', values: ['E'] }]);
      expect(source._state()).to.eql(target._state());
      source.addValue('region', 'A');
      source.addValue('region', 'B');
      expect(source._state()).to.eql(target._state());
      source.toggleValue('region', 'C');
      expect(source._state()).to.eql(target._state());
      source.removeValue('region', 'B');
      expect(source._state()).to.eql(target._state());
      source.setRange('sales', { min: 10, max: 15 });
      expect(source._state()).to.eql(target._state());
      source.addRange('sales', { min: 8, max: 15 });
      expect(source._state()).to.eql(target._state());
      source.removeRange('sales', { min: 9, max: 12 });
      expect(source._state()).to.eql(target._state());
      source.toggleRange('sales', { min: 20, max: 22 });
      expect(source._state()).to.eql(target._state());
      source.clear();
      expect(source._state()).to.eql(target._state());
    });

    it('should hook into same state', () => {
      const source = brush();
      source.addValue('region', 'A');
      source.addValue('region', 'B');
      source.toggleValue('region', 'C');
      source.removeValue('region', 'B');

      const target = brush();
      source.link(target);
      expect(source._state()).to.eql(target._state());
    });
  });

  describe('configure', () => {
    let configureSpy;
    let updateSpy;

    beforeEach(() => {
      configureSpy = vi.fn();
      updateSpy = vi.fn();
      rc = vi.fn().mockReturnValue({
        add: () => {},
        configure: configureSpy,
      });

      b = brush({ rc });
      b.on('update', updateSpy);
    });

    describe('ranges', () => {
      it('should be able to configure sourced and default', () => {
        const config = {
          ranges: [
            { includeMin: 0, includeMax: 1 },
            { key: 'key', includeMin: 123 },
            { key: 'another key', includeMin: '123', includeMax: 321 },
          ],
        };

        b.configure(config);

        b.addRange('key', { min: 0, max: 1 });
        expect(rc).toHaveBeenCalledWith({ includeMin: 123, includeMax: true });
        rc.mockClear();

        b.addRange('another key', { min: 0, max: 1 });
        expect(rc).toHaveBeenCalledWith({ includeMin: '123', includeMax: 321 });
        rc.mockClear();

        b.addRange('default', { min: 0, max: 1 });
        expect(rc).toHaveBeenCalledWith({ includeMin: 0, includeMax: 1 });
        rc.mockClear();

        expect(configureSpy).not.toHaveBeenCalled();
        expect(updateSpy).toHaveBeenCalledWith([], []);
      });

      it('should be able to configure only default values', () => {
        const config = {
          ranges: [{ includeMin: 123, includeMax: 321 }],
        };

        b.configure(config);

        b.addRange('key', { min: 0, max: 1 });
        expect(rc).toHaveBeenCalledWith({ includeMin: 123, includeMax: 321 });

        expect(configureSpy).not.toHaveBeenCalled();
        expect(updateSpy).toHaveBeenCalledWith([], []);
      });

      it('should be able to configure only sourced values', () => {
        const config = {
          ranges: [
            { key: 'key', includeMin: false, includeMax: true },
            { key: 'another key', includeMin: true, includeMax: false },
          ],
        };

        b.configure(config);

        b.addRange('key', { min: 0, max: 1 });
        expect(rc).toHaveBeenCalledWith({ includeMin: false, includeMax: true });
        rc.mockClear();

        b.addRange('another key', { min: 0, max: 1 });
        expect(rc).toHaveBeenCalledWith({ includeMin: true, includeMax: false });
        rc.mockClear();

        b.addRange('default', { min: 0, max: 1 });
        expect(rc).toHaveBeenCalledWith({ includeMin: true, includeMax: true });
        rc.mockClear();

        expect(configureSpy).not.toHaveBeenCalled();
        expect(updateSpy).toHaveBeenCalledWith([], []);
      });

      it('should handle configure call without any parameter', () => {
        b.configure();

        b.addRange('key', { min: 0, max: 1 });
        expect(rc).toHaveBeenCalledWith({ includeMin: true, includeMax: true });
        expect(configureSpy).not.toHaveBeenCalled();
      });

      it('should update ranges with new configuration', () => {
        b.configure();

        b.addRange('key', { min: 0, max: 1 });
        expect(rc).toHaveBeenCalledWith({ includeMin: true, includeMax: true });
        expect(configureSpy).not.toHaveBeenCalled();
        expect(updateSpy).not.toHaveBeenCalled();

        b.configure({ ranges: [{ includeMin: false }] });

        expect(configureSpy).toHaveBeenCalledWith({ includeMin: false, includeMax: true });
        expect(updateSpy).toHaveBeenCalledWith([], []);
      });
    });
  });
});
