import * as hammer from '../hammer';
import plugin from '..';

interface SinonSandbox {
  stub(obj: any, method: string): any;
  restore(): void;
  spy(): any;
}

describe('plugin', () => {
  let sandbox: SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(hammer, 'default');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should register hammer interaction when parameter is recognized as picasso', () => {
    (hammer.default as any).withArgs('H').returns('plugin');
    const picasso = {
      interaction: sandbox.spy(),
    };
    (global as any).Hammer = 'H';
    plugin(picasso as any);
    delete (global as any).Hammer;

    expect((picasso.interaction as any)).to.have.been.calledWithExactly('hammer', 'plugin');
  });

  it('should return plugin when parameter is not picasso', () => {
    (hammer.default as any).withArgs('HH').returns('plugin');
    const Hammer = 'HH';
    const p = plugin(Hammer as any);

    const picasso = {
      interaction: sandbox.spy(),
    };

    (p as any)(picasso);

    expect((picasso.interaction as any)).to.have.been.calledWithExactly('hammer', 'plugin');
  });
});
