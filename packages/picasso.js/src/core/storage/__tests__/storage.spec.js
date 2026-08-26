import * as getValue from '../../utils/object/get-value';
import * as setValue from '../../utils/object/set-value';
import createStorage from '..';
import { vi } from 'vitest';

vi.mock('../../utils/object/get-value', async (importOriginal) => ({
  ...(await importOriginal()),
  default: vi.fn(),
}));
vi.mock('../../utils/object/set-value', async (importOriginal) => ({
  ...(await importOriginal()),
  default: vi.fn(),
}));

describe('storage', () => {
  let sandbox;
  let source;
  let create;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    getValue.default.mockReset();
    setValue.default.mockReset();
    source = { cat: { leg: { fur: 'yellow', toe: 'cute' } }, dog: { tail: 'waggy' } };
    create = () => createStorage(source);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('api', () => {
    let api;

    beforeEach(() => {
      api = create();
    });

    describe('getAll', () => {
      it('should return the whole content', () => {
        expect(api.getAll()).to.deep.equal({ cat: { leg: { fur: 'yellow', toe: 'cute' } }, dog: { tail: 'waggy' } });
      });
    });

    describe('getValue', () => {
      it('should call external getValue function with correct params', () => {
        api.getValue('cat.leg.toe', 'small');
        expect(getValue.default.mock.calls).to.have.length(1);
        expect(getValue.default.mock.calls[0]).to.deep.equal([source, 'cat.leg.toe', 'small']);
      });
    });

    describe('setValue', () => {
      it('should call external setValue function with correct params', () => {
        api.setValue('dog.tail', 'fluffy');
        expect(setValue.default.mock.calls).to.have.length(1);
        expect(setValue.default.mock.calls[0]).to.deep.equal([source, 'dog.tail', 'fluffy']);
      });
    });
  });
});
