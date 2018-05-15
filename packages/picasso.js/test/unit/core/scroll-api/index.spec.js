import scrollApi from '../../../../src/core/scroll-api';

describe('Scroll api', () => {
  let scroll;
  beforeEach(() => {
    scroll = scrollApi();
  });

  it('scroll start at zero', () => {
    expect(scroll.getState().start).to.equals(0);
  });

  it('limit scroll to valid range on moveTo', () => {
    scroll.update({ min: 0, max: 100, viewSize: 10 });
    scroll.moveTo(200);
    expect(scroll.getState().start).to.equals(90);
  });

  it('limit scroll to valid range on update', () => {
    scroll.update({ min: 100, max: 200, viewSize: 10 });
    expect(scroll.getState().start).to.equals(100);
  });

  it('keep old value if not updated', () => {
    scroll.update({ min: 100, max: 200, viewSize: 10 });
    expect(scroll.getState()).to.deep.equals({
      start: 100, viewSize: 10, min: 100, max: 200
    });
    scroll.update({ viewSize: 20 });
    expect(scroll.getState()).to.deep.equals({
      start: 100, viewSize: 20, min: 100, max: 200
    });
  });

  it('trigger update event on viewSize change', () => {
    const fn = sinon.stub();
    scroll.on('update', fn);
    scroll.update({ min: 0, max: 200, viewSize: 10 });

    expect(fn).to.have.been.calledOnce;
  });
  it('should only trigger update once if viewSize and start changes', () => {
    const fn = sinon.stub();
    scroll.on('update', fn);
    scroll.update({ min: 100, max: 200, viewSize: 10 });

    expect(fn).to.have.been.calledOnce;
  });
});
