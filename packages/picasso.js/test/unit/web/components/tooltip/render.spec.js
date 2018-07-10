import render from '../../../../../src/web/components/tooltip/render';

describe('render', () => {
  let context;
  let placement;

  beforeEach(() => {
    placement = {
      style: {
        left: 1,
        top: 2,
      },
    };
    context = {
      renderer: { render: sinon.spy() },
      h: sinon.stub().returns('CALLED'),
      style: {
        tooltip: {
          testStyle: 'testing',
        },
        arrow: {
          arrowTestStyle: 'test2',
        },
      },
      props: {
        content: sinon.spy(),
        tooltipClass: {
          testClass: true,
        },
        arrowClass: {
          class: true,
        },
      },
    };
  });

  it('should render content', () => {
    const items = [0, 1, 2];
    render(items, placement, context);

    // Content call
    expect(context.h.args[0][0]).to.equal('div');
    expect(context.h.args[0][1]).to.containSubset({
      style: {
        testStyle: 'testing',
      },
      class: {
        testClass: true,
      },
    });

    // Arrow call
    expect(context.h.args[1][1]).to.containSubset({
      class: {
        class: true,
      },
      style: {
        arrowTestStyle: 'test2',
      },
    });

    // Container call
    expect(context.h.args[2][1]).to.containSubset({
      style: {
        display: 'inline-block',
        position: 'relative',
        left: 1,
        top: 2,
      },
    });

    expect(context.props.content).to.have.been.calledWith({
      h: context.h,
      style: context.style,
      items,
      props: context.props,
    });

    expect(context.renderer.render).to.have.been.calledWith(['CALLED']);
  });
});
