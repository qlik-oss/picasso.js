import rendererRegistry from '..';

describe('renderer', () => {
  let renderer;
  beforeEach(() => {
    renderer = rendererRegistry();
    renderer.register('foo', () => 'whatevz');
    renderer.register('bar', () => 'stapel');
  });

  it('should be a function', () => {
    expect(renderer).to.be.a('function');
  });

  it.skip('should throw error when type does not exist', () => {
    // TODO - decide how to handle non-existent types in registry.js
    expect(renderer.bind(renderer, 'dummy')).to.throw("Renderer of type 'dummy' does not exist");
  });

  it('should create a specific type', () => {
    expect(renderer('bar')()).to.equal('stapel');
  });

  it('should use default renderer when argument is ommitted', () => {
    renderer.default('bar');
    expect(renderer()()).to.equal('stapel');
  });

  it('should change default', () => {
    renderer.prio(['bar', 'foo']); // prio is temporary due to backwards compatibility
    expect(renderer.prio()).to.deep.equal(['bar']);
    expect(renderer()()).to.equal('stapel');
  });
});
