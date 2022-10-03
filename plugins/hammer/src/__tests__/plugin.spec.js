import * as hammer from '../hammer';
import plugin from '..';

describe('plugin', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(hammer, 'default');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should register hammer interaction when parameter is recognized as picasso', () => {
    hammer.default.withArgs('H').returns('plugin');
    const picasso = {
      interaction: sandbox.spy(),
    };
    global.Hammer = 'H';
    plugin(picasso);
    delete global.Hammer;

    expect(picasso.interaction).to.have.been.calledWithExactly('hammer', 'plugin');
  });

  it('should return plugin when parameter is not picasso', () => {
    hammer.default.withArgs('HH').returns('plugin');
    const Hammer = 'HH';
    const p = plugin(Hammer);

    const picasso = {
      interaction: sandbox.spy(),
    };

    p(picasso);

    expect(picasso.interaction).to.have.been.calledWithExactly('hammer', 'plugin');
  });
});
