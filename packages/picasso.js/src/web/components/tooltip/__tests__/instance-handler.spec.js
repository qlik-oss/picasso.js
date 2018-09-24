import {
  setActive,
  removeActive,
  cancelActive,
  getActive,
  remove
} from '../instance-handler';

describe('Instance handler', () => {
  beforeEach(() => {
    remove();
  });

  it('setActive', () => {
    const a = () => 'a1';

    setActive(a);
    expect(getActive()).to.deep.equal(a);
  });

  it('removeActive', () => {
    const a = () => 'a';
    setActive(a);
    expect(removeActive(a)).to.be.true;
    expect(getActive()).to.be.null;
  });

  it('cancelActive', () => {
    const spy = sinon.spy();
    setActive(spy);
    cancelActive();

    expect(spy).to.have.been.calledOnce;
  });
});
