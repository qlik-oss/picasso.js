import { create } from '../../../../src/core/charts/scales';

describe('scales', () => {
  let deps;
  let scaleFn;
  beforeEach(() => {
    deps = {
      scale: {
        has: sinon.stub(),
        get: sinon.stub()
      }
    };
    scaleFn = () => ({
      min: () => 0,
      max: () => 1
    });
  });
  it('should not throw when source options is not provided', () => {
    const fn = () => create({}, null, deps);
    expect(fn).to.not.throw();
  });

  it('should create a scale of a specific type', () => {
    deps.scale.has.withArgs('custom').returns(true);
    deps.scale.get.returns(scaleFn);
    const s = create({
      type: 'custom'
    }, null, deps);
    expect(s.type).to.equal('custom');
  });

  it('should create linear scale when no better type fits', () => {
    deps.scale.has.withArgs('linear').returns(true);
    deps.scale.get.returns(scaleFn);
    const s = create({}, null, deps);
    expect(s.type).to.equal('linear');
    expect(s.min()).to.equal(0);
    expect(s.max()).to.equal(1);
  });

  it('should create linear scale when source fields are measures', () => {
    deps.scale.has.withArgs('linear').returns(true);
    deps.scale.get.returns(scaleFn);
    const dataset = {
      field: sinon.stub()
    };
    const datasetFn = () => dataset;

    dataset.field.withArgs('m1').returns({
      type: () => 'measure',
      min: () => 0,
      max: () => 1
    });
    dataset.field.withArgs('m2').returns({
      type: () => 'measure',
      min: () => 0,
      max: () => 1
    });
    const s = create({
      data: {
        fields: ['m1', 'm2']
      }
    }, datasetFn, deps);
    expect(s.type).to.equal('linear');
  });

  it('should create sequential color scale when source fields are measures and type is color', () => {
    deps.scale.has.withArgs('sequential-color').returns(true);
    deps.scale.get.returns(scaleFn);
    const dataset = {
      field: sinon.stub()
    };
    const datasetFn = () => dataset;

    dataset.field.withArgs('m1').returns({
      type: () => 'measure',
      min: () => 0,
      max: () => 1
    });
    const s = create({
      type: 'color',
      data: {
        fields: ['m1']
      }
    }, datasetFn, deps);
    expect(s.type).to.equal('sequential-color');
  });

  it('should create band scale when source fields are dimensions', () => {
    deps.scale.has.withArgs('band').returns(true);
    deps.scale.get.returns(scaleFn);
    const dataset = {
      field: sinon.stub()
    };
    const datasetFn = () => dataset;

    dataset.field.withArgs('d1').returns({
      type: () => 'dimension',
      values: () => [],
      min: () => 2015,
      max: () => 2017
    });
    const s = create({
      data: {
        fields: ['d1']
      }
    }, { dataset: datasetFn }, deps);
    expect(s.type).to.equal('band');
  });

  it('should create categorical-color scale when source fields are dimensions and type is color', () => {
    deps.scale.has.withArgs('categorical-color').returns(true);
    deps.scale.get.returns(scaleFn);
    const dataset = {
      field: sinon.stub()
    };
    const datasetFn = () => dataset;

    dataset.field.withArgs('d1').returns({
      type: () => 'dimension',
      values: () => [],
      min: () => 2015,
      max: () => 2017
    });
    const s = create({
      type: 'color',
      data: {
        fields: ['d1']
      }
    }, { dataset: datasetFn }, deps);
    expect(s.type).to.equal('categorical-color');
  });

  it('should create h-band scale when data is hierarchical', () => {
    deps.scale.has.withArgs('h-band').returns(true);
    deps.scale.get.returns(scaleFn);
    const dataset = {
      hierarchy: sinon.stub().returns({}),
      fields: () => []
    };
    const datasetFn = () => dataset;
    const s = create({
      data: { hierarchy: {} }
    }, { dataset: datasetFn }, deps);

    expect(s.type).to.equal('h-band');
  });
});
