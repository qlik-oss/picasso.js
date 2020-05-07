describe('plugin', () => {
  let plugin;
  let hammer;
  let sandbox;
  before(() => {
    sandbox = sinon.createSandbox();
    hammer = sandbox.stub();
    [{ default: plugin }] = aw.mock([['**/hammer.js', () => hammer]], ['../index.js']);
  });

  it('should register hammer interaction when parameter is recognized as picasso', () => {
    hammer.withArgs('H').returns('plugin');
    const picasso = {
      interaction: sandbox.spy(),
    };
    global.Hammer = 'H';
    plugin(picasso);
    delete global.Hammer;

    expect(picasso.interaction).to.have.been.calledWithExactly('hammer', 'plugin');
  });

  it('should return plugin when parameter is not picasso', () => {
    hammer.withArgs('HH').returns('plugin');
    const Hammer = 'HH';
    const p = plugin(Hammer);

    const picasso = {
      interaction: sandbox.spy(),
    };

    p(picasso);

    expect(picasso.interaction).to.have.been.calledWithExactly('hammer', 'plugin');
  });
});
