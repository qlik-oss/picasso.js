import * as hammer from '../hammer';
import plugin from '..';
import { vi } from 'vitest';

vi.mock('../hammer', async (importOriginal) => ({
  ...(await importOriginal()),
  default: vi.fn(),
}));

describe('plugin', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    hammer.default.mockReset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should register hammer interaction when parameter is recognized as picasso', () => {
    hammer.default.mockReturnValue('plugin');
    const picasso = {
      interaction: sandbox.spy(),
    };
    global.Hammer = 'H';
    plugin(picasso);
    delete global.Hammer;

    expect(picasso.interaction).to.have.been.calledWithExactly('hammer', 'plugin');
  });

  it('should return plugin when parameter is not picasso', () => {
    hammer.default.mockReturnValue('plugin');
    const Hammer = 'HH';
    const p = plugin(Hammer);

    const picasso = {
      interaction: sandbox.spy(),
    };

    p(picasso);

    expect(picasso.interaction).to.have.been.calledWithExactly('hammer', 'plugin');
  });
});
