import interpolateObject from '../interpolate-object';

describe('interpolateObject', () => {
  let source;
  let target;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should interpolate object correctly when source object does not have a property in target object', () => {
    source = { x: 10, y: 200 };
    target = { x: 20, y: 600, z: 1000 };
    expect(interpolateObject(source, target)(0.5)).to.deep.equal({ x: 15, y: 400, z: 1000 });
  });

  it('should interpolate object correctly when target object does not have a property in source object', () => {
    source = { x: 10, y: 200, z: 1000 };
    target = { x: 20, y: 600 };
    expect(interpolateObject(source, target)(0.5)).to.deep.equal({ x: 15, y: 400 });
  });

  it('should interpolate string correctly when there is number and color embedded: interpolate number but NOT color', () => {
    source = { style: '300rem 12px Red', border: 'Green' };
    target = { style: '600rem 20px Blue', border: 'Blue' };
    expect(interpolateObject(source, target)(0.5)).to.deep.equal({ style: '450rem 16px Blue', border: 'Blue' });
  });
});
