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
    sandbox = vi;
    hammer.default.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register hammer interaction when parameter is recognized as picasso', () => {
    hammer.default.mockReturnValue('plugin');
    const picasso = {
      interaction: vi.fn(),
    };
    global.Hammer = 'H';
    plugin(picasso);
    delete global.Hammer;

    expect(picasso.interaction).toHaveBeenCalledWith('hammer', 'plugin');
  });

  it('should return plugin when parameter is not picasso', () => {
    hammer.default.mockReturnValue('plugin');
    const Hammer = 'HH';
    const p = plugin(Hammer);

    const picasso = {
      interaction: vi.fn(),
    };

    p(picasso);

    expect(picasso.interaction).toHaveBeenCalledWith('hammer', 'plugin');
  });
});
