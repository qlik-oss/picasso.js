import * as getValue from '../../utils/object/get-value';
import * as setValue from '../../utils/object/set-value';
import createStorage from '..';

describe('storage', () => {
  let sandbox;
  let source;
  let create;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(getValue, 'default');
    sandbox.stub(setValue, 'default');
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
        expect(getValue.default.withArgs(source, 'cat.leg.toe', 'small')).to.have.been.calledOnce;
      });
    });

    describe('setValue', () => {
      it('should call external setValue function with correct params', () => {
        api.setValue('dog.tail', 'fluffy');
        expect(setValue.default.withArgs(source, 'dog.tail', 'fluffy')).to.have.been.calledOnce;
      });
    });
  });
});
