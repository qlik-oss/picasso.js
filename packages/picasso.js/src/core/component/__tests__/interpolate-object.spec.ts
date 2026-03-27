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

  it('should interpolate string as color if the key is one of the color keys', () => {
    source = { stroke: 'Red', fill: 'Green', backgroundColor: 'Blue' };
    target = { stroke: 'Green', fill: 'Blue', backgroundColor: 'Red' };
    expect(interpolateObject(source, target)(0.5)).to.deep.equal({
      stroke: 'rgb(128, 64, 0)',
      fill: 'rgb(0, 64, 128)',
      backgroundColor: 'rgb(128, 0, 128)',
    });
  });

  it('should NOT interpolate string as color if the key is NOT one of the color keys', () => {
    source = { label: 'Red', text: 'Green' };
    target = { label: 'Blue', text: 'Blue' };
    expect(interpolateObject(source, target)(0.5)).to.deep.equal({ label: 'Blue', text: 'Blue' });
  });

  it('should NOT interpolate string as color if the color is just a part of the string', () => {
    source = { fill: '300rem 12px Red' };
    target = { fill: '600rem 20px Blue' };
    expect(interpolateObject(source, target)(0.5)).to.deep.equal({ fill: '450rem 16px Blue' });
  });
});
